import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay instance
let razorpay: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpay) {
    // Use environment variables if available, otherwise use test keys
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_RpOGb8GwTO1dmp';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '3iw3508rzN2moTDNhyJD9fUh';

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
    }

    console.log('[Razorpay] Initializing with Key ID:', keyId.substring(0, 10) + '...');

    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpay;
}

export async function POST(req: NextRequest) {
  try {
    console.log('[Razorpay] Order creation request received');
    
    // Parse request body
    const body = await req.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    console.log('[Razorpay] Request data:', { amount, currency, receipt, hasNotes: !!notes });

    // Validate required fields
    if (!amount || typeof amount !== 'number') {
      console.error('[Razorpay] Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a number.', details: 'Amount is required and must be a valid number' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      console.error('[Razorpay] Amount is zero or negative:', amount);
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be greater than 0.', details: 'Amount must be greater than zero' },
        { status: 400 }
      );
    }

    // Validate currency
    if (currency !== 'INR') {
      console.warn('[Razorpay] Non-INR currency requested:', currency);
    }

    // Get Razorpay instance
    let razorpayInstance: Razorpay;
    try {
      razorpayInstance = getRazorpayInstance();
    } catch (error: any) {
      console.error('[Razorpay] Initialization error:', error.message);
      return NextResponse.json(
        { error: 'Payment gateway configuration error', details: error.message },
        { status: 500 }
      );
    }

    // Prepare order options
    const amountInPaise = Math.round(amount * 100); // Convert to paise (smallest currency unit)
    const receiptId = receipt || `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const options: any = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receiptId,
      payment_capture: 1, // Auto capture payment
    };

    // Add notes if provided
    if (notes && typeof notes === 'object') {
      options.notes = notes;
    }

    console.log('[Razorpay] Creating order with options:', {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      hasNotes: !!options.notes,
    });

    // Create Razorpay order
    let order;
    try {
      order = await razorpayInstance.orders.create(options);
      console.log('[Razorpay] Order created successfully:', {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
      });
    } catch (razorpayError: any) {
      console.error('[Razorpay] Order creation failed:', {
        error: razorpayError.message,
        description: razorpayError.description,
        field: razorpayError.field,
        source: razorpayError.source,
        step: razorpayError.step,
        reason: razorpayError.reason,
        metadata: razorpayError.metadata,
      });

      // Handle specific Razorpay errors
      if (razorpayError.error) {
        const errorDetails = razorpayError.error;
        return NextResponse.json(
          {
            error: 'Failed to create Razorpay order',
            details: errorDetails.description || errorDetails.message || 'Unknown Razorpay error',
            code: errorDetails.code,
            field: errorDetails.field,
          },
          { status: 400 }
        );
      }

      throw razorpayError;
    }

    // Return success response
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_RpOGb8GwTO1dmp';
    
    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      receipt: order.receipt,
      status: order.status,
    });
  } catch (error: any) {
    console.error('[Razorpay] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      {
        error: 'Failed to create Razorpay order',
        details: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
