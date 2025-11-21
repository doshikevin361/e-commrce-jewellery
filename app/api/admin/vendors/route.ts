import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hashVendorPassword } from '@/lib/models/vendor';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { storeName: { $regex: search, $options: 'i' } },
      ];
    }

    const vendors = await db.collection('vendors').find(query).sort({ createdAt: -1, _id: -1 }).toArray();

    const serializedVendors = vendors.map(v => {
      const { password, ...vendorWithoutPassword } = v;
      return {
        ...vendorWithoutPassword,
        _id: v._id?.toString(),
      };
    });

    return NextResponse.json({
      vendors: serializedVendors,
      total: serializedVendors.length,
      pending: serializedVendors.filter((v: any) => v.status === 'pending').length,
    });
  } catch (error) {
    console.error('[v0] Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    // Hash the password if provided
    if (body.password) {
      body.password = await hashVendorPassword(body.password);
    }

    const result = await db.collection('vendors').insertOne({
      ...body,
      status: body.status || 'pending',
      registrationDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { _id: result.insertedId.toString(), ...body },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}
