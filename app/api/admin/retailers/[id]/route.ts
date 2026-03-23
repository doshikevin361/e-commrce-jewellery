import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { rejectIfNoAdminAccess } from '@/lib/admin-api-authorize';
import { getRetailerByEmail, hashRetailerPassword } from '@/lib/models/retailer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    const deniedAd = rejectIfNoAdminAccess(request, user, 'admin-only');
    if (deniedAd) return deniedAd;

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid retailer id' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const retailer = await db.collection('retailers').findOne({ _id: new ObjectId(id) });
    if (!retailer) {
      return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    }

    const { password: _, ...rest } = retailer as Record<string, unknown>;
    return NextResponse.json({
      retailer: {
        ...rest,
        _id: (retailer._id as ObjectId).toString(),
      },
    });
  } catch (error) {
    console.error('[Admin] GET retailer error:', error);
    return NextResponse.json({ error: 'Failed to fetch retailer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    const deniedAd = rejectIfNoAdminAccess(request, user, 'admin-only');
    if (deniedAd) return deniedAd;

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid retailer id' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { confirmPassword: _c, _id: __id, createdAt: _ca, ...raw } = body;

    const { db } = await connectToDatabase();
    const existing = await db.collection('retailers').findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    }

    const fullName = str(raw.fullName);
    const email = str(raw.email).toLowerCase();
    const companyName = str(raw.companyName);
    const contactNumber = str(raw.contactNumber);
    const businessAddress = str(raw.businessAddress);
    const gstNumber = str(raw.gstNumber);
    const panNumber = str(raw.panNumber);
    const businessRegistrationNumber = str(raw.businessRegistrationNumber);
    const description = typeof raw.description === 'string' ? raw.description : '';
    const address1 = str(raw.address1);
    const address2 = str(raw.address2);
    const city = str(raw.city);
    const state = str(raw.state);
    const pinCode = str(raw.pinCode);
    const country = str(raw.country) || 'India';
    const alternatePhone = str(raw.alternatePhone);
    const whatsappNumber = str(raw.whatsappNumber);
    const businessType = raw.businessType;
    const bankName = str(raw.bankName);
    const accountHolderName = str(raw.accountHolderName);
    const accountNumber = str(raw.accountNumber);
    const ifscCode = str(raw.ifscCode);
    const upiId = str(raw.upiId);
    const facebook = str(raw.facebook);
    const instagram = str(raw.instagram);
    const twitter = str(raw.twitter);
    const website = str(raw.website);
    const approvalNotes = str(raw.approvalNotes);

    let status: 'pending' | 'approved' | 'blocked' = existing.status as 'pending' | 'approved' | 'blocked';
    if (raw.status === 'approved' || raw.status === 'blocked' || raw.status === 'pending') {
      status = raw.status;
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
    if (!contactNumber) {
      return NextResponse.json({ error: 'Contact number is required' }, { status: 400 });
    }
    if (!address1 || !city || !state || !pinCode) {
      return NextResponse.json({ error: 'Complete address (line 1, city, state, PIN) is required' }, { status: 400 });
    }

    const resolvedBusinessAddress =
      businessAddress ||
      [address1, address2, [city, state, pinCode].filter(Boolean).join(', '), country].filter(Boolean).join(', ');

    if (email !== (existing as { email?: string }).email?.toLowerCase()) {
      const emailTaken = await getRetailerByEmail(email);
      if (emailTaken && emailTaken._id?.toString() !== id) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
      }
      const customer = await db.collection('customers').findOne({ email });
      if (customer) {
        return NextResponse.json({ error: 'This email is already registered as a customer' }, { status: 400 });
      }
      const vendor = await db.collection('vendors').findOne({ email });
      if (vendor) {
        return NextResponse.json({ error: 'This email is already registered as a vendor' }, { status: 400 });
      }
    }

    const passwordRaw = raw.password;
    const updates: Record<string, unknown> = {
      fullName,
      email,
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
      status,
      approvalNotes,
      updatedAt: new Date(),
    };

    if (typeof passwordRaw === 'string' && passwordRaw.length > 0) {
      if (passwordRaw.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }
      updates.password = await hashRetailerPassword(passwordRaw);
    }

    if (status === 'approved' && (existing as { status?: string }).status !== 'approved') {
      updates.approvedAt = new Date();
    }

    await db.collection('retailers').updateOne({ _id: new ObjectId(id) }, { $set: updates });

    const updated = await db.collection('retailers').findOne({ _id: new ObjectId(id) });
    if (!updated) {
      return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    }

    const { password: __p, ...retailerSafe } = updated as Record<string, unknown>;
    return NextResponse.json({
      retailer: {
        ...retailerSafe,
        _id: (updated._id as ObjectId).toString(),
      },
    });
  } catch (error) {
    console.error('[Admin] PUT retailer error:', error);
    return NextResponse.json({ error: 'Failed to update retailer' }, { status: 500 });
  }
}
