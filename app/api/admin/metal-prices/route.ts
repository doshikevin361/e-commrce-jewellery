import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isAdmin } from '@/lib/auth';
import { broadcastMetalPriceUpdate } from './events/route';
import { revalidatePath, revalidateTag } from 'next/cache';
import { calculateAdminProductPrice } from '@/lib/utils/admin-price-calculator';

// GET: Fetch all unique metal types and their rates from products
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Get all products with metal information
    const products = await db.collection('products').find({
      $or: [
        { hasGold: true },
        { hasSilver: true },
        { productType: 'Gold' },
        { productType: 'Silver' },
        { productType: 'Platinum' },
        { product_type: 'Gold' },
        { product_type: 'Silver' },
        { product_type: 'Platinum' },
        { 'diamonds.metalType': { $exists: true } },
      ],
    }).toArray();

    // Collect unique metal types and their rates
    const metalRates: Record<string, { rate: number; productCount: number; lastUpdated?: Date }> = {};

    products.forEach((product: any) => {
      const productType = (product.productType || product.product_type || '').toString();
      
      // Check Platinum separately FIRST (Platinum products use goldRatePerGram field but should be tracked separately)
      // Platinum products have: productType/product_type = 'Platinum', hasGold = true, goldRatePerGram = <rate>
      if (productType.toLowerCase() === 'platinum') {
        // Platinum uses goldRatePerGram field (same as Gold, but tracked separately)
        const platinumRate = product.goldRatePerGram || product.customMetalRate || 0;
        if (!metalRates['Platinum']) {
          // Initialize with first rate found (or 0 if no rate)
          metalRates['Platinum'] = { 
            rate: platinumRate > 0 ? platinumRate : 0, 
            productCount: 0 
          };
        }
        metalRates['Platinum'].productCount++;
        // Update rate if we find a non-zero rate (prefer non-zero rates)
        if (platinumRate > 0 && metalRates['Platinum'].rate === 0) {
          metalRates['Platinum'].rate = platinumRate;
        }
      } else if (product.hasGold || productType.toLowerCase() === 'gold') {
        // Check Gold (excluding Platinum - only if productType is not Platinum)
        const goldRate = product.goldRatePerGram || 0;
        if (goldRate > 0) {
          if (!metalRates['Gold']) {
            metalRates['Gold'] = { rate: goldRate, productCount: 0 };
          }
          metalRates['Gold'].productCount++;
          // Keep the most recent rate (or could average, but using first found for simplicity)
        }
      }

      if (product.hasSilver || productType === 'Silver' || productType === 'silver') {
        const silverRate = product.silverRatePerGram || 0;
        if (silverRate > 0) {
          if (!metalRates['Silver']) {
            metalRates['Silver'] = { rate: silverRate, productCount: 0 };
          }
          metalRates['Silver'].productCount++;
        }
      }

      // Check diamonds array for metal types (including Platinum)
      if (product.diamonds && Array.isArray(product.diamonds)) {
        product.diamonds.forEach((diamond: any) => {
          if (diamond.metalType) {
            const metalType = diamond.metalType;
            const metalRate = diamond.customMetalRate || 0;
            
            if (metalType === 'Platinum' || metalType === 'platinum') {
              if (!metalRates['Platinum']) {
                metalRates['Platinum'] = { rate: metalRate > 0 ? metalRate : 0, productCount: 0 };
              }
              metalRates['Platinum'].productCount++;
            } else if (metalRate > 0) {
              // For other metals, only track if rate > 0
              if (!metalRates[metalType]) {
                metalRates[metalType] = { rate: metalRate, productCount: 0 };
              }
              metalRates[metalType].productCount++;
            }
          }
        });
      }
    });

    // Get stored rates from metal_rates collection (preferred source)
    const storedRates = await db.collection('metal_rates').findOne({});
    
    // Convert to array format and filter out metals with 0 product count
    const metalRatesArray = Object.entries(metalRates)
      .filter(([_, data]) => data.productCount > 0) // Only include metals with products
      .map(([metalType, data]) => {
        // Use stored rate if available, otherwise use rate from products
        let rate = data.rate || 0;
        if (storedRates) {
          const storedRate = storedRates[metalType.toLowerCase()];
          if (storedRate && storedRate > 0) {
            rate = storedRate;
          }
        }
        return {
          metalType,
          rate: rate,
          productCount: data.productCount,
        };
      })
      .sort((a, b) => {
        // Sort: Gold first, then Silver, then Platinum, then others alphabetically
        const order: Record<string, number> = { Gold: 1, Silver: 2, Platinum: 3 };
        const aOrder = order[a.metalType] || 99;
        const bOrder = order[b.metalType] || 99;
        return aOrder - bOrder;
      });

    return NextResponse.json({ metalRates: metalRatesArray });
  } catch (error) {
    console.error('[v0] Failed to fetch metal prices:', error);
    return NextResponse.json({ error: 'Failed to fetch metal prices' }, { status: 500 });
  }
}

