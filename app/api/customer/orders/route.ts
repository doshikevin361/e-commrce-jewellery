import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { getCustomerFromRequest } from '@/lib/auth';

// GET - Fetch orders for customer
export async function GET(req: NextRequest) {
  try {
    const customer = getCustomerFromRequest(req);
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // Convert customer ID to ObjectId
    const mongoose = await import('mongoose');
    let customerObjectId: mongoose.Types.ObjectId;
    
    try {
      if (mongoose.Types.ObjectId.isValid(customer.id)) {
        customerObjectId = new mongoose.Types.ObjectId(customer.id);
      } else {
        console.error('[Customer Orders] Invalid customer ID format:', customer.id);
        return NextResponse.json(
          { error: 'Invalid customer ID' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('[Customer Orders] Error converting customer ID:', error);
      return NextResponse.json(
        { error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }

    const [orders, total] = await Promise.all([
      Order.find({ customer: customerObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ customer: customerObjectId }),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch customer orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}
