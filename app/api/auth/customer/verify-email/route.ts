import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByVerificationToken, updateCustomer } from '@/lib/models/customer';
import { sendEmail, emailTemplates } from '@/lib/email';

// Also support GET for direct link clicks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/verify-email?error=missing_token', request.url));
    }

    // Call the POST handler logic
    const response = await POST(new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }));

    if (response.ok) {
      return NextResponse.redirect(new URL('/verify-email?success=true', request.url));
    } else {
      const data = await response.json();
      return NextResponse.redirect(new URL(`/verify-email?error=${encodeURIComponent(data.error || 'verification_failed')}`, request.url));
    }
  } catch (error) {
    console.error('[Customer Auth] GET verify email error:', error);
    return NextResponse.redirect(new URL('/verify-email?error=server_error', request.url));
  }
}

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

    console.log('[Customer Auth] Verifying email with token:', token.substring(0, 10) + '...');

    // Get customer by verification token
    const customer = await getCustomerByVerificationToken(token);
    if (!customer) {
      console.log('[Customer Auth] Customer not found or token expired');
      return NextResponse.json(
        { error: 'Invalid or expired verification token. Please request a new verification email.' },
        { status: 400 }
      );
    }

    console.log('[Customer Auth] Customer found:', customer.email, 'Verified:', customer.emailVerified);

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

