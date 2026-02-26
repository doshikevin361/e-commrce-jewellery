import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const categories = await db
      .collection('categories')
      .find({ status: 'active' })
      .sort({ displayOrder: 1, name: 1 })
      .project({ _id: 1, name: 1, slug: 1 })
      .toArray();

    const list = categories.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
    }));

    return NextResponse.json({ categories: list });
  } catch (error) {
    console.error('[Retailer Categories] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
