import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';

/** GET - List karats for retailer product form (read-only, same as admin karats). */
export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const karats = await db
      .collection('karats')
      .find({})
      .sort({ displayOrder: 1, name: 1 })
      .project({ _id: 1, name: 1 })
      .toArray();

    return NextResponse.json({
      karats: karats.map((item: { _id: unknown; name: string }) => ({
        _id: String(item._id),
        name: item.name || '',
      })),
    });
  } catch (e) {
    console.error('[Retailer Karats] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch karats' }, { status: 500 });
  }
}
