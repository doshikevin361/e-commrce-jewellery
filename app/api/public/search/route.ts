import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    if (!query.trim()) {
      return NextResponse.json({
        keywords: [],
        categories: [],
        brands: [],
        attributes: [],
        products: [],
      });
    }

    const searchRegex = { $regex: query, $options: 'i' };

    // Fetch categories matching the query
    const categories = await db
      .collection('categories')
      .find({
        status: 'active',
        $or: [
          { name: searchRegex },
          { slug: searchRegex },
        ],
      })
      .limit(5)
      .toArray();

    // Fetch brands matching the query
    const brands = await db
      .collection('brands')
      .find({
        status: 'active',
        name: searchRegex,
      })
      .limit(5)
      .toArray();

    // Fetch attributes matching the query
    const attributes = await db
      .collection('attributes')
      .find({
        $or: [
          { name: searchRegex },
          { values: { $in: [new RegExp(query, 'i')] } },
        ],
      })
      .limit(10)
      .toArray();

    // Fetch products matching the query
    const products = await db
      .collection('products')
      .find({
        status: 'active',
        $or: [
          { name: searchRegex },
          { shortDescription: searchRegex },
          { category: searchRegex },
          { brand: searchRegex },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { metalType: searchRegex },
          { metalPurity: searchRegex },
          { stoneType: searchRegex },
        ],
      })
      .limit(6)
      .toArray();

    // Extract keywords from attributes and common jewellery terms
    const keywords: string[] = [];
    
    // Add attribute values as keywords
    attributes.forEach(attr => {
      attr.values?.forEach((value: string) => {
        if (value.toLowerCase().includes(query.toLowerCase()) && !keywords.includes(value)) {
          keywords.push(value);
        }
      });
    });

    // Add category names as keywords
    categories.forEach(cat => {
      if (!keywords.includes(cat.name)) {
        keywords.push(cat.name);
      }
    });

    // Add brand names as keywords
    brands.forEach(brand => {
      if (!keywords.includes(brand.name)) {
        keywords.push(brand.name);
      }
    });

    // Common jewellery keywords based on query
    const commonKeywords = [
      'Gold Ring', 'Diamond Necklace', 'Rose Gold', 'Platinum', '18K', '24K', 
      'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Men', 'Women', 'Bridal',
      'Engagement', 'Wedding', 'Earrings', 'Bracelets', 'Rings', 'Necklaces'
    ];

    commonKeywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(query.toLowerCase()) && !keywords.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    // Limit keywords to 8
    const limitedKeywords = keywords.slice(0, 8);

    return NextResponse.json({
      keywords: limitedKeywords,
      categories: categories.map(cat => ({
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
      })),
      brands: brands.map(brand => ({
        _id: brand._id.toString(),
        name: brand.name,
      })),
      attributes: attributes.map(attr => ({
        _id: attr._id.toString(),
        name: attr.name,
        values: attr.values || [],
      })),
      products: products.map(product => ({
        _id: product._id.toString(),
        name: product.name,
        category: product.category,
        brand: product.brand,
        mainImage: product.mainImage,
        displayPrice: product.sellingPrice || product.regularPrice || 0,
        originalPrice: product.mrp || product.regularPrice || 0,
        hasDiscount: (product.mrp || product.regularPrice) > (product.sellingPrice || product.regularPrice),
        discountPercent: product.discount || 0,
        slug: product.urlSlug || product._id.toString(),
        metalType: product.metalType,
        metalPurity: product.metalPurity,
        stoneType: product.stoneType,
      })),
    });
  } catch (error) {
    console.error('[v0] Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

