import { NextRequest, NextResponse } from 'next/server';
import { getVendorById, verifyVendorPassword, hashVendorPassword } from '@/lib/models/vendor';
import { getUserFromRequest, isVendor } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only vendors can change their password
    if (!isVendor(user)) {
      return NextResponse.json(
        { error: 'Access denied. Vendor role required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get vendor
    const vendor = await getVendorById(user.id);
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const passwordMatch = await verifyVendorPassword(currentPassword, vendor.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await hashVendorPassword(newPassword);

    // Update password in database
    const { db } = await connectToDatabase();
    await db.collection('vendors').updateOne(
      { _id: new ObjectId(user.id) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('[Vendor Password] Change password error:', error);
    return NextResponse.json(
      { error: 'Failed to update password. Please try again.' },
      { status: 500 }
    );
  }
}