// PUT: Update metal rate and recalculate all affected product prices
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();
    const { metalType, newRate } = body;

    if (!metalType || typeof newRate !== 'number' || newRate <= 0) {
      return NextResponse.json(
        { error: 'Invalid request. metalType and newRate (positive number) are required.' },
        { status: 400 }
      );
    }

    const storedRates = await db.collection('metal_rates').findOne({});
    const previousRate =
      storedRates && typeof storedRates[metalType.toLowerCase()] === 'number'
        ? storedRates[metalType.toLowerCase()]
        : undefined;

    // Find all products using this metal type
    let query: any = {};
    
    const normalizedMetalType = metalType.toLowerCase();
    if (metalType === 'Gold') {
      query = {
        $and: [
          {
            $or: [
              { hasGold: true },
              { productType: { $in: ['Gold', 'gold'] } },
              { product_type: { $in: ['Gold', 'gold'] } },
              { 'diamonds.metalType': 'Gold' },
              { 'diamonds.metalType': 'gold' },
            ],
          },
          { productType: { $ne: 'Platinum' } }, // Exclude Platinum products
          { product_type: { $ne: 'Platinum' } },
        ],
      };
    } else if (metalType === 'Platinum') {
      query = {
        $or: [
          { productType: { $in: ['Platinum', 'platinum'] } },
          { product_type: { $in: ['Platinum', 'platinum'] } },
          { 'diamonds.metalType': 'Platinum' },
          { 'diamonds.metalType': 'platinum' },
        ],
      };
    } else if (metalType === 'Silver') {
      query = {
        $or: [
          { hasSilver: true },
          { productType: { $in: ['Silver', 'silver'] } },
          { product_type: { $in: ['Silver', 'silver'] } },
          { 'diamonds.metalType': 'Silver' },
          { 'diamonds.metalType': 'silver' },
        ],
      };
    } else {
      // For other metal types (like Platinum in diamonds)
      query = {
        'diamonds.metalType': metalType,
      };
    }

    const products = await db.collection('products').find(query).toArray();
    
    if (products.length === 0) {
      return NextResponse.json(
        { error: `No products found using ${metalType}` },
        { status: 404 }
      );
    }

    let updatedCount = 0;
    const updatePromises = products.map(async (product: any) => {
      try {
        // Calculate new price
        const newPrice = calculateAdminProductPrice(product, {
          goldRate: metalType === 'Gold' ? newRate : undefined,
          silverRate: metalType === 'Silver' ? newRate : undefined,
          platinumRate: metalType === 'Platinum' ? newRate : undefined,
        });

        // Prepare update object
        const updateFields: any = {
          price: newPrice,
          subTotal: newPrice,
          totalAmount: newPrice,
          updatedAt: new Date(),
        };

        // Update the metal rate in product
        const shouldUpdateCustomRate =
          product.customMetalRate === undefined ||
          product.customMetalRate === null ||
          (typeof previousRate === 'number' &&
            product.customMetalRate === previousRate);

        const productTypeValue = (product.productType || product.product_type || '')
          .toString()
          .toLowerCase();

        if (metalType === 'Gold') {
          if (product.hasGold || productTypeValue === 'gold') {
            updateFields.goldRatePerGram = newRate;
            if (shouldUpdateCustomRate) {
              updateFields.customMetalRate = newRate;
            }
          }
          // Update in diamonds array if present
          if (product.diamonds && Array.isArray(product.diamonds)) {
            updateFields.diamonds = product.diamonds.map((d: any) => {
              if ((d.metalType || '').toString().toLowerCase() === 'gold') {
                const shouldUpdateDiamondRate =
                  d.customMetalRate === undefined ||
                  d.customMetalRate === null ||
                  (typeof previousRate === 'number' &&
                    d.customMetalRate === previousRate);
                return shouldUpdateDiamondRate
                  ? { ...d, customMetalRate: newRate }
                  : d;
              }
              return d;
            });
          }
        } else if (metalType === 'Platinum') {
          if (productTypeValue === 'platinum') {
            updateFields.goldRatePerGram = newRate; // Platinum uses goldRatePerGram field
            if (shouldUpdateCustomRate) {
              updateFields.customMetalRate = newRate;
            }
          }
          // Update in diamonds array if present
          if (product.diamonds && Array.isArray(product.diamonds)) {
            updateFields.diamonds = product.diamonds.map((d: any) => {
              if ((d.metalType || '').toString().toLowerCase() === 'platinum') {
                const shouldUpdateDiamondRate =
                  d.customMetalRate === undefined ||
                  d.customMetalRate === null ||
                  (typeof previousRate === 'number' &&
                    d.customMetalRate === previousRate);
                return shouldUpdateDiamondRate
                  ? { ...d, customMetalRate: newRate }
                  : d;
              }
              return d;
            });
          }
        } else if (metalType === 'Silver') {
          if (product.hasSilver || productTypeValue === 'silver') {
            updateFields.silverRatePerGram = newRate;
            if (shouldUpdateCustomRate) {
              updateFields.customMetalRate = newRate;
            }
          }
          // Update in diamonds array if present
          if (product.diamonds && Array.isArray(product.diamonds)) {
            updateFields.diamonds = product.diamonds.map((d: any) => {
              if ((d.metalType || '').toString().toLowerCase() === 'silver') {
                const shouldUpdateDiamondRate =
                  d.customMetalRate === undefined ||
                  d.customMetalRate === null ||
                  (typeof previousRate === 'number' &&
                    d.customMetalRate === previousRate);
                return shouldUpdateDiamondRate
                  ? { ...d, customMetalRate: newRate }
                  : d;
              }
              return d;
            });
          }
        } else {
          // For other metal types, update in diamonds array
          if (product.diamonds && Array.isArray(product.diamonds)) {
            updateFields.diamonds = product.diamonds.map((d: any) => {
              if (
                (d.metalType || '').toString().toLowerCase() === normalizedMetalType
              ) {
                const shouldUpdateDiamondRate =
                  d.customMetalRate === undefined ||
                  d.customMetalRate === null ||
                  (typeof previousRate === 'number' &&
                    d.customMetalRate === previousRate);
                return shouldUpdateDiamondRate
                  ? { ...d, customMetalRate: newRate }
                  : d;
              }
              return d;
            });
          }
        }

        await db.collection('products').updateOne(
          { _id: product._id },
          { $set: updateFields }
        );

        updatedCount++;
      } catch (error) {
        console.error(`[v0] Failed to update product ${product._id}:`, error);
      }
    });

    await Promise.all(updatePromises);

    // Update metal_rates collection with current rates
    try {
      const currentRates = storedRates;
      const now = new Date();
      
      if (currentRates) {
        await db.collection('metal_rates').updateOne(
          {},
          {
            $set: {
              [metalType.toLowerCase()]: newRate,
              updatedAt: now,
            },
          }
        );
      } else {
        await db.collection('metal_rates').insertOne({
          gold: metalType === 'Gold' ? newRate : 0,
          silver: metalType === 'Silver' ? newRate : 0,
          platinum: metalType === 'Platinum' ? newRate : 0,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (error) {
      console.error('[v0] Failed to update metal_rates collection:', error);
      // Don't fail the request if this fails
    }

    // Revalidate Next.js cache for customer-facing pages
    try {
      // Revalidate homepage and product pages
      revalidatePath('/');
      revalidatePath('/api/public/homepage');
      revalidateTag('products', 'max');
      revalidateTag('homepage', 'max');
      console.log('[v0] Cache revalidated for price update');
    } catch (error) {
      console.error('[v0] Failed to revalidate cache:', error);
      // Don't fail the request if revalidation fails
    }

    // Broadcast update to all connected admin clients via SSE
    try {
      broadcastMetalPriceUpdate(metalType, newRate, updatedCount);
    } catch (error) {
      console.error('[v0] Failed to broadcast metal price update:', error);
      // Don't fail the request if broadcast fails
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} products with new ${metalType} rate of ₹${newRate}/gram. Website will refresh automatically.`,
      updatedCount,
      metalType,
      newRate,
    });
  } catch (error) {
    console.error('[v0] Failed to update metal prices:', error);
    return NextResponse.json({ error: 'Failed to update metal prices' }, { status: 500 });
  }
}
