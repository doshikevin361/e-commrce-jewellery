import { NextRequest, NextResponse } from 'next/server';
import { getAdminByResetToken, hashAdminPassword } from '@/lib/models/admin';
import { getVendorByResetToken, hashVendorPassword } from '@/lib/models/vendor';
import { sendEmail, emailTemplates } from '@/lib/email';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const admin = await getAdminByResetToken(token);
    if (admin?._id) {
      const hashed = await hashAdminPassword(password);
      await db.collection('admins').updateOne(
        { _id: new ObjectId(String(admin._id)) },
        {
          $set: { password: hashed, updatedAt: new Date() },
          $unset: { passwordResetToken: '', passwordResetExpires: '' },
        }
      );
      const tpl = emailTemplates.passwordChanged(admin.name);
      await sendEmail({ to: admin.email, subject: tpl.subject, html: tpl.html });
      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully. You can now sign in.',
      });
    }

    const vendor = await getVendorByResetToken(token);
    if (vendor?._id) {
      const hashed = await hashVendorPassword(password);
      await db.collection('vendors').updateOne(
        { _id: vendor._id },
        {
          $set: { password: hashed, updatedAt: new Date() },
          $unset: { passwordResetToken: '', passwordResetExpires: '' },
        }
      );
      const tpl = emailTemplates.passwordChanged(vendor.ownerName || vendor.storeName);
      await sendEmail({ to: vendor.email, subject: tpl.subject, html: tpl.html });
      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully. You can now sign in.',
      });
    }

    return NextResponse.json(
      {
        error:
          'Invalid or expired reset token. Password reset links expire after 1 hour. Please request a new one.',
        expired: true,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Auth] Admin/vendor reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password. Please try again.' }, { status: 500 });
  }
}
