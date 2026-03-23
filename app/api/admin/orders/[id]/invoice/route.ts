import { NextRequest, NextResponse } from 'next/server';
import { connectDB, connectToDatabase } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { getUserFromRequest, isAdminOrVendor, isVendor } from '@/lib/auth';
import { rejectIfNoAdminAccess } from '@/lib/admin-api-authorize';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// GET - Download invoice PDF for admin/vendor. View type based on order (B2B = retailer view, else customer).
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    const deniedOr = rejectIfNoAdminAccess(request, user, 'admin-or-vendor');
    if (deniedOr) return deniedOr;

    await connectDB();
    const { id } = await context.params;

    let order = await Order.findById(id).lean();
    if (!order && id?.length === 24) {
      try {
        order = await Order.findOne({ _id: new ObjectId(id) }).lean();
      } catch (_) {}
    }
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (isVendor(user)) {
      const { db } = await connectToDatabase();
      const vendorProducts = await db.collection('products').find({ vendorId: user.id }).project({ _id: 1 }).toArray();
      const vendorProductIds = vendorProducts.map((p: any) => p._id.toString());
      const hasAccess = order.items?.some((item: any) => vendorProductIds.includes(item.product?.toString?.() || item.product));
      if (!hasAccess) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
    }

    const viewType = order.orderType === 'b2b' ? 'retailer' : 'customer';
    const { generateInvoicePDFForOrder } = await import('@/lib/invoice');
    const { pdfBuffer, company } = await generateInvoicePDFForOrder(order, viewType);
    const safeName = company.name.replace(/\s+/g, '-');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderId}-${safeName}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('[Admin Invoice] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error.message },
      { status: 500 }
    );
  }
}
