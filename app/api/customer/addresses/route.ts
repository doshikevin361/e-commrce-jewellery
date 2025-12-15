import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectDB, connectToDatabase } from '@/lib/mongodb';
import { getCustomerFromRequest } from '@/lib/auth';

// GET - Fetch all addresses for customer
export async function GET(req: NextRequest) {
  try {
    const customer = getCustomerFromRequest(req);
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { db } = await connectToDatabase();

    const customerId = new ObjectId(customer.id);
    const customerData = await db.collection('customers').findOne({ _id: customerId });

    if (!customerData) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get saved addresses (default to empty array if not exists)
    const addresses = customerData.addresses || [];

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error: any) {
    console.error('Fetch addresses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Add new address for customer
export async function POST(req: NextRequest) {
  try {
    const customer = getCustomerFromRequest(req);
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { db } = await connectToDatabase();

    const body = await req.json();
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      addressType,
      isDefault,
    } = body;

    // Validate required fields
    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const customerId = new ObjectId(customer.id);
    const customerData = await db.collection('customers').findOne({ _id: customerId });

    if (!customerData) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const addresses = customerData.addresses || [];

    // Create new address
    const newAddress = {
      _id: new ObjectId().toString(),
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      postalCode,
      country,
      addressType: addressType || 'home', // home, work, other
      isDefault: isDefault || false,
      createdAt: new Date().toISOString(),
    };

    // If this is set as default, unset other defaults
    if (isDefault) {
      addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    // If this is the first address, make it default
    if (addresses.length === 0) {
      newAddress.isDefault = true;
    }

    addresses.push(newAddress);

    // Update customer with new address
    await db.collection('customers').updateOne(
      { _id: customerId },
      {
        $set: {
          addresses,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      address: newAddress,
      message: 'Address added successfully',
    });
  } catch (error: any) {
    console.error('Add address error:', error);
    return NextResponse.json(
      { error: 'Failed to add address', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update address
export async function PUT(req: NextRequest) {
  try {
    const customer = getCustomerFromRequest(req);
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { db } = await connectToDatabase();

    const body = await req.json();
    const {
      addressId,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      addressType,
      isDefault,
    } = body;

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const customerId = new ObjectId(customer.id);
    const customerData = await db.collection('customers').findOne({ _id: customerId });

    if (!customerData) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const addresses = customerData.addresses || [];
    const addressIndex = addresses.findIndex((addr: any) => addr._id === addressId);

    if (addressIndex === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Update address
    const updatedAddress = {
      ...addresses[addressIndex],
      fullName: fullName || addresses[addressIndex].fullName,
      phone: phone || addresses[addressIndex].phone,
      addressLine1: addressLine1 || addresses[addressIndex].addressLine1,
      addressLine2: addressLine2 !== undefined ? addressLine2 : addresses[addressIndex].addressLine2,
      city: city || addresses[addressIndex].city,
      state: state || addresses[addressIndex].state,
      postalCode: postalCode || addresses[addressIndex].postalCode,
      country: country || addresses[addressIndex].country,
      addressType: addressType || addresses[addressIndex].addressType,
      isDefault: isDefault !== undefined ? isDefault : addresses[addressIndex].isDefault,
      updatedAt: new Date().toISOString(),
    };

    // If this is set as default, unset other defaults
    if (isDefault) {
      addresses.forEach((addr: any, index: number) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        }
      });
    }

    addresses[addressIndex] = updatedAddress;

    // Update customer
    await db.collection('customers').updateOne(
      { _id: customerId },
      {
        $set: {
          addresses,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      address: updatedAddress,
      message: 'Address updated successfully',
    });
  } catch (error: any) {
    console.error('Update address error:', error);
    return NextResponse.json(
      { error: 'Failed to update address', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete address
export async function DELETE(req: NextRequest) {
  try {
    const customer = getCustomerFromRequest(req);
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { db } = await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get('addressId');

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const customerId = new ObjectId(customer.id);
    const customerData = await db.collection('customers').findOne({ _id: customerId });

    if (!customerData) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const addresses = customerData.addresses || [];
    const filteredAddresses = addresses.filter((addr: any) => addr._id !== addressId);

    if (addresses.length === filteredAddresses.length) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If deleted address was default and there are remaining addresses, set first one as default
    const deletedAddress = addresses.find((addr: any) => addr._id === addressId);
    if (deletedAddress?.isDefault && filteredAddresses.length > 0) {
      filteredAddresses[0].isDefault = true;
    }

    // Update customer
    await db.collection('customers').updateOne(
      { _id: customerId },
      {
        $set: {
          addresses: filteredAddresses,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { error: 'Failed to delete address', details: error.message },
      { status: 500 }
    );
  }
}

