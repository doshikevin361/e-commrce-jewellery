import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyPassword } from '@/lib/models/admin';
import bcrypt from 'bcryptjs';
import { getUserFromRequest } from '@/lib/auth';
import { rejectIfNoAdminAccess, isSuperAdminOrAdmin } from '@/lib/admin-api-authorize';
import { normalizeStaffPermissions } from '@/lib/admin-modules';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const deniedAd = rejectIfNoAdminAccess(request, user, 'admin-only');
    if (deniedAd) return deniedAd;

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query: any = {
      role: { $ne: 'superadmin' } // Exclude superadmin users from list
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const admins = await db.collection('admins').find(query).sort({ createdAt: -1, _id: -1 }).toArray();

    const serializedAdmins = admins.map(a => ({
      ...a,
      _id: a._id?.toString(),
      password: undefined,
    }));

    return NextResponse.json({
      users: serializedAdmins,
      total: serializedAdmins.length,
    });
  } catch (error) {
    console.error('[v0] Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isSuperAdminOrAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();

    const existingAdmin = await db.collection('admins').findOne({ email: body.email });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 400 }
      );
    }

    const role = body.role || 'admin';
    if (!['admin', 'staff', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    if (role === 'superadmin' && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Only superadmin can create superadmin' }, { status: 403 });
    }

    const perms = normalizeStaffPermissions(role, body.permissions);
    if (role === 'staff' && perms.length === 0) {
      return NextResponse.json(
        { error: 'Staff users need at least one module permission' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const result = await db.collection('admins').insertOne({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      phone: body.phone || '',
      status: body.status || 'active',
      role,
      ...(role === 'staff' ? { permissions: perms } : {}),
      createdAt: new Date(),
    });

    return NextResponse.json(
      { 
        _id: result.insertedId.toString(), 
        email: body.email,
        name: body.name,
        phone: body.phone || '',
        status: body.status || 'active',
        password: undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Error creating admin:', error);
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}
