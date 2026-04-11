import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByEmailOrPhone } from '@/lib/models/customer';
import { generateOTP, storeOTP, canResendOTP } from '@/lib/models/otp';
import { sendEmail } from '@/lib/email';
import { generateOTPEmailHTML } from '@/lib/otp-email-html';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emailOrPhone = body.emailOrPhone || body.email || body.phone;

    if (!emailOrPhone) {
      return NextResponse.json({ error: 'Email or phone number is required' }, { status: 400 });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
    const isPhone = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(
      emailOrPhone.replace(/\s/g, '')
    );

    if (!isEmail && !isPhone) {
      return NextResponse.json({ error: 'Invalid email or phone number format' }, { status: 400 });
    }

    const customer = await getCustomerByEmailOrPhone(emailOrPhone);
    const isExistingUser = !!customer;
    const purpose = isExistingUser ? 'login' : 'signup';

    if (isExistingUser && customer.status === 'blocked') {
      return NextResponse.json(
        { error: 'Your account has been blocked. Please contact support.' },
        { status: 403 }
      );
    }

    const cooldownCheck = await canResendOTP(emailOrPhone, purpose);
    if (!cooldownCheck.canResend) {
      return NextResponse.json(
        {
          error: `Please wait ${cooldownCheck.remainingSeconds} seconds before requesting a new OTP`,
          remainingSeconds: cooldownCheck.remainingSeconds,
        },
        { status: 429 }
      );
    }

    const otp = generateOTP();
    await storeOTP(emailOrPhone, otp, purpose);

    if (isEmail) {
      try {
        const emailHTML = generateOTPEmailHTML({
          customerName: customer?.name || 'User',
          otp,
          purpose: purpose === 'login' ? 'login' : 'signup',
          expiryMinutes: 10,
        });

        const ok = await sendEmail({
          to: emailOrPhone,
          subject: `Your ${isExistingUser ? 'Login' : 'Signup'} code — ${process.env.NEXT_PUBLIC_SITE_NAME || 'Store'}`,
          html: emailHTML,
        });

        if (!ok) {
          throw new Error('Email send failed');
        }
      } catch (emailError: unknown) {
        const msg = emailError instanceof Error ? emailError.message : 'Email failed';
        console.error('[OTP] send email:', emailError);
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    } else {
      console.log('[OTP] Phone OTP generated (SMS not wired):', otp);
    }

    return NextResponse.json({
      success: true,
      message: `OTP has been sent to your ${isEmail ? 'email' : 'phone'}`,
      isExistingUser,
      purpose,
    });
  } catch (error: unknown) {
    console.error('[OTP] send:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
