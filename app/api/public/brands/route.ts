import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const filter: any = { status: 'active' }; // Only show active brands
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const brands = await db
      .collection('brands')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      brands: brands.map(brand => ({
        ...brand,
        _id: brand._id.toString(),
      })),
      total: brands.length,
    });
  } catch (error) {
    console.error('[v0] Error fetching public brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

