import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerByEmail, createRetailer, hashRetailerPassword } from '@/lib/models/retailer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = body.password;
    const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : '';
    const gstNumber = typeof body.gstNumber === 'string' ? body.gstNumber.trim() : '';
    const contactNumber = typeof body.contactNumber === 'string' ? body.contactNumber.trim() : '';
    const businessAddress = typeof body.businessAddress === 'string' ? body.businessAddress.trim() : '';
    const trustedVendorIds = Array.isArray(body.trustedVendorIds)
      ? body.trustedVendorIds.filter((id: unknown) => typeof id === 'string' && id.length > 0)
      : [];

    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }
    if (!companyName) {
      return NextResponse.json({ error: 'Company/Store name is required' }, { status: 400 });
    }
    const gstNumberVal = gstNumber || '';
    if (!contactNumber) {
      return NextResponse.json({ error: 'Contact number is required' }, { status: 400 });
    }
    if (!businessAddress) {
      return NextResponse.json({ error: 'Business address is required' }, { status: 400 });
    }

    const existing = await getRetailerByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const existingCustomer = await db.collection('customers').findOne({ email });
    if (existingCustomer) {
      return NextResponse.json({ error: 'This email is already registered as a customer' }, { status: 400 });
    }
    const existingVendor = await db.collection('vendors').findOne({ email });
    if (existingVendor) {
      return NextResponse.json({ error: 'This email is already registered as a vendor' }, { status: 400 });
    }

    const hashedPassword = await hashRetailerPassword(password);

    await createRetailer({
      fullName,
      email,
      password: hashedPassword,
      companyName,
      gstNumber: gstNumberVal,
      contactNumber,
      businessAddress,
      trustedVendorIds,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Registration submitted. Your account will be active after admin approval.',
    });
  } catch (error) {
    console.error('[Retailer Auth] Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
