import { NextRequest, NextResponse } from 'next/server';
import { getRetailerFromRequest } from '@/lib/auth';
import { getRetailerById, updateRetailer } from '@/lib/models/retailer';

function sanitizeRetailer(retailer: Record<string, unknown>) {
  const { password: _, ...rest } = retailer;
  return rest;
}

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
    return NextResponse.json(sanitizeRetailer(retailer as unknown as Record<string, unknown>));
  } catch (e) {
    console.error('[Retailer Profile] GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

/** PUT – Update retailer profile (fullName, companyName, gstNumber, contactNumber, businessAddress). */
export async function PUT(request: NextRequest) {
  try {
    const decoded = getRetailerFromRequest(request);
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};
    if (typeof body.fullName === 'string' && body.fullName.trim()) updates.fullName = body.fullName.trim();
    if (typeof body.companyName === 'string' && body.companyName.trim()) updates.companyName = body.companyName.trim();
    if (typeof body.gstNumber === 'string') updates.gstNumber = body.gstNumber.trim();
    if (typeof body.contactNumber === 'string' && body.contactNumber.trim()) updates.contactNumber = body.contactNumber.trim();
    if (typeof body.businessAddress === 'string') updates.businessAddress = body.businessAddress.trim();
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    await updateRetailer(decoded.id, updates as any);
    const retailer = await getRetailerById(decoded.id);
    if (!retailer) return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    return NextResponse.json(sanitizeRetailer(retailer as unknown as Record<string, unknown>));
  } catch (e) {
    console.error('[Retailer Profile] PUT error:', e);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
