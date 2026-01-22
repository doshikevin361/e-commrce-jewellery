import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const queryText = searchParams.get('q')?.trim();
    const limit = parseInt(searchParams.get('limit') || '200', 10);

    const query: Record<string, any> = {};
    if (queryText) {
      query.name = { $regex: queryText, $options: 'i' };
    }

    const products = await db
      .collection('products')
      .find(query)
      .project({ name: 1, urlSlug: 1 })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(
      products.map(product => ({
        _id: product._id.toString(),
        name: product.name || '',
        urlSlug: product.urlSlug || '',
      }))
    );
  } catch (error) {
    console.error('[v0] Failed to fetch product lookup:', error);
    return NextResponse.json({ error: 'Failed to fetch product lookup' }, { status: 500 });
  }
}

