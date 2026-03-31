import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(req);
    if (!retailer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 });
    }
    if (!orderData?.items?.length || !orderData?.shippingAddress) {
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '3iw3508rzN2moTDNhyJD9fUh';
    if (!keySecret) {
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const retailerDoc = await db.collection('retailers').findOne(
      { _id: new ObjectId(retailer.id) },
      { projection: { email: 1, companyName: 1, fullName: 1 } }
    );
    if (!retailerDoc) return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });

    const orderCount = await db.collection('orders').countDocuments();
    let orderId = `B2B${String(orderCount + 1).padStart(6, '0')}`;
    const existing = await db.collection('orders').findOne({ orderId });
    if (existing) orderId = `B2B${Date.now()}`;

    const items = orderData.items.map((item: any) => ({
      product: item.product ? new ObjectId(item.product) : new ObjectId(item.productId),
      productName: item.productName || item.name || 'Product',
      productImage: item.productImage || item.image || '',
      quantity: item.quantity || 1,
      price: Number(item.price) || 0,
      subtotal: Number(item.subtotal) || 0,
    }));

    const shippingAddress = {
      fullName: orderData.shippingAddress.fullName,
      phone: orderData.shippingAddress.phone,
      addressLine1: orderData.shippingAddress.addressLine1,
      addressLine2: orderData.shippingAddress.addressLine2 || '',
      city: orderData.shippingAddress.city,
      state: orderData.shippingAddress.state,
      postalCode: orderData.shippingAddress.postalCode,
      country: orderData.shippingAddress.country || 'India',
    };
    const billingAddress = orderData.billingAddress
      ? {
          fullName: orderData.billingAddress.fullName,
          phone: orderData.billingAddress.phone,
          addressLine1: orderData.billingAddress.addressLine1,
          addressLine2: orderData.billingAddress.addressLine2 || '',
          city: orderData.billingAddress.city,
          state: orderData.billingAddress.state,
          postalCode: orderData.billingAddress.postalCode,
          country: orderData.billingAddress.country || 'India',
        }
      : shippingAddress;

    const orderDoc = {
      orderId,
      customer: new ObjectId(retailer.id),
      customerEmail: retailerDoc.email || '',
      customerName: retailerDoc.companyName || retailerDoc.fullName || 'Retailer',
      orderType: 'b2b',
      items,
      subtotal: orderData.subtotal ?? 0,
      shippingCharges: orderData.shippingCharges ?? 0,
      tax: orderData.tax ?? 0,
      discountAmount: orderData.discountAmount ?? 0,
      total: orderData.total ?? 0,
      shippingAddress,
      billingAddress,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      orderStatus: 'confirmed',
      orderNotes: orderData.orderNotes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(orderDoc);
    const insertedId = result.insertedId?.toString();
    await db.collection('retailers').updateOne(
      { _id: new ObjectId(retailer.id) },
      { $set: { cart: [], updatedAt: new Date() } }
    );

    // Invoice PDF by email (same as COD B2B in POST /api/retailer/orders)
    try {
      const fullOrder = { ...orderDoc, _id: result.insertedId };
      const { generateAndSendInvoice } = await import('@/lib/invoice');
      await generateAndSendInvoice(orderId, fullOrder, {
        email: retailerDoc.email || retailer.email || '',
      });
    } catch (invoiceErr) {
      console.error('[Retailer Payment Verify] Failed to send invoice email:', invoiceErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order created successfully',
      orderId,
      order: {
        _id: insertedId,
        orderId,
        total: orderDoc.total,
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
      },
    });
  } catch (e: any) {
    console.error('[Retailer Payment Verify] Error:', e);
    return NextResponse.json(
      { error: 'Failed to verify payment', details: e.message },
      { status: 500 }
    );
  }
}
