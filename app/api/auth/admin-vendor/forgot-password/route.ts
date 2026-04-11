import { NextRequest, NextResponse } from 'next/server';
import { getAdminByEmail } from '@/lib/models/admin';
import { getVendorByEmail } from '@/lib/models/vendor';
import { sendEmail, emailTemplates } from '@/lib/email';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

const baseUrl = () => process.env.NEXT_PUBLIC_BASE_URL || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const trimmed = email.trim();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    const { db } = await connectToDatabase();

    const admin = await getAdminByEmail(trimmed);
    if (admin && admin.status !== 'inactive') {
      await db.collection('admins').updateOne(
        { _id: new ObjectId(String(admin._id)) },
        { $set: { passwordResetToken: resetToken, passwordResetExpires: resetExpires, updatedAt: new Date() } }
      );
      const resetLink = `${baseUrl()}/login/reset-password?token=${resetToken}`;
      const tpl = emailTemplates.passwordReset(admin.name, resetLink);
      await sendEmail({ to: admin.email, subject: tpl.subject, html: tpl.html });
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    const vendor = await getVendorByEmail(trimmed);
    if (vendor && vendor.status !== 'suspended' && vendor.status !== 'rejected' && vendor._id) {
      await db.collection('vendors').updateOne(
        { _id: new ObjectId(String(vendor._id)) },
        { $set: { passwordResetToken: resetToken, passwordResetExpires: resetExpires, updatedAt: new Date() } }
      );
      const resetLink = `${baseUrl()}/login/reset-password?token=${resetToken}`;
      const tpl = emailTemplates.passwordReset(vendor.ownerName || vendor.storeName, resetLink);
      await sendEmail({ to: vendor.email, subject: tpl.subject, html: tpl.html });
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('[Auth] Admin/vendor forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request. Please try again.' }, { status: 500 });
  }
}
