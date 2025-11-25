import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'trending' or 'new'

    const filter: any = {
      status: 'active',
      visibility: 'Public',
    };

    // Filter by trending status
    if (type === 'trending') {
      filter.trending = true;
    } else if (type === 'new') {
      filter.trending = { $ne: true };
    }

    const products = await db
      .collection('products')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(8) // Limit to 8 products per section
      .toArray();

    return NextResponse.json(
      products.map(product => ({
        _id: product._id.toString(),
        name: product.name,
        category: product.category,
        regularPrice: product.regularPrice,
        sellingPrice: product.sellingPrice,
        mainImage: product.mainImage,
        shortDescription: product.shortDescription,
        urlSlug: product.urlSlug,
        featured: product.featured,
        trending: product.trending,
      }))
    );
  } catch (error) {
    console.error('[v0] Failed to fetch homepage products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
