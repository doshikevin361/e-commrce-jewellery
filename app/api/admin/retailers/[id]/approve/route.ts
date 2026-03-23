import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getUserFromRequest, isAdmin } from '@/lib/auth';
import { rejectIfNoAdminAccess } from '@/lib/admin-api-authorize';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    const deniedAd = rejectIfNoAdminAccess(request, user, 'admin-only');
    if (deniedAd) return deniedAd;
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Invalid retailer id' }, { status: 400 });
    const body = await request.json().catch(() => ({}));
    const status = body.status === 'blocked' ? 'blocked' : 'approved';
    const approvalNotes = typeof body.approvalNotes === 'string' ? body.approvalNotes : '';

    const { db } = await connectToDatabase();
    const result = await db.collection('retailers').findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          approvalNotes: status === 'approved' ? approvalNotes : undefined,
          updatedAt: new Date(),
          ...(status === 'approved' ? { approvedAt: new Date() } : {}),
        },
      },
      { returnDocument: 'after' }
    );
    if (!result) {
      return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    }
    const { password, ...retailer } = result as any;
    return NextResponse.json({
      success: true,
      retailer: { ...retailer, _id: retailer._id?.toString() },
    });
  } catch (error) {
    console.error('[Admin] Approve retailer error:', error);
    return NextResponse.json({ error: 'Failed to update retailer' }, { status: 500 });
  }
}
