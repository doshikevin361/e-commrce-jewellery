import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { rejectIfNoAdminAccess } from '@/lib/admin-api-authorize';
import { PICKUP_LOCATIONS_COLLECTION, canDeletePickupRecord } from '@/lib/pickup-locations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    const denied = rejectIfNoAdminAccess(request, user, 'admin-or-vendor');
    if (denied) return denied;

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const doc = await db.collection(PICKUP_LOCATIONS_COLLECTION).findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!canDeletePickupRecord(user!, doc as { ownerType: string; ownerId: string })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.collection(PICKUP_LOCATIONS_COLLECTION).deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message:
        'Removed from this app. If the location still appears in Shiprocket, delete it from Shiprocket → Settings → Pickup Address.',
    });
  } catch (e: unknown) {
    console.error('[pickup-locations] DELETE', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
