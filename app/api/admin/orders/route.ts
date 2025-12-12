import { NextRequest, NextResponse } from 'next/server';
import { connectDB, connectToDatabase } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { getUserFromRequest, isAdmin } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Debug: Check total orders count using Mongoose
    const totalOrdersCount = await Order.countDocuments({});
    console.log('[Admin Orders] Total orders in database (Mongoose):', totalOrdersCount);
    
    // Also check using direct MongoDB connection
    try {
      const { db } = await connectToDatabase();
      const directOrdersCount = await db.collection('orders').countDocuments({});
      console.log('[Admin Orders] Total orders in database (Direct MongoDB):', directOrdersCount);
      
      if (directOrdersCount > 0 && totalOrdersCount === 0) {
        console.warn('[Admin Orders] WARNING: Orders exist in MongoDB but Mongoose query returns 0!');
        // Try to get orders directly from MongoDB
        const directOrders = await db.collection('orders').find({}).limit(5).toArray();
        console.log('[Admin Orders] Sample direct orders:', directOrders.map(o => ({
          orderId: o.orderId,
          _id: o._id?.toString(),
          customerName: o.customerName,
        })));
      }
    } catch (dbError) {
      console.error('[Admin Orders] Error checking direct MongoDB:', dbError);
    }
    
    // Get a sample order to verify structure
    const sampleOrder = await Order.findOne({}).lean();
    if (sampleOrder) {
      console.log('[Admin Orders] Sample order found (Mongoose):', {
        orderId: sampleOrder.orderId,
        _id: sampleOrder._id?.toString(),
        customer: sampleOrder.customer?.toString(),
        customerName: sampleOrder.customerName,
        total: sampleOrder.total,
        createdAt: sampleOrder.createdAt,
      });
    } else {
      console.log('[Admin Orders] No orders found in database (Mongoose)');
    }
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const filter: any = {};

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const orderStatus = searchParams.get('orderStatus');
    const paymentStatus = searchParams.get('paymentStatus');

    if (orderStatus && orderStatus !== 'all') {
      filter.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    // Legacy support for 'status' parameter (maps to paymentStatus)
    if (status && status !== 'all' && !paymentStatus) {
      filter.paymentStatus = status;
    }

    const skip = (page - 1) * limit;

    console.log('[Admin Orders] Fetching orders with filter:', filter);

    // Fetch orders without populate since Customer model doesn't exist in Mongoose
    // We already have customerName and customerEmail in the order document
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    console.log('[Admin Orders] Found orders:', orders.length, 'Total:', total);

    // Try to enrich orders with customer data from MongoDB if needed
    let enrichedOrders = orders;
    try {
      const { db } = await connectToDatabase();
      const customerIds = orders
        .map(o => o.customer)
        .filter(Boolean)
        .map(id => {
          try {
            return typeof id === 'string' ? new ObjectId(id) : id;
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      if (customerIds.length > 0) {
        const customers = await db.collection('customers')
          .find({ _id: { $in: customerIds } })
          .toArray();
        
        const customerMap = new Map(
          customers.map(c => [c._id.toString(), { name: c.name, email: c.email, phone: c.phone }])
        );

        enrichedOrders = orders.map(order => ({
          ...order,
          _id: order._id?.toString(),
          customer: order.customer ? {
            _id: typeof order.customer === 'string' ? order.customer : order.customer.toString(),
            ...(customerMap.get(
              typeof order.customer === 'string' ? order.customer : order.customer.toString()
            ) || {})
          } : null,
        }));
      } else {
        enrichedOrders = orders.map(order => ({
          ...order,
          _id: order._id?.toString(),
          customer: order.customer ? {
            _id: typeof order.customer === 'string' ? order.customer : order.customer.toString(),
          } : null,
        }));
      }
    } catch (enrichError) {
      console.error('[Admin Orders] Error enriching orders with customer data:', enrichError);
      // Fallback: just serialize without customer enrichment
      enrichedOrders = orders.map(order => ({
        ...order,
        _id: order._id?.toString(),
        customer: order.customer ? {
          _id: typeof order.customer === 'string' ? order.customer : order.customer.toString(),
        } : null,
      }));
    }

    const serializedOrders = enrichedOrders;

    return NextResponse.json({
      orders: serializedOrders,
      total: total, // Return actual total, not serializedOrders.length
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[Admin Orders] Error fetching orders:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      error: error,
    });
    
    // Return a more helpful error message
    let errorMessage = 'Failed to fetch orders';
    if (error.message?.includes('populate')) {
      errorMessage = 'Database query error. Please check server logs.';
    } else if (error.message?.includes('connection')) {
      errorMessage = 'Database connection error. Please try again.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
