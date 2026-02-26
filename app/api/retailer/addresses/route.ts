import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';

// GET - Fetch all addresses for retailer
export async function GET(req: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(req);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const retailerData = await db.collection('retailers').findOne(
      { _id: new ObjectId(retailer.id) },
      { projection: { addresses: 1 } }
    );
    const addresses = retailerData?.addresses || [];
    return NextResponse.json({ success: true, addresses });
  } catch (e: any) {
    console.error('[Retailer Addresses] GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch addresses', details: e.message }, { status: 500 });
  }
}

// POST - Add new address
export async function POST(req: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(req);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, addressType, isDefault } = body;
    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const retailerData = await db.collection('retailers').findOne(
      { _id: new ObjectId(retailer.id) },
      { projection: { addresses: 1 } }
    );
    const addresses = Array.isArray(retailerData?.addresses) ? retailerData.addresses : [];

    const newAddress = {
      _id: new ObjectId().toString(),
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      postalCode,
      country,
      addressType: addressType || 'home',
      isDefault: isDefault ?? (addresses.length === 0),
      createdAt: new Date().toISOString(),
    };

    if (newAddress.isDefault) {
      addresses.forEach((a: any) => { a.isDefault = false; });
    }
    addresses.push(newAddress);

    await db.collection('retailers').updateOne(
      { _id: new ObjectId(retailer.id) },
      { $set: { addresses, updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true, address: newAddress, message: 'Address added successfully' });
  } catch (e: any) {
    console.error('[Retailer Addresses] POST error:', e);
    return NextResponse.json({ error: 'Failed to add address', details: e.message }, { status: 500 });
  }
}

// PUT - Update address
export async function PUT(req: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(req);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { addressId, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, addressType, isDefault } = body;
    if (!addressId) return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });

    const { db } = await connectToDatabase();
    const retailerData = await db.collection('retailers').findOne(
      { _id: new ObjectId(retailer.id) },
      { projection: { addresses: 1 } }
    );
    const addresses = Array.isArray(retailerData?.addresses) ? retailerData.addresses : [];
    const idx = addresses.findIndex((a: any) => a._id === addressId);
    if (idx === -1) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

    const updated = {
      ...addresses[idx],
      fullName: fullName ?? addresses[idx].fullName,
      phone: phone ?? addresses[idx].phone,
      addressLine1: addressLine1 ?? addresses[idx].addressLine1,
      addressLine2: addressLine2 !== undefined ? addressLine2 : addresses[idx].addressLine2,
      city: city ?? addresses[idx].city,
      state: state ?? addresses[idx].state,
      postalCode: postalCode ?? addresses[idx].postalCode,
      country: country ?? addresses[idx].country,
      addressType: addressType ?? addresses[idx].addressType,
      isDefault: isDefault !== undefined ? isDefault : addresses[idx].isDefault,
      updatedAt: new Date().toISOString(),
    };
    if (updated.isDefault) {
      addresses.forEach((a: any, i: number) => { if (i !== idx) a.isDefault = false; });
    }
    addresses[idx] = updated;

    await db.collection('retailers').updateOne(
      { _id: new ObjectId(retailer.id) },
      { $set: { addresses, updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true, address: updated, message: 'Address updated successfully' });
  } catch (e: any) {
    console.error('[Retailer Addresses] PUT error:', e);
    return NextResponse.json({ error: 'Failed to update address', details: e.message }, { status: 500 });
  }
}

// DELETE - Delete address
export async function DELETE(req: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(req);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const addressId = new URL(req.url).searchParams.get('addressId');
    if (!addressId) return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });

    const { db } = await connectToDatabase();
    const retailerData = await db.collection('retailers').findOne(
      { _id: new ObjectId(retailer.id) },
      { projection: { addresses: 1 } }
    );
    const addresses = Array.isArray(retailerData?.addresses) ? retailerData.addresses : [];
    const filtered = addresses.filter((a: any) => a._id !== addressId);
    if (filtered.length === addresses.length) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

    const deleted = addresses.find((a: any) => a._id === addressId);
    if (deleted?.isDefault && filtered.length > 0) filtered[0].isDefault = true;

    await db.collection('retailers').updateOne(
      { _id: new ObjectId(retailer.id) },
      { $set: { addresses: filtered, updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true, message: 'Address deleted successfully' });
  } catch (e: any) {
    console.error('[Retailer Addresses] DELETE error:', e);
    return NextResponse.json({ error: 'Failed to delete address', details: e.message }, { status: 500 });
  }
}
