import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const excludeId = searchParams.get('excludeId');
    const all = searchParams.get('all') === 'true';

    const { db } = await connectToDatabase();

    const searchFilter: any = {};

    if (excludeId) {
      try {
        searchFilter._id = { $ne: new ObjectId(excludeId) };
      } catch (error) {
        return NextResponse.json({ error: 'Invalid excludeId format' }, { status: 400 });
      }
    }

    // Add search query if provided (and not requesting all)
    if (query.trim() && !all) {
      searchFilter.name = { $regex: query, $options: 'i' };
    }

    // Find products matching the search query
    const products = await db
      .collection('products')
      .find(searchFilter)
      .limit(all ? 500 : 50) // Higher limit for fetching all products
      .project({
        _id: 1,
        name: 1,
        sku: 1,
        mainImage: 1,
      })
      .toArray();

    return NextResponse.json({
      products: products.map(p => ({
        _id: p._id.toString(),
        name: p.name,
        sku: p.sku,
        mainImage: p.mainImage,
      })),
    });
  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
