import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const filter: any = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const attributes = await db
      .collection('attributes')
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    return NextResponse.json({
      attributes: attributes.map(attr => ({
        ...attr,
        _id: attr._id.toString(),
      })),
      total: attributes.length,
    });
  } catch (error) {
    console.error('[v0] Error fetching public attributes:', error);
    return NextResponse.json({ error: 'Failed to fetch attributes' }, { status: 500 });
  }
}

