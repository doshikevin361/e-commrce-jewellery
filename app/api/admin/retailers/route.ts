import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { rejectIfNoAdminAccess } from '@/lib/admin-api-authorize';
import { getRetailerByEmail, hashRetailerPassword } from '@/lib/models/retailer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const deniedAd = rejectIfNoAdminAccess(request, user, 'admin-only');
    if (deniedAd) return deniedAd;
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    let query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search && search.trim()) {
      query.$or = [
        { fullName: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { companyName: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    const retailers = await db
      .collection('retailers')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    const list = retailers.map((r: any) => {
      const { password, ...rest } = r;
      return { ...rest, _id: r._id?.toString() };
    });
    return NextResponse.json({ retailers: list, total: list.length });
  } catch (error) {
    console.error('[Admin] GET retailers error:', error);
    return NextResponse.json({ error: 'Failed to fetch retailers' }, { status: 500 });
  }
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const deniedAd = rejectIfNoAdminAccess(request, user, 'admin-only');
    if (deniedAd) return deniedAd;

    const body = await request.json().catch(() => ({}));

    const fullName = str(body.fullName);
    const email = str(body.email).toLowerCase();
    const password = body.password;
    const companyName = str(body.companyName);
    const contactNumber = str(body.contactNumber);
    const businessAddress = str(body.businessAddress);
    const gstNumber = str(body.gstNumber);
    const panNumber = str(body.panNumber);
    const businessRegistrationNumber = str(body.businessRegistrationNumber);
    const description = typeof body.description === 'string' ? body.description : '';
    const address1 = str(body.address1);
    const address2 = str(body.address2);
    const city = str(body.city);
    const state = str(body.state);
    const pinCode = str(body.pinCode);
    const country = str(body.country) || 'India';
    const alternatePhone = str(body.alternatePhone);
    const whatsappNumber = str(body.whatsappNumber);
    const businessType = body.businessType;
    const bankName = str(body.bankName);
    const accountHolderName = str(body.accountHolderName);
    const accountNumber = str(body.accountNumber);
    const ifscCode = str(body.ifscCode);
    const upiId = str(body.upiId);
    const facebook = str(body.facebook);
    const instagram = str(body.instagram);
    const twitter = str(body.twitter);
    const website = str(body.website);
    const approvalNotes = str(body.approvalNotes);
    const trustedVendorIds = Array.isArray(body.trustedVendorIds)
      ? body.trustedVendorIds.filter((id: unknown) => typeof id === 'string' && id.length > 0)
      : [];

    let status: 'pending' | 'approved' | 'blocked' = 'pending';
    if (body.status === 'approved' || body.status === 'blocked' || body.status === 'pending') {
      status = body.status;
    }

    if (!fullName) {
      return NextResponse.json({ error: 'Contact name is required' }, { status: 400 });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!companyName) {
      return NextResponse.json({ error: 'Company / store name is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!contactNumber) {
      return NextResponse.json({ error: 'Contact number is required' }, { status: 400 });
    }
    if (!address1 || !city || !state || !pinCode) {
      return NextResponse.json({ error: 'Complete address (line 1, city, state, PIN) is required' }, { status: 400 });
    }

    const resolvedBusinessAddress =
      businessAddress ||
      [address1, address2, [city, state, pinCode].filter(Boolean).join(', '), country].filter(Boolean).join(', ');

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
    const now = new Date();

    const doc: Record<string, unknown> = {
      fullName,
      email,
      password: hashedPassword,
      companyName,
      gstNumber,
      contactNumber,
      businessAddress: resolvedBusinessAddress,
      address1,
      address2,
      city,
      state,
      pinCode,
      country,
      alternatePhone,
      whatsappNumber,
      businessType:
        businessType === 'company' || businessType === 'partnership' || businessType === 'individual'
          ? businessType
          : 'individual',
      panNumber,
      businessRegistrationNumber,
      description,
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      upiId,
      facebook,
      instagram,
      twitter,
      website,
      trustedVendorIds,
      status,
      approvalNotes,
      createdAt: now,
      updatedAt: now,
    };

    if (status === 'approved') {
      doc.approvedAt = now;
    }

    const result = await db.collection('retailers').insertOne(doc);

    return NextResponse.json(
      {
        success: true,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin] POST retailers error:', error);
    return NextResponse.json({ error: 'Failed to create retailer' }, { status: 500 });
  }
}
