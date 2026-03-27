import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { PICKUP_LOCATIONS_COLLECTION } from '@/lib/pickup-locations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const doc = await db.collection(PICKUP_LOCATIONS_COLLECTION).findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const o = doc as { ownerType: string; ownerId: string };
    if (o.ownerType !== 'retailer' || o.ownerId !== retailer.id) {
      return NextResponse.json({ error: 'You can only delete your own pickup locations' }, { status: 403 });
    }

    await db.collection(PICKUP_LOCATIONS_COLLECTION).deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message:
        'Removed from this app. If the location still appears in Shiprocket, delete it from Shiprocket panel.',
    });
  } catch (e: unknown) {
    console.error('[retailer pickup-locations] DELETE', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
