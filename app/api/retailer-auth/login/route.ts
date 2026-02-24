import { NextRequest, NextResponse } from 'next/server';
import { getRetailerByEmail, verifyRetailerPassword } from '@/lib/models/retailer';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const retailer = await getRetailerByEmail(email.trim().toLowerCase());
    if (!retailer) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (retailer.status === 'blocked') {
      return NextResponse.json(
        { error: 'Your account has been blocked. Please contact support.' },
        { status: 403 }
      );
    }

    if (retailer.status === 'pending') {
      return NextResponse.json(
        { error: 'Your account is pending approval. You will be able to login once approved.' },
        { status: 401 }
      );
    }

    const match = await verifyRetailerPassword(password, retailer.password);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateToken({
      _id: retailer._id?.toString(),
      email: retailer.email,
      role: 'retailer',
    });

    const response = NextResponse.json({
      success: true,
      token,
      retailer: {
        _id: retailer._id?.toString(),
        fullName: retailer.fullName,
        email: retailer.email,
        companyName: retailer.companyName,
        status: retailer.status,
        trustedVendorIds: retailer.trustedVendorIds || [],
      },
    });

    response.cookies.set('retailerToken', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Retailer Auth] Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
