import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * PATCH - Update order status and/or tracking number (only for retailer's sales orders).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId } = await params;
    if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const { orderStatus, trackingNumber } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (orderStatus && validStatuses.includes(orderStatus)) {
      updates.orderStatus = orderStatus;
      if (orderStatus === 'delivered') {
        updates.deliveredAt = new Date();
      }
    }
    if (typeof trackingNumber === 'string') {
      updates.trackingNumber = trackingNumber.trim();
    }

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: 'Provide orderStatus and/or trackingNumber' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const retailerId = new ObjectId(retailer.id);

    const result = await db.collection('orders').findOneAndUpdate(
      { orderId: orderId.trim(), orderType: 'retailer', retailerId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Order not found or not yours' }, { status: 404 });
    }

    const o = result as Record<string, unknown>;
    return NextResponse.json({
      success: true,
      order: {
        orderId: o.orderId,
        orderStatus: o.orderStatus,
        trackingNumber: o.trackingNumber,
      },
    });
  } catch (e) {
    console.error('[Retailer Order Tracking] PATCH error:', e);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
