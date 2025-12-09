import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByEmail, verifyCustomerPassword } from '@/lib/models/customer';
import { generateUserToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get customer
    const customer = await getCustomerByEmail(email);
    if (!customer) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is blocked
    if (customer.status === 'blocked') {
      return NextResponse.json(
        { error: 'Your account has been blocked. Please contact support.' },
        { status: 403 }
      );
    }

    // Check if email is verified
    if (!customer.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email address before logging in. Check your inbox for the verification link.',
          requiresVerification: true 
        },
        { status: 401 }
      );
    }

    // Verify password
    if (!customer.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordMatch = await verifyCustomerPassword(password, customer.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    const { db } = await connectToDatabase();
    await db.collection('customers').updateOne(
      { _id: new ObjectId(customer._id!) },
      { $set: { lastLogin: new Date() } }
    );

    // Generate token
    const token = generateUserToken({
      _id: customer._id,
      email: customer.email,
      role: 'customer',
    });

    // Return customer data (without password)
    const { password: _, ...customerData } = customer;

    const response = NextResponse.json({
      success: true,
      token,
      customer: {
        _id: customer._id,
        name: customer.name,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar,
        address: customer.address,
        billingAddress: customer.billingAddress,
        emailVerified: customer.emailVerified,
      },
    });

    // Set cookie
    response.cookies.set('customerToken', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Customer Auth] Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login. Please try again.' },
      { status: 500 }
    );
  }
}

