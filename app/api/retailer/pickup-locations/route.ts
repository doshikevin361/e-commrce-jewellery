import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { PICKUP_LOCATIONS_COLLECTION, mongoFilterPickupListRetailer } from '@/lib/pickup-locations';
import { shiprocketAddPickupLocationViaApi, isShiprocketEnabled } from '@/lib/shiprocket';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const filter = mongoFilterPickupListRetailer(retailer.id);
    const list = await db
      .collection(PICKUP_LOCATIONS_COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const locations = list.map((d: Record<string, unknown>) => ({
      _id: String(d._id),
      ownerType: d.ownerType,
      ownerId: d.ownerId,
      pickupLocation: d.pickupLocation,
      name: d.name,
      email: d.email,
      phone: d.phone,
      address: d.address,
      address2: d.address2,
      city: d.city,
      state: d.state,
      country: d.country,
      pinCode: d.pinCode,
      createdAt: d.createdAt,
    }));

    return NextResponse.json({ locations, shiprocketEnabled: isShiprocketEnabled() });
  } catch (e: unknown) {
    console.error('[retailer pickup-locations] GET', e);
    return NextResponse.json({ error: 'Failed to list pickup locations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isShiprocketEnabled()) {
      return NextResponse.json({ error: 'Shiprocket is disabled' }, { status: 503 });
    }

    const body = await request.json();
    const pickupLocation = typeof body.pickupLocation === 'string' ? body.pickupLocation.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const address = typeof body.address === 'string' ? body.address.trim() : '';
    const address2 = typeof body.address2 === 'string' ? body.address2.trim() : '';
    const city = typeof body.city === 'string' ? body.city.trim() : '';
    const state = typeof body.state === 'string' ? body.state.trim() : '';
    const country = typeof body.country === 'string' ? body.country.trim() : 'India';
    const pinCode = typeof body.pinCode === 'string' ? body.pinCode.replace(/\s/g, '').trim() : '';

    if (!pickupLocation || pickupLocation.length < 2) {
      return NextResponse.json({ error: 'Pickup location name (nickname) is required' }, { status: 400 });
    }
    if (!name || !email || !phone || !address || !city || !state || !pinCode || pinCode.length !== 6) {
      return NextResponse.json(
        { error: 'name, email, phone, address, city, state, 6-digit pinCode are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const dup = await db.collection(PICKUP_LOCATIONS_COLLECTION).findOne({ pickupLocation });
    if (dup) {
      return NextResponse.json(
        { error: 'This pickup location nickname is already used. Choose another name.' },
        { status: 400 }
      );
    }

    const sr = await shiprocketAddPickupLocationViaApi({
      pickup_location: pickupLocation,
      name,
      email,
      phone,
      address,
      address_2: address2,
      city,
      state,
      country,
      pin_code: pinCode,
    });

    if (!sr.success) {
      return NextResponse.json({ error: sr.error || 'Shiprocket rejected this address' }, { status: 400 });
    }

    const now = new Date();
    const ins = await db.collection(PICKUP_LOCATIONS_COLLECTION).insertOne({
      ownerType: 'retailer',
      ownerId: retailer.id,
      pickupLocation,
      name,
      email,
      phone,
      address,
      address2: address2 || undefined,
      city,
      state,
      country,
      pinCode,
      shiprocketResponse: sr.data ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      location: {
        _id: String(ins.insertedId),
        ownerType: 'retailer',
        ownerId: retailer.id,
        pickupLocation,
        name,
        email,
        phone,
        address,
        address2,
        city,
        state,
        country,
        pinCode,
        createdAt: now,
      },
    });
  } catch (e: unknown) {
    console.error('[retailer pickup-locations] POST', e);
    const msg = e instanceof Error ? e.message : 'Failed to save pickup location';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
