import { NextRequest, NextResponse } from 'next/server';
import { getRetailerFromRequest } from '@/lib/auth';
import { getRetailerById } from '@/lib/models/retailer';
import { hashRetailerPassword, verifyRetailerPassword } from '@/lib/models/retailer';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/** PUT – Change retailer password. */
export async function PUT(request: NextRequest) {
  try {
    const decoded = getRetailerFromRequest(request);
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }
    const retailer = await getRetailerById(decoded.id);
    if (!retailer) {
      return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    }
    const valid = await verifyRetailerPassword(currentPassword, retailer.password);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    const hashed = await hashRetailerPassword(newPassword);
    const { db } = await connectToDatabase();
    await db.collection('retailers').updateOne(
      { _id: new ObjectId(decoded.id) },
      { $set: { password: hashed, updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch (e) {
    console.error('[Retailer Profile] Password PUT error:', e);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
