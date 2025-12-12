import { NextRequest, NextResponse } from 'next/server';
import { createCustomJewelleryRequest, getCustomJewelleryRequests } from '@/lib/models/custom-jewellery';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Custom jewellery POST request received');
    const body = await request.json();
    console.log('[v0] Request body received:', { ...body, images: body.images?.length || 0 });
    
    const { fullName, phone, email, jewelleryType, metalType, budgetRange, description, images } = body;
    
    // Validate required fields
    if (!fullName || !phone || !email || !jewelleryType || !metalType || !budgetRange || !description) {
      console.log('[v0] Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[v0] Validation failed - invalid email format');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    console.log('[v0] Calling createCustomJewelleryRequest...');
    const customRequest = await createCustomJewelleryRequest({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      jewelleryType: jewelleryType.trim(),
      metalType: metalType.trim(),
      budgetRange: budgetRange.trim(),
      description: description.trim(),
      images: Array.isArray(images) ? images : [],
    });
    
    console.log('[v0] Custom jewellery request created successfully:', customRequest._id);
    
    return NextResponse.json(
      { 
        message: 'Custom jewellery request submitted successfully',
        request: customRequest 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Failed to create custom jewellery request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to submit request',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    const requests = await getCustomJewelleryRequests({
      status: status || undefined,
      search: search || undefined,
    });
    
    return NextResponse.json({
      requests,
      total: requests.length,
    });
  } catch (error) {
    console.error('[v0] Failed to fetch custom jewellery requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

