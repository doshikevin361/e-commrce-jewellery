import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById, updateCustomer } from '@/lib/models/customer';
import { getCustomerFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated customer
    const user = getCustomerFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get customer
    const customer = await getCustomerById(user.id);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Return customer data (without password)
    const { password, ...customerData } = customer;

    return NextResponse.json({
      success: true,
      customer: customerData,
    });
  } catch (error) {
    console.error('[Customer Auth] Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated customer
    const user = getCustomerFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, firstName, lastName, phone, address, billingAddress, avatar } = body;

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (billingAddress !== undefined) updateData.billingAddress = billingAddress;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Update customer
    await updateCustomer(user.id, updateData);

    // Get updated customer
    const customer = await getCustomerById(user.id);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Return updated customer data (without password)
    const { password, ...customerData } = customer;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      customer: customerData,
    });
  } catch (error) {
    console.error('[Customer Auth] Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile. Please try again.' },
      { status: 500 }
    );
  }
}

