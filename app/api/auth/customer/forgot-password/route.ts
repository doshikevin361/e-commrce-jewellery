import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByEmail, updateCustomer } from '@/lib/models/customer';
import { sendEmail, emailTemplates } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Get customer
    const customer = await getCustomerByEmail(email);
    
    // Always return success to prevent email enumeration
    // But only send email if customer exists
    if (customer) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

      // Save reset token
      await updateCustomer(customer._id!, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      });

      // Send reset email
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jewellery-commrce-824e.vercel.app'}/reset-password?token=${resetToken}`;
      const emailTemplate = emailTemplates.passwordReset(customer.name, resetLink);
      
      await sendEmail({
        to: customer.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('[Customer Auth] Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}

