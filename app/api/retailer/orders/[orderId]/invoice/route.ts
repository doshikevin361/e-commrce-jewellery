import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Download invoice PDF for retailer (B2B view: wholesale, bulk discount, no MRP).
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await context.params;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const retailerId = new ObjectId(retailer.id);

    let order: any = null;
    if (orderId.length === 24 && /^[a-fA-F0-9]{24}$/.test(orderId)) {
      order = await db.collection('orders').findOne({ _id: new ObjectId(orderId), customer: retailerId, orderType: 'b2b' });
    }
    if (!order) {
      order = await db.collection('orders').findOne({ orderId: orderId.trim(), customer: retailerId, orderType: 'b2b' });
    }
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { generateInvoicePDFForOrder } = await import('@/lib/invoice');
    const { pdfBuffer, company } = await generateInvoicePDFForOrder(order, 'retailer');
    const safeName = company.name.replace(/\s+/g, '-');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderId}-${safeName}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('[Retailer Invoice] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error.message },
      { status: 500 }
    );
  }
}
