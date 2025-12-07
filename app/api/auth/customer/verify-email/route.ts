import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByVerificationToken, updateCustomer } from '@/lib/models/customer';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Get customer by verification token
    const customer = await getCustomerByVerificationToken(token);
    if (!customer) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (customer.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified',
      });
    }

    // Verify email
    await updateCustomer(customer._id!, {
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });

    // Send welcome email
    const emailTemplate = emailTemplates.welcome(customer.name);
    await sendEmail({
      to: customer.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
    });
  } catch (error) {
    console.error('[Customer Auth] Verify email error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email. Please try again.' },
      { status: 500 }
    );
  }
}

