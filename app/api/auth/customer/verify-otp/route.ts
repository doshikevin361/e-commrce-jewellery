import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomerByEmailOrPhone,
  createCustomer,
  updateCustomerLastLogin,
  getCustomerById,
} from '@/lib/models/customer';
import { verifyOTP } from '@/lib/models/otp';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrPhone, otp } = body;

    if (!emailOrPhone || !otp) {
      return NextResponse.json({ error: 'Email/Phone and OTP are required' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
    const customer = await getCustomerByEmailOrPhone(emailOrPhone);
    const isExistingUser = !!customer;
    const purpose = isExistingUser ? 'login' : 'signup';

    const isValidOTP = await verifyOTP(emailOrPhone, otp, purpose);
    if (!isValidOTP) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please request a new one.' },
        { status: 401 }
      );
    }

    let finalCustomer = customer;

    if (!isExistingUser) {
      try {
        const id = await createCustomer({
          name: 'User',
          email: isEmail ? emailOrPhone : '',
          phone: !isEmail ? emailOrPhone.replace(/\D/g, '') : '',
          address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India',
          },
          emailVerified: isEmail,
        });
        const created = await getCustomerById(id);
        if (created) finalCustomer = created;
      } catch (createError: unknown) {
        console.error('[OTP] create customer:', createError);
        const retry = await getCustomerByEmailOrPhone(emailOrPhone);
        if (retry) finalCustomer = retry;
        else {
          return NextResponse.json({ error: 'Failed to create account. Try again.' }, { status: 500 });
        }
      }
    } else {
      if (finalCustomer!.status === 'blocked') {
        return NextResponse.json({ error: 'Account blocked.' }, { status: 403 });
      }
      if (finalCustomer!._id) {
        await updateCustomerLastLogin(String(finalCustomer!._id));
      }
    }

    if (!finalCustomer?._id) {
      return NextResponse.json({ error: 'Account error' }, { status: 500 });
    }

    const token = generateToken({
      _id: String(finalCustomer._id),
      email: finalCustomer.email || emailOrPhone,
      role: 'customer',
    });

    const response = NextResponse.json({
      success: true,
      token,
      customer: {
        _id: String(finalCustomer._id),
        name: finalCustomer.name || '',
        email: finalCustomer.email || '',
        phone: finalCustomer.phone || '',
        emailVerified: finalCustomer.emailVerified || false,
        role: 'customer',
      },
      isNewUser: !isExistingUser,
    });

    response.cookies.set('customerToken', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('[OTP] verify:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    );
  }
}
