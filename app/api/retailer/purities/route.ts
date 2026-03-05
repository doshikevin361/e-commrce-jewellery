import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';

/** GET - List purities for retailer commission dropdown (read-only, same as admin purities). */
export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const purities = await db
      .collection('purities')
      .find({ status: 'active' })
      .sort({ displayOrder: 1, name: 1 })
      .project({ _id: 1, name: 1 })
      .toArray();

    return NextResponse.json({
      purities: purities.map((item: { _id: unknown; name: string }) => ({
        _id: String(item._id),
        name: item.name || '',
      })),
    });
  } catch (e) {
    console.error('[Retailer Purities] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch purities' }, { status: 500 });
  }
}
