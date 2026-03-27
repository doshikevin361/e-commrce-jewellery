import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { mapShiprocketStatusToOrderStatus } from '@/lib/shiprocket';

// POST - Receive Shiprocket tracking/status webhooks
export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      const raw = await request.text();
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }

    const webhookToken = process.env.SHIPROCKET_WEBHOOK_SECRET || process.env.SHIPROCKET_WEBHOOK_TOKEN;
    if (webhookToken) {
      const provided = request.headers.get('x-api-key') || request.headers.get('x-shiprocket-secret');
      if (provided !== webhookToken) {
        console.warn('[Shiprocket][Webhook] unauthorized — token mismatch');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!body || Object.keys(body).length === 0) {
      console.log('[Shiprocket][Webhook] ping / empty body');
      return NextResponse.json({ success: true, message: 'Webhook active' }, { status: 200 });
    }

    const shipment = body.data || body.shipment || body;
    const shipmentId = shipment.shipment_id || shipment.shipmentId || shipment.id;
    const status = shipment.status || shipment.current_status || shipment.shipment_status;
    const awbCode = shipment.awb_code || shipment.awbCode || shipment.tracking_number;
    const courierName = shipment.courier_name || shipment.courierName;
    const history = shipment.tracking_data?.track_history || shipment.track_history || [];

    if (!shipmentId) {
      console.log('[Shiprocket][Webhook] no shipment_id in payload');
      return NextResponse.json({ success: true, message: 'No shipment id' }, { status: 200 });
    }

    console.log('[Shiprocket][Webhook] received', {
      shipmentId,
      status,
      awbCode: awbCode ? String(awbCode).slice(0, 8) + '…' : undefined,
    });

    const { db } = await connectToDatabase();
    const order = await db.collection('orders').findOne({ shiprocketShipmentId: Number(shipmentId) });
    if (!order) {
      console.warn('[Shiprocket][Webhook] no local order for shipmentId', { shipmentId });
      return NextResponse.json({ success: true, message: 'Order not found' }, { status: 200 });
    }

    const mappedStatus = status ? mapShiprocketStatusToOrderStatus(status) : undefined;
    console.log('[Shiprocket][Webhook] updating order', {
      orderId: order.orderId,
      mongoId: String(order._id),
      rawStatus: status,
      mappedStatus,
    });
    const trackingEvents = Array.isArray(history)
      ? history
          .map((e: any) => ({
            status: e.status || e.current_status || '',
            location: e.location || e.city || '',
            timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
            description: e.message || e.status || '',
          }))
          .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
      : [];

    const update: any = {
      updatedAt: new Date(),
      shiprocketCurrentStatus: status || order.shiprocketCurrentStatus,
    };
    if (awbCode) update.trackingNumber = awbCode;
    if (courierName) update.courierName = courierName;
    if (mappedStatus) update.orderStatus = mappedStatus;
    if (trackingEvents.length) update.trackingEvents = trackingEvents;
    if (mappedStatus === 'delivered' && !order.deliveredAt) update.deliveredAt = new Date();

    await db.collection('orders').updateOne({ _id: order._id }, { $set: update });

    console.log('[Shiprocket][Webhook] order updated', { orderId: order.orderId, mongoId: String(order._id) });
    return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 });
  } catch (error: any) {
    console.error('[Shiprocket][Webhook] error', error?.message || error);
    // Return 200 to avoid retries for transient local errors
    return NextResponse.json({ success: false, error: error?.message || 'Webhook processing failed' }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, status: 'ok', endpoint: '/api/webhooks/tracking' }, { status: 200 });
}

