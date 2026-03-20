import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { getCustomerFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

export const runtime = 'nodejs';
/** PDF generation needs extra time on Vercel (Chromium cold start). */
export const maxDuration = 60;

// GET - Generate and download invoice as A4 PDF (customer view: MRP + GST). Available for confirmed+ orders.
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const customer = getCustomerFromRequest(req);
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const params = await context.params;

    let customerObjectId: mongoose.Types.ObjectId;

    try {
      if (mongoose.Types.ObjectId.isValid(customer.id)) {
        customerObjectId = new mongoose.Types.ObjectId(customer.id);
      } else {
        return NextResponse.json(
          { error: 'Invalid customer ID' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }

    const order = await Order.findOne({
      _id: params.id,
      customer: customerObjectId,
    }).lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const allowedStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    if (!allowedStatuses.includes(order.orderStatus)) {
      return NextResponse.json(
        { error: 'Invoice is available once the order is confirmed' },
        { status: 400 }
      );
    }

    const { generateInvoicePDFForOrder } = await import('@/lib/invoice');
    const { pdfBuffer, company } = await generateInvoicePDFForOrder(order, 'customer');
    const safeName = company.name.replace(/\s+/g, '-');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderId}-${safeName}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Generate invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error.message },
      { status: 500 }
    );
  }
}
