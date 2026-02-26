import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * GET - List orders where customer bought from this retailer (orderType='retailer', retailerId=self).
 */
export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const retailerId = new ObjectId(retailer.id);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      db
        .collection('orders')
        .find({ orderType: 'retailer', retailerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('orders').countDocuments({ orderType: 'retailer', retailerId }),
    ]);

    const list = orders.map((o: Record<string, unknown>) => ({
      _id: (o._id as ObjectId)?.toString(),
      orderId: o.orderId,
      total: o.total,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      trackingNumber: o.trackingNumber,
      items: o.items,
      shippingAddress: o.shippingAddress,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      createdAt: o.createdAt,
    }));

    return NextResponse.json({
      orders: list,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (e) {
    console.error('[Retailer Sales] GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}
