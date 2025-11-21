import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isVendor } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
    // Get current user from token
    const currentUser = getUserFromRequest(request);

    const filter: any = {};

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      filter.paymentStatus = status;
    }
    
    // If vendor, only show orders containing their products
    if (currentUser && isVendor(currentUser)) {
      filter['items.vendorId'] = currentUser.id;
    }

    const orders = await db
      .collection('orders')
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    const serializedOrders = orders.map(order => ({
      ...order,
      _id: order._id?.toString(),
    }));

    return NextResponse.json({
      orders: serializedOrders,
      total: serializedOrders.length,
    });
  } catch (error) {
    console.error('[v0] Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
}


