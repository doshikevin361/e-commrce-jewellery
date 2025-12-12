import { NextRequest, NextResponse } from 'next/server';
import { connectDB, connectToDatabase } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { getUserFromRequest, isAdmin } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Try to enrich with customer data from MongoDB
    let customerData = null;
    if (order.customer) {
      try {
        const { db } = await connectToDatabase();
        const customerId = typeof order.customer === 'string' 
          ? new ObjectId(order.customer) 
          : order.customer;
        const customer = await db.collection('customers').findOne({ _id: customerId });
        if (customer) {
          customerData = {
            _id: customer._id.toString(),
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          };
        }
      } catch (err) {
        console.error('[Order API] Error fetching customer:', err);
      }
    }

    // Serialize the order
    const serializedOrder = {
      ...order,
      _id: order._id?.toString(),
      customer: customerData || (order.customer ? {
        _id: typeof order.customer === 'string' ? order.customer : order.customer.toString(),
      } : null),
    };

    return NextResponse.json({ order: serializedOrder });
  } catch (error) {
    console.error('[v0] Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const { orderStatus, orderNotes, trackingNumber } = body;

    // Validate order status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (orderStatus) {
      updateData.orderStatus = orderStatus;
      
      // Set timestamps based on status
      if (orderStatus === 'delivered') {
        updateData.deliveredAt = new Date();
      } else if (orderStatus === 'cancelled') {
        updateData.cancelledAt = new Date();
      }
    }

    if (orderNotes !== undefined) {
      updateData.orderNotes = orderNotes;
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    // Update order
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Try to enrich with customer data from MongoDB
    let customerData = null;
    if (order.customer) {
      try {
        const { db } = await connectToDatabase();
        const customerId = typeof order.customer === 'string' 
          ? new ObjectId(order.customer) 
          : order.customer;
        const customer = await db.collection('customers').findOne({ _id: customerId });
        if (customer) {
          customerData = {
            _id: customer._id.toString(),
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          };
        }
      } catch (err) {
        console.error('[Order API] Error fetching customer:', err);
      }
    }

    // Serialize the order
    const serializedOrder = {
      ...order,
      _id: order._id?.toString(),
      customer: customerData || (order.customer ? {
        _id: typeof order.customer === 'string' ? order.customer : order.customer.toString(),
      } : null),
    };

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: serializedOrder,
    });
  } catch (error: any) {
    console.error('[v0] Error updating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to update order',
        details: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

