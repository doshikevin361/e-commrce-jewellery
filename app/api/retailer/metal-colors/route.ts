import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';

/** GET - List metal colors for retailer product form (read-only). */
export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const metalColors = await db
      .collection('metal_colors')
      .find({})
      .sort({ displayOrder: 1, name: 1 })
      .project({ _id: 1, name: 1 })
      .toArray();

    return NextResponse.json({
      metalColors: metalColors.map((item: { _id: unknown; name: string }) => ({
        _id: String(item._id),
        name: item.name || '',
      })),
    });
  } catch (e) {
    console.error('[Retailer Metal Colors] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch metal colors' }, { status: 500 });
  }
}
