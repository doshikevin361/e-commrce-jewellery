import { NextRequest, NextResponse } from 'next/server';
import { getVendorById, updateVendor } from '@/lib/models/vendor';
import { getUserFromRequest, isVendor } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only vendors can access their profile
    if (!isVendor(user)) {
      return NextResponse.json(
        { error: 'Access denied. Vendor role required.' },
        { status: 403 }
      );
    }

    // Get vendor
    const vendor = await getVendorById(user.id);
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Return vendor data (without password)
    const { password, ...vendorData } = vendor;

    return NextResponse.json({
      success: true,
      vendor: vendorData,
    });
  } catch (error) {
    console.error('[Vendor Profile] Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only vendors can update their profile
    if (!isVendor(user)) {
      return NextResponse.json(
        { error: 'Access denied. Vendor role required.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Fields that can be updated by vendor
    const allowedFields = [
      'storeName',
      'ownerName',
      'phone',
      'alternatePhone',
      'whatsappNumber',
      'businessType',
      'gstNumber',
      'panNumber',
      'businessRegistrationNumber',
      'description',
      'address1',
      'address2',
      'city',
      'state',
      'pinCode',
      'country',
      'bankName',
      'accountHolderName',
      'accountNumber',
      'ifscCode',
      'upiId',
      'facebook',
      'instagram',
      'twitter',
      'website',
    ];

    // Filter out disallowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Validate required fields if they are being updated
    if (updateData.storeName !== undefined && !updateData.storeName) {
      return NextResponse.json(
        { error: 'Store name is required' },
        { status: 400 }
      );
    }

    if (updateData.ownerName !== undefined && !updateData.ownerName) {
      return NextResponse.json(
        { error: 'Owner name is required' },
        { status: 400 }
      );
    }

    if (updateData.phone !== undefined && !updateData.phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Update vendor
    const result = await updateVendor(user.id, updateData);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Get updated vendor (without password)
    const { password, ...vendorData } = result;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      vendor: vendorData,
    });
  } catch (error) {
    console.error('[Vendor Profile] Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile. Please try again.' },
      { status: 500 }
    );
  }
}
