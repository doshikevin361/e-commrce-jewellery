import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // First, try to get rates from metal_rates collection (preferred source)
    const storedRates = await db.collection('metal_rates').findOne({});
    
    if (storedRates && (storedRates.gold > 0 || storedRates.silver > 0 || storedRates.platinum > 0)) {
      return NextResponse.json({
        gold: storedRates.gold || 6500,
        silver: storedRates.silver || 85,
        platinum: storedRates.platinum || 3200,
        timestamp: storedRates.updatedAt ? new Date(storedRates.updatedAt).toISOString() : new Date().toISOString(),
        currency: 'INR',
        unit: 'per_gram',
        source: 'stored',
      });
    }

    // Fallback: Get latest metal rates from products (most recent non-zero rates)
    const products = await db.collection('products').find({
      $or: [
        { hasGold: true, goldRatePerGram: { $gt: 0 } },
        { hasSilver: true, silverRatePerGram: { $gt: 0 } },
        { productType: 'Gold', goldRatePerGram: { $gt: 0 } },
        { productType: 'Silver', silverRatePerGram: { $gt: 0 } },
        { productType: 'Platinum', goldRatePerGram: { $gt: 0 } },
        { 'diamonds.metalType': { $exists: true } },
      ],
    })
    .sort({ updatedAt: -1 })
    .limit(100)
    .toArray();

    // Get the latest rates for each metal type
    let goldRate = 0;
    let silverRate = 0;
    let platinumRate = 0;

    for (const product of products) {
      const productType = (product.productType || product.product_type || '').toString();
      
      // Get Platinum rate
      if (productType.toLowerCase() === 'platinum' && product.goldRatePerGram > 0) {
        if (platinumRate === 0) {
          platinumRate = product.goldRatePerGram;
        }
      }
      // Get Gold rate (excluding Platinum)
      else if ((product.hasGold || productType.toLowerCase() === 'gold') && product.goldRatePerGram > 0) {
        if (goldRate === 0) {
          goldRate = product.goldRatePerGram;
        }
      }
      
      // Get Silver rate
      if ((product.hasSilver || productType === 'Silver') && product.silverRatePerGram > 0) {
        if (silverRate === 0) {
          silverRate = product.silverRatePerGram;
        }
      }

      // Check diamonds array for metal rates
      if (product.diamonds && Array.isArray(product.diamonds)) {
        for (const diamond of product.diamonds) {
          if (diamond.metalType && diamond.customMetalRate > 0) {
            if (diamond.metalType === 'Platinum' && platinumRate === 0) {
              platinumRate = diamond.customMetalRate;
            } else if (diamond.metalType === 'Gold' && goldRate === 0) {
              goldRate = diamond.customMetalRate;
            } else if (diamond.metalType === 'Silver' && silverRate === 0) {
              silverRate = diamond.customMetalRate;
            }
          }
        }
      }

      // If we have all rates, break early
      if (goldRate > 0 && silverRate > 0 && platinumRate > 0) {
        break;
      }
    }

    // Fallback prices if no rates found
    const FALLBACK_PRICES = {
      gold: 6500,
      silver: 85,
      platinum: 3200,
    };

    // Store the rates in metal_rates collection for future use
    if (goldRate > 0 || silverRate > 0 || platinumRate > 0) {
      try {
        const now = new Date();
        const existing = await db.collection('metal_rates').findOne({});
        if (existing) {
          await db.collection('metal_rates').updateOne(
            {},
            {
              $set: {
                gold: goldRate || existing.gold || FALLBACK_PRICES.gold,
                silver: silverRate || existing.silver || FALLBACK_PRICES.silver,
                platinum: platinumRate || existing.platinum || FALLBACK_PRICES.platinum,
                updatedAt: now,
              },
            }
          );
        } else {
          await db.collection('metal_rates').insertOne({
            gold: goldRate || FALLBACK_PRICES.gold,
            silver: silverRate || FALLBACK_PRICES.silver,
            platinum: platinumRate || FALLBACK_PRICES.platinum,
            createdAt: now,
            updatedAt: now,
          });
        }
      } catch (error) {
        console.error('[v0] Failed to store metal rates:', error);
      }
    }

    return NextResponse.json({
      gold: goldRate || FALLBACK_PRICES.gold,
      silver: silverRate || FALLBACK_PRICES.silver,
      platinum: platinumRate || FALLBACK_PRICES.platinum,
      timestamp: new Date().toISOString(),
      currency: 'INR',
      unit: 'per_gram',
      source: 'products',
    });
  } catch (error) {
    console.error('[v0] Failed to fetch metal prices:', error);
    // Return fallback prices on error
    return NextResponse.json({
      gold: 6500,
      silver: 85,
      platinum: 3200,
      timestamp: new Date().toISOString(),
      currency: 'INR',
      unit: 'per_gram',
      error: 'Failed to fetch prices, using fallback',
    });
  }
}
