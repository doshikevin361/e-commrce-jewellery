import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { getCustomerFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    console.log('[Payment Verify] Payment verification request received');

    // Check authentication
    const customer = getCustomerFromRequest(req);
    if (!customer) {
      console.error('[Payment Verify] Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Payment Verify] Customer authenticated:', customer.email);

    // Parse request body
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('[Payment Verify] Missing required fields:', {
        hasOrderId: !!razorpay_order_id,
        hasPaymentId: !!razorpay_payment_id,
        hasSignature: !!razorpay_signature,
      });
      return NextResponse.json(
        { error: 'Missing required payment fields' },
        { status: 400 }
      );
    }

    if (!orderData) {
      console.error('[Payment Verify] Missing order data');
      return NextResponse.json(
        { error: 'Missing order data' },
        { status: 400 }
      );
    }

    console.log('[Payment Verify] Verifying signature for order:', razorpay_order_id);

    // Verify signature
    // Use environment variable if available, otherwise use test key
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '3iw3508rzN2moTDNhyJD9fUh';
    
    if (!keySecret) {
      console.error('[Payment Verify] Razorpay key secret not configured');
      return NextResponse.json(
        { error: 'Payment gateway configuration error' },
        { status: 500 }
      );
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('[Payment Verify] Signature verification failed:', {
        received: razorpay_signature.substring(0, 20) + '...',
        generated: generatedSignature.substring(0, 20) + '...',
      });
      return NextResponse.json(
        { error: 'Invalid payment signature. Payment verification failed.' },
        { status: 400 }
      );
    }

    console.log('[Payment Verify] Signature verified successfully');

    // Connect to database
    await connectDB();
    console.log('[Payment Verify] Database connected');

    // Debug: Check existing orders count
    const existingOrdersCount = await Order.countDocuments({});
    console.log('[Payment Verify] Existing orders in database:', existingOrdersCount);

    // Generate unique order ID
    let orderId: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const orderCount = await Order.countDocuments();
      orderId = `ORD${String(orderCount + 1).padStart(6, '0')}`;
      const existingOrder = await Order.findOne({ orderId });
      
      if (!existingOrder) {
        break;
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        // Fallback to timestamp-based ID
        orderId = `ORD${Date.now()}`;
        break;
      }
    } while (true);

    console.log('[Payment Verify] Generated order ID:', orderId);

    // Validate order data
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.error('[Payment Verify] Invalid order items');
      return NextResponse.json(
        { error: 'Invalid order items' },
        { status: 400 }
      );
    }

    if (!orderData.shippingAddress) {
      console.error('[Payment Verify] Missing shipping address');
      return NextResponse.json(
        { error: 'Missing shipping address' },
        { status: 400 }
      );
    }

    // Convert customer ID to ObjectId if needed
    const mongoose = await import('mongoose');
    let customerObjectId: mongoose.Types.ObjectId;
    
    try {
      if (mongoose.Types.ObjectId.isValid(customer.id)) {
        customerObjectId = new mongoose.Types.ObjectId(customer.id);
      } else {
        console.error('[Payment Verify] Invalid customer ID format:', customer.id);
        return NextResponse.json(
          { error: 'Invalid customer ID' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('[Payment Verify] Error converting customer ID:', error);
      return NextResponse.json(
        { error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }

    console.log('[Payment Verify] Creating order with customer ID:', customerObjectId.toString());

    // Create order in database
    const order = await Order.create({
      orderId,
      customer: customerObjectId,
      customerEmail: customer.email || orderData.customerEmail,
      customerName: orderData.customerName,
      items: orderData.items,
      subtotal: orderData.subtotal || 0,
      shippingCharges: orderData.shippingCharges || 0,
      tax: orderData.tax || 0,
      total: orderData.total,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      orderStatus: 'confirmed',
    });

    console.log('[Payment Verify] Order created successfully:', {
      orderId: order.orderId,
      _id: order._id?.toString(),
      total: order.total,
      itemsCount: order.items.length,
      customer: order.customer?.toString(),
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    });

    // Verify the order was actually saved by querying it back
    const savedOrder = await Order.findById(order._id).lean();
    if (!savedOrder) {
      console.error('[Payment Verify] Order was not saved to database!');
      return NextResponse.json(
        { error: 'Order was not saved to database' },
        { status: 500 }
      );
    }

    console.log('[Payment Verify] Verified order exists in database:', {
      orderId: savedOrder.orderId,
      _id: savedOrder._id?.toString(),
      customer: savedOrder.customer?.toString(),
      total: savedOrder.total,
    });

    // Also verify by orderId
    const orderByOrderId = await Order.findOne({ orderId: savedOrder.orderId }).lean();
    if (!orderByOrderId) {
      console.error('[Payment Verify] Order not found by orderId:', savedOrder.orderId);
    } else {
      console.log('[Payment Verify] Order found by orderId:', orderByOrderId._id?.toString());
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order created successfully',
      orderId: order.orderId,
      order: {
        _id: order._id?.toString(),
        orderId: order.orderId,
        total: order.total,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[Payment Verify] Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Handle duplicate key errors
    if (error.code === 11000) {
      console.error('[Payment Verify] Duplicate order ID detected');
      return NextResponse.json(
        { error: 'Order already exists. Please contact support if this is an error.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to verify payment and create order',
        details: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
