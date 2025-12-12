import { NextRequest, NextResponse } from 'next/server';
import { getCustomJewelleryRequestById, updateCustomJewelleryRequest, deleteCustomJewelleryRequest } from '@/lib/models/custom-jewellery';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const customRequest = await getCustomJewelleryRequestById(id);
    
    if (!customRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ request: customRequest });
  } catch (error) {
    console.error('[v0] Failed to fetch custom jewellery request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    
    const updatedRequest = await updateCustomJewelleryRequest(id, body);
    
    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Request updated successfully',
      request: updatedRequest,
    });
  } catch (error) {
    console.error('[v0] Failed to update custom jewellery request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const deleted = await deleteCustomJewelleryRequest(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Request deleted successfully',
    });
  } catch (error) {
    console.error('[v0] Failed to delete custom jewellery request:', error);
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}

