import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch all active products with stock and get unique product types with their jewelry types
    const products = await db
      .collection('products')
      .find(
        { 
          status: 'active', // Only active products
          stock: { $gt: 0 }, // Only products in stock
          product_type: { $exists: true, $ne: '' }, // Product type must exist and not be empty
          jewelryType: { $exists: true, $ne: '' } // Jewelry type must exist
        },
        { projection: { product_type: 1, jewelryType: 1, status: 1, stock: 1 } }
      )
      .toArray();

    // Group by product type and collect unique jewelry types
    const productTypeMap: Record<string, Set<string>> = {};
    
    products.forEach((p: any) => {
      const productType = p.product_type;
      const jewelryType = p.jewelryType;
      
      if (productType && ['Gold', 'Silver', 'Platinum', 'Diamond', 'Gemstone'].includes(productType) && jewelryType) {
        if (!productTypeMap[productType]) {
          productTypeMap[productType] = new Set();
        }
        productTypeMap[productType].add(jewelryType);
      }
    });

    // Convert to array format: [{ productType: 'Gold', jewelryTypes: ['Ring', 'Necklace'] }, ...]
    const productTypesWithJewelry = Object.keys(productTypeMap)
      .sort((a, b) => {
        const order = ['Gold', 'Silver', 'Platinum', 'Diamond', 'Gemstone'];
        return order.indexOf(a) - order.indexOf(b);
      })
      .map(productType => ({
        productType,
        jewelryTypes: Array.from(productTypeMap[productType]).sort()
      }));

    // For backward compatibility, also return simple array of product types
    const productTypes = productTypesWithJewelry.map(pt => pt.productType);

    return NextResponse.json({
      productTypes,
      productTypesWithJewelry, // New format with jewelry types
    });
  } catch (error) {
    console.error('[v0] Failed to fetch product types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product types', productTypes: [], productTypesWithJewelry: [] },
      { status: 500 }
    );
  }
}

