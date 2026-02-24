import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

/** Public list of approved vendors for B2B retailer registration (trusted vendor selection). */
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const vendors = await db
      .collection('vendors')
      .find({ status: 'approved' })
      .project({ _id: 1, storeName: 1, email: 1 })
      .sort({ storeName: 1 })
      .toArray();
    const list = vendors.map((v: any) => ({
      _id: v._id?.toString(),
      storeName: v.storeName || '',
      email: v.email || '',
    }));
    return NextResponse.json({ vendors: list });
  } catch (error) {
    console.error('[Retailers] Failed to fetch vendors:', error);
    return NextResponse.json({ error: 'Failed to load vendors' }, { status: 500 });
  }
}
