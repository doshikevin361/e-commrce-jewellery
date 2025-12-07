import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById, verifyCustomerPassword, updateCustomer, hashCustomerPassword } from '@/lib/models/customer';
import { getCustomerFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get customer
    const customer = await getCustomerById(user.id);
    if (!customer || !customer.password) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const passwordMatch = await verifyCustomerPassword(currentPassword, customer.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashCustomerPassword(newPassword);

    // Update password
    await updateCustomer(customer._id!, {
      password: hashedPassword,
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('[Customer Auth] Change password error:', error);
    return NextResponse.json(
      { error: 'Failed to change password. Please try again.' },
      { status: 500 }
    );
  }
}

