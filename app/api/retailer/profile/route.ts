import { NextRequest, NextResponse } from 'next/server';
import { getRetailerFromRequest } from '@/lib/auth';
import { getRetailerById, updateRetailer } from '@/lib/models/retailer';

function sanitizeRetailer(retailer: Record<string, unknown>) {
  const { password: _, ...rest } = retailer;
  return rest;
}

const ALLOWED_PUT_FIELDS = [
  'fullName',
  'companyName',
  'gstNumber',
  'contactNumber',
  'businessAddress',
  'address1',
  'address2',
  'city',
  'state',
  'pinCode',
  'country',
  'alternatePhone',
  'whatsappNumber',
  'businessType',
  'panNumber',
  'businessRegistrationNumber',
  'description',
  'bankName',
  'accountHolderName',
  'accountNumber',
  'ifscCode',
  'upiId',
  'facebook',
  'instagram',
  'twitter',
  'website',
] as const;

/** GET – Fetch current retailer profile (no password). */
export async function GET(request: NextRequest) {
  try {
    const decoded = getRetailerFromRequest(request);
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const retailer = await getRetailerById(decoded.id);
    if (!retailer) {
      return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      retailer: sanitizeRetailer(retailer as unknown as Record<string, unknown>),
    });
  } catch (e) {
    console.error('[Retailer Profile] GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

/** PUT – Update retailer profile (vendor-style fields + bank details). */
export async function PUT(request: NextRequest) {
  try {
    const decoded = getRetailerFromRequest(request);
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};

    for (const field of ALLOWED_PUT_FIELDS) {
      if (body[field] === undefined) continue;
      const v = body[field];
      if (field === 'businessType') {
        if (v === 'individual' || v === 'company' || v === 'partnership') {
          updates[field] = v;
        }
        continue;
      }
      if (typeof v === 'string') {
        updates[field] = v.trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    if (updates.fullName !== undefined && !String(updates.fullName).trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (updates.companyName !== undefined && !String(updates.companyName).trim()) {
      return NextResponse.json({ error: 'Company / shop name is required' }, { status: 400 });
    }
    if (updates.contactNumber !== undefined && !String(updates.contactNumber).trim()) {
      return NextResponse.json({ error: 'Contact number is required' }, { status: 400 });
    }

    await updateRetailer(decoded.id, updates as any);
    const retailer = await getRetailerById(decoded.id);
    if (!retailer) return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      retailer: sanitizeRetailer(retailer as unknown as Record<string, unknown>),
    });
  } catch (e) {
    console.error('[Retailer Profile] PUT error:', e);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
