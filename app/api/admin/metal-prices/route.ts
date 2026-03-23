import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isAdmin } from '@/lib/auth';
import { rejectIfNoAdminAccess } from '@/lib/admin-api-authorize';
import { broadcastMetalPriceUpdate } from './events/route';
import { revalidatePath, revalidateTag } from 'next/cache';
import { calculateFullProductPrice, getPriceBreakdown, getDetailedPriceBreakdown } from '@/lib/utils/admin-price-calculator';

// GET: Fetch all unique metal types and their rates from products
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const deniedAd = rejectIfNoAdminAccess(request, user, 'admin-only');
    if (deniedAd) return deniedAd;

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
    const deniedAd = rejectIfNoAdminAccess(request, user, 'admin-only');
    if (deniedAd) return deniedAd;

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

    // Build rate overrides so live formula (metal + making + platform + vendor/retailer commission) is used
    const rateOverrides: { goldRate?: number; silverRate?: number; platinumRate?: number } = {};
    if (metalType === 'Gold') rateOverrides.goldRate = newRate;
    else if (metalType === 'Silver') rateOverrides.silverRate = newRate;
    else if (metalType === 'Platinum') rateOverrides.platinumRate = newRate;

    console.log(`\n[Metal Update] ${metalType} rate → ₹${newRate}/gram. Updating ${products.length} product(s).`);
    let updatedCount = 0;
    const updatePromises = products.map(async (product: any) => {
      try {
        // Vendor commission only for vendor's product (has vendorId); retailer commission only in retailer_products
        const isVendorProduct = !!product.vendorId;
        const overrides = {
          ...rateOverrides,
          vendorCommissionRate: isVendorProduct ? (product.vendorCommissionRate ?? 0) : 0,
          retailerCommissionRate: 0,
        };
        const breakdown = getPriceBreakdown(product, overrides);
        const newPrice = Math.max(0, breakdown.total);

        const productName = (product.name || product.sku || product._id?.toString() || 'Unnamed').toString().trim();
        const isRing = productName.toLowerCase() === 'ring';
        if (isRing) {
          const d = getDetailedPriceBreakdown(product, overrides);
          console.log(`\n  [Metal Update] --- "${productName}" (${product._id}) ---`);
          console.log(`    Metal Value          = ₹${d.metalValue.toFixed(2)}`);
          console.log(`    Making Charges       = ₹${d.makingCharges.toFixed(2)}`);
          console.log(`    Diamonds Value       = ₹${d.diamondValue.toFixed(2)}`);
          console.log(`    Platform Commission  = ₹${d.platformCommission.toFixed(2)}`);
          console.log(`    Other Charges        = ₹${d.otherCharges.toFixed(2)}`);
          console.log(`    Vendor Commission    = ₹${d.vendorCommission.toFixed(2)}`);
          console.log(`    Retailer Commission  = ₹${d.retailerCommission.toFixed(2)}`);
          console.log(`    Total                = ₹${d.total.toFixed(2)}\n`);
        }

        // One price everywhere: same value in all price keys
        const updateFields: any = {
          price: newPrice,
          subTotal: newPrice,
          totalAmount: newPrice,
          sellingPrice: newPrice,
          regularPrice: newPrice,
          mrp: newPrice,
          costPrice: product.costPrice ?? 0,
          updatedAt: new Date(),
        };

        // Always set product rate = new rate so form "live price" and stored price match
        const productTypeValue = (product.productType || product.product_type || '')
          .toString()
          .toLowerCase();

        if (metalType === 'Gold') {
          if (product.hasGold || productTypeValue === 'gold') {
            updateFields.goldRatePerGram = newRate;
            updateFields.customMetalRate = newRate;
          }
          if (product.diamonds && Array.isArray(product.diamonds)) {
            updateFields.diamonds = product.diamonds.map((d: any) => {
              if ((d.metalType || '').toString().toLowerCase() === 'gold') {
                return { ...d, customMetalRate: newRate };
              }
              return d;
            });
          }
        } else if (metalType === 'Platinum') {
          if (productTypeValue === 'platinum') {
            updateFields.goldRatePerGram = newRate;
            updateFields.customMetalRate = newRate;
          }
          if (product.diamonds && Array.isArray(product.diamonds)) {
            updateFields.diamonds = product.diamonds.map((d: any) => {
              if ((d.metalType || '').toString().toLowerCase() === 'platinum') {
                return { ...d, customMetalRate: newRate };
              }
              return d;
            });
          }
        } else if (metalType === 'Silver') {
          if (product.hasSilver || productTypeValue === 'silver') {
            updateFields.silverRatePerGram = newRate;
            updateFields.customMetalRate = newRate;
          }
          if (product.diamonds && Array.isArray(product.diamonds)) {
            updateFields.diamonds = product.diamonds.map((d: any) => {
              if ((d.metalType || '').toString().toLowerCase() === 'silver') {
                return { ...d, customMetalRate: newRate };
              }
              return d;
            });
          }
        } else {
          if (product.diamonds && Array.isArray(product.diamonds)) {
            updateFields.diamonds = product.diamonds.map((d: any) => {
              if ((d.metalType || '').toString().toLowerCase() === normalizedMetalType) {
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

    // Update retailer_products: full recalc (same formula as form: metal + making + platform + retailer commission)
    let retailerUpdatedCount = 0;
    if (['Gold', 'Silver', 'Platinum'].includes(metalType)) {
      const retailerQuery: any = {
        product_type: { $in: [metalType, metalType.toLowerCase()] },
        weight: { $gt: 0 },
      };
      const retailerProducts = await db.collection('retailer_products').find(retailerQuery).toArray();
      if (retailerProducts.length > 0) {
        console.log(`[Metal Update] ${metalType} → ${retailerProducts.length} retailer product(s).`);
      }
      for (const rp of retailerProducts as any[]) {
        const rpOverrides = { ...rateOverrides, vendorCommissionRate: 0, retailerCommissionRate: rp.retailerCommissionRate };
        const rpBreakdown = getPriceBreakdown(rp, rpOverrides);
        const newSellingPrice = Math.max(0, rpBreakdown.total);
        const rpName = (rp.name || rp.sku || rp._id?.toString() || 'Unnamed').toString().trim();
        const rpIsRing = rpName.toLowerCase() === 'ring';
        if (rpIsRing) {
          const d = getDetailedPriceBreakdown(rp, rpOverrides);
          console.log(`\n  [Metal Update] Retailer --- "${rpName}" (${rp._id}) ---`);
          console.log(`    Metal Value          = ₹${d.metalValue.toFixed(2)}`);
          console.log(`    Making Charges       = ₹${d.makingCharges.toFixed(2)}`);
          console.log(`    Diamonds Value       = ₹${d.diamondValue.toFixed(2)}`);
          console.log(`    Platform Commission  = ₹${d.platformCommission.toFixed(2)}`);
          console.log(`    Other Charges        = ₹${d.otherCharges.toFixed(2)}`);
          console.log(`    Retailer Commission  = ₹${d.retailerCommission.toFixed(2)}`);
          console.log(`    Total                = ₹${d.total.toFixed(2)}\n`);
        }
        const rateFields: any = { sellingPrice: newSellingPrice, price: newSellingPrice, subTotal: newSellingPrice, totalAmount: newSellingPrice, regularPrice: newSellingPrice, updatedAt: new Date() };
        if (metalType === 'Gold') {
          rateFields.goldRatePerGram = newRate;
          rateFields.customMetalRate = newRate;
        } else if (metalType === 'Silver') {
          rateFields.silverRatePerGram = newRate;
          rateFields.customMetalRate = newRate;
        } else if (metalType === 'Platinum') {
          rateFields.goldRatePerGram = newRate;
          rateFields.customMetalRate = newRate;
        }
        await db.collection('retailer_products').updateOne(
          { _id: rp._id },
          { $set: rateFields }
        );
        retailerUpdatedCount += 1;
      }
    }

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
      broadcastMetalPriceUpdate(metalType, newRate, updatedCount + retailerUpdatedCount);
    } catch (error) {
      console.error('[v0] Failed to broadcast metal price update:', error);
      // Don't fail the request if broadcast fails
    }

    const totalUpdated = updatedCount + retailerUpdatedCount;
    const msg =
      retailerUpdatedCount > 0
        ? `Updated ${updatedCount} vendor/admin products and ${retailerUpdatedCount} retailer products with new ${metalType} rate of ₹${newRate}/gram.`
        : `Updated ${updatedCount} products with new ${metalType} rate of ₹${newRate}/gram. Website will refresh automatically.`;
    return NextResponse.json({
      success: true,
      message: msg,
      updatedCount: totalUpdated,
      productsUpdated: updatedCount,
      retailerProductsUpdated: retailerUpdatedCount,
      metalType,
      newRate,
    });
  } catch (error) {
    console.error('[v0] Failed to update metal prices:', error);
    return NextResponse.json({ error: 'Failed to update metal prices' }, { status: 500 });
  }
}
