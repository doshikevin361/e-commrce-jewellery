import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByResetToken, updateCustomer, hashCustomerPassword } from '@/lib/models/customer';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get customer by reset token (automatically checks expiry)
    const customer = await getCustomerByResetToken(token);
    if (!customer) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired reset token. Password reset links expire after 1 hour. Please request a new one.',
          expired: true 
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashCustomerPassword(password);

    // Update password and clear reset token
    await updateCustomer(customer._id!, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    // Send confirmation email
    const emailTemplate = emailTemplates.passwordChanged(customer.name);
    await sendEmail({
      to: customer.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('[Customer Auth] Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}

