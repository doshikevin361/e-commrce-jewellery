import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isAdmin } from '@/lib/auth';
import { broadcastMetalPriceUpdate } from './events/route';
import { revalidatePath, revalidateTag } from 'next/cache';

// Helper function to calculate product price (same logic as in product-form-page.tsx)
function calculateProductPrice(product: any, newGoldRate?: number, newSilverRate?: number, newPlatinumRate?: number): number {
  const PURITY_MAP: Record<string, number> = {
    '24kt': 1,
    '22kt': 0.92,
    '20kt': 0.84,
    '18kt': 0.75,
    '14kt': 0.583,
    '80%': 0.80,
  };

  const parsePurityPercent = (purity: string): number => {
    if (!purity) return 1;
    const lower = purity.toLowerCase().trim();
    if (PURITY_MAP[lower] !== undefined) return PURITY_MAP[lower];
    const numeric = parseFloat(purity);
    if (isFinite(numeric)) {
      // If user enters a percentage (e.g., 92), treat >24 as percent/100.
      if (numeric > 24) return Math.min(numeric / 100, 1);
      // If user enters karat (e.g., 22), convert to 24k scale.
      if (numeric > 0 && numeric <= 24) return numeric / 24;
    }
    return 1;
  };

  const productType = product.productType || product.product_type;
  const isSimpleProductType = productType === 'Gemstone' || productType === 'Imitation';
  
  // For Gemstone/Imitation, return gemstone price
  if (isSimpleProductType) {
    const gemstoneValue = product.gemstonePrice || 0;
    const platformCommissionRate = product.platformCommissionRate || 0;
    const platformCommissionValue = (platformCommissionRate > 0) 
      ? gemstoneValue * (platformCommissionRate / 100) 
      : 0;
    return gemstoneValue + platformCommissionValue;
  }

  // For Diamonds without metals
  if (productType === 'Diamonds' && !product.diamonds?.some((d: any) => d.metalType)) {
    const diamondValueAuto = (product.diamonds || []).reduce((sum: number, d: any) => sum + (d.diamondPrice || 0), 0) + (product.diamondsPrice || 0);
    const platformCommissionRate = product.platformCommissionRate || 0;
    const platformCommissionValue = (platformCommissionRate > 0) 
      ? diamondValueAuto * (platformCommissionRate / 100) 
      : 0;
    return diamondValueAuto + platformCommissionValue;
  }

  // For Diamonds with metals - calculate from diamonds array
  if (productType === 'Diamonds' && product.diamonds?.some((d: any) => d.metalType)) {
    const diamondsProductMetalValue = (product.diamonds || []).reduce((sum: number, d: any) => {
      if (d.metalType) {
        const itemMetalRate = d.metalType === 'Silver'
          ? (newSilverRate ?? d.customMetalRate ?? 0)
          : d.metalType === 'Platinum'
          ? (newPlatinumRate ?? d.customMetalRate ?? 0)
          : (newGoldRate ?? d.customMetalRate ?? 0);
        const itemPurityPercent = parsePurityPercent(d.metalPurity || '24kt');
        const itemPurityMetalRate = itemMetalRate * itemPurityPercent;
        const itemWeight = d.metalWeight || 0;
        const itemMakingCharges = d.makingCharges || 0;
        return sum + ((itemWeight * itemPurityMetalRate) + (itemWeight * itemMakingCharges));
      }
      return sum;
    }, 0);
    
    const diamondValueAuto = (product.diamonds || []).reduce((sum: number, d: any) => sum + (d.diamondPrice || 0), 0) + (product.diamondsPrice || 0);
    const platformCommissionRate = product.platformCommissionRate || 0;
    const platformCommissionBase = diamondsProductMetalValue + diamondValueAuto;
    const platformCommissionValue = (platformCommissionRate > 0) 
      ? platformCommissionBase * (platformCommissionRate / 100) 
      : 0;
    return diamondsProductMetalValue + diamondValueAuto + platformCommissionValue;
  }

  // For Gold/Silver/Platinum products
  const hasGold = product.hasGold || productType === 'Gold';
  const hasPlatinum = productType === 'Platinum';
  const hasSilver = product.hasSilver || productType === 'Silver';
  
  let goldValue = 0;
  let platinumValue = 0;
  let silverValue = 0;
  let makingChargesValue = 0;

  if (hasGold) {
    const goldWeight = product.goldWeight || product.weight || 0;
    const goldRatePerGram = newGoldRate ?? product.goldRatePerGram ?? 0;
    const goldPurity = product.goldPurity || '24kt';
    const purityPercent = parsePurityPercent(goldPurity);
    const purityMetalRate = goldRatePerGram * purityPercent;
    
    // Calculate net gold weight (subtract diamond weight if any)
    const totalDiamondWeightCt = (product.diamonds || []).reduce((sum: number, d: any) => sum + (d.diamondWeight || 0), 0);
    const netGoldWeight = Math.max(0, goldWeight - totalDiamondWeightCt - (product.lessStoneWeight || 0));
    
    goldValue = netGoldWeight * purityMetalRate;
    makingChargesValue = netGoldWeight * (product.makingChargePerGram || 0);
  }

  if (hasPlatinum) {
    const platinumWeight = product.goldWeight || product.weight || 0; // Platinum uses goldWeight field
    const platinumRatePerGram = newPlatinumRate ?? product.goldRatePerGram ?? 0; // Platinum uses goldRatePerGram field
    const platinumPurity = product.goldPurity || '24kt'; // Platinum uses goldPurity field
    const purityPercent = parsePurityPercent(platinumPurity);
    const purityMetalRate = platinumRatePerGram * purityPercent;
    
    // Calculate net platinum weight (subtract diamond weight if any)
    const totalDiamondWeightCt = (product.diamonds || []).reduce((sum: number, d: any) => sum + (d.diamondWeight || 0), 0);
    const netPlatinumWeight = Math.max(0, platinumWeight - totalDiamondWeightCt - (product.lessStoneWeight || 0));
    
    platinumValue = netPlatinumWeight * purityMetalRate;
    makingChargesValue = netPlatinumWeight * (product.makingChargePerGram || 0);
  }

  if (hasSilver) {
    const silverWeight = product.silverWeight || product.weight || 0;
    const silverRatePerGram = newSilverRate ?? product.silverRatePerGram ?? 0;
    const silverPurity = product.silverPurity || '24kt';
    const purityPercent = parsePurityPercent(silverPurity);
    const purityMetalRate = silverRatePerGram * purityPercent;
    
    silverValue = silverWeight * purityMetalRate;
    makingChargesValue = silverWeight * (product.makingChargePerGram || 0);
  }

  const diamondValueAuto = (product.diamonds || []).reduce((sum: number, d: any) => sum + (d.diamondPrice || 0), 0);
  const platformCommissionRate = product.platformCommissionRate || 0;
  const platformCommissionBase = goldValue + platinumValue + silverValue + makingChargesValue + diamondValueAuto;
  const platformCommissionValue = (platformCommissionRate > 0) 
    ? platformCommissionBase * (platformCommissionRate / 100) 
    : 0;
  const extraCharges = product.otherCharges || 0;

  return goldValue + platinumValue + silverValue + makingChargesValue + diamondValueAuto + platformCommissionValue + extraCharges;
}

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

    // Find all products using this metal type
    let query: any = {};
    
    if (metalType === 'Gold') {
      query = {
        $and: [
          {
            $or: [
              { hasGold: true },
              { productType: 'Gold' },
              { 'diamonds.metalType': 'Gold' },
            ],
          },
          { productType: { $ne: 'Platinum' } }, // Exclude Platinum products
        ],
      };
    } else if (metalType === 'Platinum') {
      query = {
        $or: [
          { productType: 'Platinum' },
          { 'diamonds.metalType': 'Platinum' },
        ],
      };
    } else if (metalType === 'Silver') {
      query = {
        $or: [
          { hasSilver: true },
          { productType: 'Silver' },
          { 'diamonds.metalType': 'Silver' },
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
        const newPrice = calculateProductPrice(
          product,
          metalType === 'Gold' ? newRate : undefined,
          metalType === 'Silver' ? newRate : undefined,
          metalType === 'Platinum' ? newRate : undefined
        );

        // Prepare update object
        const updateFields: any = {
          price: newPrice,
          subTotal: newPrice,
          totalAmount: newPrice,
          updatedAt: new Date(),
        };

        // Update the metal rate in product
        if (metalType === 'Gold') {
          if (product.hasGold || (product.productType || product.product_type) === 'Gold') {
            updateFields.goldRatePerGram = newRate;
          }
          // Update in diamonds array if present
          if (product.diamonds && Array.isArray(product.diamonds)) {
            updateFields.diamonds = product.diamonds.map((d: any) => {
              if (d.metalType === 'Gold') {
                return { ...d, customMetalRate: newRate };
              }
              return d;
            });
          }
        } else if (metalType === 'Platinum') {
          if ((product.productType || product.product_type) === 'Platinum') {
            updateFields.goldRatePerGram = newRate; // Platinum uses goldRatePerGram field
          }
          // Update in diamonds array if present
          if (product.diamonds && Array.isArray(product.diamonds)) {
            updateFields.diamonds = product.diamonds.map((d: any) => {
              if (d.metalType === 'Platinum') {
                return { ...d, customMetalRate: newRate };
              }
              return d;
            });
          }
        } else if (metalType === 'Silver') {
          if (product.hasSilver || product.productType === 'Silver') {
            updateFields.silverRatePerGram = newRate;
          }
          // Update in diamonds array if present
          if (product.diamonds && Array.isArray(product.diamonds)) {
            updateFields.diamonds = product.diamonds.map((d: any) => {
              if (d.metalType === 'Silver') {
                return { ...d, customMetalRate: newRate };
              }
              return d;
            });
          }
        } else {
          // For other metal types, update in diamonds array
          if (product.diamonds && Array.isArray(product.diamonds)) {
            updateFields.diamonds = product.diamonds.map((d: any) => {
              if (d.metalType === metalType) {
                return { ...d, customMetalRate: newRate };
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
      const currentRates = await db.collection('metal_rates').findOne({});
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
