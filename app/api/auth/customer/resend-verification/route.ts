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

    // Get customer by email
    const customer = await getCustomerByEmail(email);
    if (!customer) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.',
      });
    }

    // Check if email is already verified
    if (customer.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Your email is already verified. You can login now.',
      });
    }

    // Check cooldown period (5 minutes = 300000 milliseconds)
    const now = new Date();
    const lastSentTime = (customer as any).lastVerificationEmailSent;
    if (lastSentTime) {
      const timeSinceLastSent = now.getTime() - new Date(lastSentTime).getTime();
      const cooldownPeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      if (timeSinceLastSent < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastSent) / 1000); // in seconds
        const remainingMinutes = Math.floor(remainingTime / 60);
        const remainingSeconds = remainingTime % 60;
        
        return NextResponse.json(
          { 
            error: `Please wait ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''} before requesting another verification email.`,
            cooldownRemaining: remainingTime
          },
          { status: 429 }
        );
      }
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 48); // 48 hours

    // Update customer with new token and last sent time
    await updateCustomer(customer._id!, {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      lastVerificationEmailSent: now,
    });

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jewellery-commrce-824e.vercel.app'}/verify-email?token=${verificationToken}`;
    const emailTemplate = emailTemplates.verification(customer.name, verificationLink);
    
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log('[Customer Auth] Resent verification email to:', email);

    return NextResponse.json({
      success: true,
      message: 'Verification email has been sent. Please check your inbox.',
    });
  } catch (error) {
    console.error('[Customer Auth] Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email. Please try again.' },
      { status: 500 }
    );
  }
}

