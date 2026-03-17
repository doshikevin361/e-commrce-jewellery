import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET - List retailer's B2B orders
export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      db.collection('orders').find({ customer: new ObjectId(retailer.id), orderType: 'b2b' }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection('orders').countDocuments({ customer: new ObjectId(retailer.id), orderType: 'b2b' }),
    ]);

    const list = orders.map((o: any) => ({
      _id: o._id?.toString(),
      orderId: o.orderId,
      total: o.total,
      subtotal: o.subtotal,
      shippingCharges: o.shippingCharges,
      tax: o.tax,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      items: o.items,
      shippingAddress: o.shippingAddress,
      createdAt: o.createdAt,
      soldToPortalAt: o.soldToPortalAt ?? null,
    }));

    return NextResponse.json({
      orders: list,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (e) {
    console.error('[Retailer Orders] GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST - Place B2B order (COD)
export async function POST(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { shippingAddress, billingAddress: billingBody, orderNotes, items: itemsBody } = body;

    if (!shippingAddress || !itemsBody || !Array.isArray(itemsBody) || itemsBody.length === 0) {
      return NextResponse.json({ error: 'Shipping address and items are required' }, { status: 400 });
    }

    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country } = shippingAddress;
    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return NextResponse.json({ error: 'Please fill all required address fields' }, { status: 400 });
    }

    const shipAddr = {
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      postalCode,
      country: country || 'India',
    };
    const billAddr = billingBody && billingBody.addressLine1
      ? {
          fullName: billingBody.fullName,
          phone: billingBody.phone,
          addressLine1: billingBody.addressLine1,
          addressLine2: billingBody.addressLine2 || '',
          city: billingBody.city,
          state: billingBody.state,
          postalCode: billingBody.postalCode,
          country: billingBody.country || 'India',
        }
      : shipAddr;

    const { db } = await connectToDatabase();

    const retailerDoc = await db.collection('retailers').findOne(
      { _id: new ObjectId(retailer.id) },
      { projection: { cart: 1, fullName: 1, email: 1, companyName: 1 } }
    );
    if (!retailerDoc) return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });

    const cart = Array.isArray(retailerDoc.cart) ? retailerDoc.cart : [];
    const productIds = cart.map((item: { productId: string }) => item.productId);
    if (productIds.length === 0) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

    const products = await db.collection('products').find({ _id: { $in: productIds.map((id: string) => new ObjectId(id)) }, status: 'active' }).toArray();
    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

    const orderItems: Array<{ product: ObjectId; productName: string; productImage: string; quantity: number; price: number; subtotal: number }> = [];
    let subtotal = 0;
    for (const cartItem of cart) {
      const product = productMap.get(cartItem.productId);
      if (!product) continue;
      const qty = Math.max(1, cartItem.quantity || 1);
      const price = itemsBody.find((i: any) => i.productId === cartItem.productId)?.price ?? product.sellingPrice ?? product.regularPrice ?? 0;
      const itemSubtotal = Number(price) * qty;
      orderItems.push({
        product: product._id,
        productName: product.name || 'Product',
        productImage: product.mainImage || '',
        quantity: qty,
        price: Number(price),
        subtotal: itemSubtotal,
      });
      subtotal += itemSubtotal;
    }
    if (orderItems.length === 0) return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 });

    const shippingCharges = 0;
    const tax = 0;
    const total = subtotal + shippingCharges + tax;

    let orderId: string;
    const orderCount = await db.collection('orders').countDocuments();
    orderId = `B2B${String(orderCount + 1).padStart(6, '0')}`;
    const existing = await db.collection('orders').findOne({ orderId });
    if (existing) orderId = `B2B${Date.now()}`;

    const orderDoc = {
      orderId,
      customer: new ObjectId(retailer.id),
      customerEmail: retailerDoc.email || '',
      customerName: retailerDoc.companyName || retailerDoc.fullName || 'Retailer',
      orderType: 'b2b',
      items: orderItems,
      subtotal,
      shippingCharges,
      tax,
      discountAmount: 0,
      total,
      shippingAddress: shipAddr,
      billingAddress: billAddr,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'confirmed',
      orderNotes: orderNotes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(orderDoc);
    const insertedId = result.insertedId?.toString();

    await db.collection('retailers').updateOne(
      { _id: new ObjectId(retailer.id) },
      { $set: { cart: [], updatedAt: new Date() } }
    );

    // Send invoice PDF by email after B2B order placement
    try {
      const fullOrder = { ...orderDoc, _id: result.insertedId };
      const { generateAndSendInvoice } = await import('@/lib/invoice');
      await generateAndSendInvoice(orderId, fullOrder, { email: retailerDoc.email || retailer.email });
    } catch (invoiceErr) {
      console.error('[Retailer Orders] Failed to send invoice email:', invoiceErr);
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order placed successfully',
      order: { _id: insertedId, orderId, total, orderStatus: 'confirmed' },
    });
  } catch (e) {
    console.error('[Retailer Orders] POST error:', e);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
