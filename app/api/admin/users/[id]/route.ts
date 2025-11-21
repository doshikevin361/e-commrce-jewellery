import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const admin = await db.collection('admins').findOne({ _id: new ObjectId(id) });

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    const { password, ...adminWithoutPassword } = admin;
    return NextResponse.json({
      user: {
        ...adminWithoutPassword,
        _id: admin._id?.toString(),
      },
    });
  } catch (error) {
    console.error('[v0] Error fetching admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { _id, createdAt, updatedAt, ...updateData } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // If only status is being updated, skip validation
    const isStatusOnlyUpdate = Object.keys(updateData).length === 1 && 'status' in updateData;

    if (isStatusOnlyUpdate) {
      // Status-only update
      const result = await db.collection('admins').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: updateData.status,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Admin not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Admin updated successfully',
      });
    }

    // Full update - construct name from firstName/lastName if provided
    const name = body.name || (body.firstName && body.lastName ? `${body.firstName} ${body.lastName}`.trim() : body.firstName || body.lastName || '');

    const fullUpdateData: any = {
      name: name,
      email: body.email,
      phone: body.phone || '',
      status: body.status || 'active',
      role: body.role || 'admin',
      updatedAt: new Date(),
    };

    if (body.password && body.password.trim()) {
      fullUpdateData.password = await bcrypt.hash(body.password, 10);
    }

    const result = await db.collection('admins').updateOne(
      { _id: new ObjectId(id) },
      { $set: fullUpdateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
    });
  } catch (error) {
    console.error('[v0] Error updating admin:', error);
    return NextResponse.json(
      { error: 'Failed to update admin' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    const result = await db.collection('admins').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    console.error('[v0] Error deleting admin:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin' },
      { status: 500 }
    );
  }
}
