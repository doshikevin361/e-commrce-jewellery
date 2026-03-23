import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getUserFromRequest } from '@/lib/auth';
import { rejectIfNoAdminAccess, isSuperAdminOrAdmin } from '@/lib/admin-api-authorize';
import { normalizeStaffPermissions } from '@/lib/admin-modules';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = getUserFromRequest(request);
    const denied = rejectIfNoAdminAccess(request, user, 'admin-only');
    if (denied) return denied;

    const { id } = await params;

    if (!id || id.length !== 24) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const admin = await db.collection('admins').findOne({ _id: new ObjectId(id) });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
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
    return NextResponse.json({ error: 'Failed to fetch admin' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser || !isSuperAdminOrAdmin(authUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { _id, createdAt, updatedAt, ...updateData } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const target = await db.collection('admins').findOne({ _id: new ObjectId(id) });
    if (target?.role === 'superadmin' && authUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isStatusOnlyUpdate = Object.keys(updateData).length === 1 && 'status' in updateData;

    if (isStatusOnlyUpdate) {
      const result = await db.collection('admins').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: updateData.status,
            updatedAt: new Date(),
          },
        },
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Admin updated successfully',
      });
    }

    const name =
      body.name ||
      (body.firstName && body.lastName
        ? `${body.firstName} ${body.lastName}`.trim()
        : body.firstName || body.lastName || '');

    const role = body.role || 'admin';
    if (!['admin', 'staff', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    if (role === 'superadmin' && authUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Only superadmin can assign superadmin' }, { status: 403 });
    }

    const perms = normalizeStaffPermissions(role, body.permissions);
    if (role === 'staff' && perms.length === 0) {
      return NextResponse.json(
        { error: 'Staff users need at least one module permission' },
        { status: 400 },
      );
    }

    const fullUpdateData: Record<string, unknown> = {
      name,
      email: body.email,
      phone: body.phone || '',
      status: body.status || 'active',
      role,
      updatedAt: new Date(),
    };

    if (role === 'staff') {
      fullUpdateData.permissions = perms;
    } else {
      fullUpdateData.permissions = [];
    }

    if (body.password && body.password.trim()) {
      fullUpdateData.password = await bcrypt.hash(body.password, 10);
    }

    const result = await db.collection('admins').updateOne(
      { _id: new ObjectId(id) },
      { $set: fullUpdateData },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
    });
  } catch (error) {
    console.error('[v0] Error updating admin:', error);
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser || !isSuperAdminOrAdmin(authUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { db } = await connectToDatabase();

    const target = await db.collection('admins').findOne({ _id: new ObjectId(id) });
    if (target?.role === 'superadmin') {
      return NextResponse.json({ error: 'Cannot delete superadmin' }, { status: 403 });
    }

    const result = await db.collection('admins').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    console.error('[v0] Error deleting admin:', error);
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
  }
}
