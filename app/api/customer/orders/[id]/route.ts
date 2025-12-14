import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { getCustomerFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

// GET - Fetch a single order by ID for customer
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

    // Fetch the order and verify it belongs to the customer
    const order = await Order.findOne({
      _id: params.id,
      customer: customerObjectId
    }).lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Fetch order details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error.message },
      { status: 500 }
    );
  }
}
