import clientPromise from '@/lib/mongodb';
import { getUserFromRequest, isVendor } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Get current user from token
    const currentUser = getUserFromRequest(request as any);
    
    // Vendors cannot access customer data
    if (currentUser && isVendor(currentUser)) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const client = await clientPromise;
    const db = client.db('admin_panel');
    
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const customers = await db
      .collection('customers')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const formattedCustomers = customers.map(customer => ({
      _id: customer._id.toString(),
      ...customer,
    }));

    return Response.json({
      customers: formattedCustomers,
      total: formattedCustomers.length,
    });
  } catch (error) {
    console.error('[v0] Failed to fetch customers:', error);
    return Response.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Get current user from token
    const currentUser = getUserFromRequest(request as any);
    
    // Vendors cannot create customers
    if (currentUser && isVendor(currentUser)) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const body = await request.json();
    
    const client = await clientPromise;
    const db = client.db('admin_panel');
    
    const newCustomer = {
      ...body,
      orders: 0,
      spent: 0,
      registrationDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('customers').insertOne(newCustomer);
    
    return Response.json({ 
      _id: result.insertedId.toString(),
      ...newCustomer 
    }, { status: 201 });
  } catch (error) {
    console.error('[v0] Failed to create customer:', error);
    return Response.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
