import { NextRequest, NextResponse } from 'next/server';
import { getRetailerByResetToken, hashRetailerPassword } from '@/lib/models/retailer';
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

    const retailer = await getRetailerByResetToken(token);
    if (!retailer?._id) {
      return NextResponse.json(
        {
          error:
            'Invalid or expired reset token. Password reset links expire after 1 hour. Please request a new one.',
          expired: true,
        },
        { status: 400 }
      );
    }

    const hashed = await hashRetailerPassword(password);
    const { db } = await connectToDatabase();
    await db.collection('retailers').updateOne(
      { _id: new ObjectId(String(retailer._id)) },
      {
        $set: { password: hashed, updatedAt: new Date() },
        $unset: { passwordResetToken: '', passwordResetExpires: '' },
      }
    );

    const tpl = emailTemplates.passwordChanged(retailer.fullName);
    await sendEmail({ to: retailer.email, subject: tpl.subject, html: tpl.html });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in.',
    });
  } catch (error) {
    console.error('[Retailer Auth] Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password. Please try again.' }, { status: 500 });
  }
}
