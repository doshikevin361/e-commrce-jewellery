import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerByEmail, createRetailer, hashRetailerPassword } from '@/lib/models/retailer';
import type { Retailer } from '@/lib/models/retailer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Same multi-step payload as `POST /api/vendor-registration` (retailer/register mirrors vendor flow). */
function isVendorStyleBody(body: Record<string, unknown>): boolean {
  return typeof body.businessEmail === 'string' && body.businessEmail.trim().length > 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (isVendorStyleBody(body)) {
      const requiredFields = [
        'businessName',
        'businessEmail',
        'businessPhone',
        'addressLine1',
        'city',
        'state',
        'pincode',
        'password',
      ] as const;
      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json({ error: `${field} is required` }, { status: 400 });
        }
      }

      const password = body.password;
      if (typeof password !== 'string' || password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }

      const email = String(body.businessEmail).trim().toLowerCase();
      if (!EMAIL_REGEX.test(email)) {
        return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
      }

      const fullName = String(body.supplierName || '').trim();
      const companyName = String(body.businessName).trim();
      const contactNumber = String(body.businessPhone).trim();
      if (!fullName || !companyName || !contactNumber) {
        return NextResponse.json(
          { error: 'Owner name, store name, and business phone are required' },
          { status: 400 }
        );
      }

      const hasGST = Boolean(body.hasGST);
      const gstNumberVal = hasGST ? String(body.gstin || '').trim() : '';

      const addressLine1 = String(body.addressLine1 || '').trim();
      const addressLine2 = String(body.addressLine2 || '').trim();
      const city = String(body.city || '').trim();
      const state = String(body.state || '').trim();
      const pincode = String(body.pincode || '').trim();
      const businessAddress = [addressLine1, addressLine2, city, state, pincode]
        .filter(Boolean)
        .join(', ');

      const existing = await getRetailerByEmail(email);
      if (existing) {
        return NextResponse.json(
          { error: 'A retailer with this email already exists' },
          { status: 400 }
        );
      }

      const { db } = await connectToDatabase();
      const existingCustomer = await db.collection('customers').findOne({ email });
      if (existingCustomer) {
        return NextResponse.json(
          { error: 'This email is already registered as a customer' },
          { status: 400 }
        );
      }
      const existingVendor = await db.collection('vendors').findOne({ email });
      if (existingVendor) {
        return NextResponse.json(
          { error: 'This email is already registered as a vendor' },
          { status: 400 }
        );
      }

      const hashedPassword = await hashRetailerPassword(password);

      const businessType =
        body.businessType === 'company' || body.businessType === 'partnership'
          ? body.businessType
          : 'individual';

      const doc: Omit<Retailer, '_id'> = {
        fullName,
        email,
        password: hashedPassword,
        companyName,
        gstNumber: gstNumberVal,
        contactNumber,
        businessAddress,
        address1: addressLine1,
        address2: addressLine2 || undefined,
        city,
        state,
        pinCode: pincode,
        country: 'India',
        alternatePhone: String(body.supplierPhone || '').trim() || undefined,
        whatsappNumber: String(body.whatsappNumber || '').trim() || undefined,
        businessType: businessType as Retailer['businessType'],
        bankName: String(body.bankName || '').trim() || undefined,
        accountHolderName: String(body.accountHolderName || '').trim() || undefined,
        accountNumber: String(body.accountNumber || '').trim() || undefined,
        ifscCode: String(body.ifscCode || '')
          .replace(/\s/g, '')
          .toUpperCase() || undefined,
        description: `Retailer — ${companyName}`,
        trustedVendorIds: [],
        status: 'pending',
        approvalNotes: '',
        emailVerified: Boolean(body.otpVerified),
      };

      await createRetailer(doc);

      return NextResponse.json({
        success: true,
        message:
          'Retailer registration submitted. Your account will be active after admin approval.',
      });
    }

    // Legacy single-form registration
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
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
