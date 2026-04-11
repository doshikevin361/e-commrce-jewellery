import { NextRequest, NextResponse } from 'next/server';
import { getRetailerByEmail } from '@/lib/models/retailer';
import { sendEmail, emailTemplates } from '@/lib/email';
import { connectToDatabase } from '@/lib/mongodb';
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

    const retailer = await getRetailerByEmail(email);
    if (retailer && retailer.status !== 'blocked' && retailer._id) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1);

      const { db } = await connectToDatabase();
      await db.collection('retailers').updateOne(
        { _id: retailer._id },
        { $set: { passwordResetToken: resetToken, passwordResetExpires: resetExpires, updatedAt: new Date() } }
      );

      const resetLink = `${baseUrl()}/retailer/reset-password?token=${resetToken}`;
      const tpl = emailTemplates.passwordReset(retailer.fullName, resetLink);
      await sendEmail({ to: retailer.email, subject: tpl.subject, html: tpl.html });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('[Retailer Auth] Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request. Please try again.' }, { status: 500 });
  }
}
