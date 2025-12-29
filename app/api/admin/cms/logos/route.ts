import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Logo from '@/lib/models/Logo';
import { verifyToken } from '@/lib/auth';

// GET - Fetch all logos
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'superadmin' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const logos = await Logo.find().sort({ createdAt: -1 });

    return NextResponse.json({ logos });
  } catch (error: any) {
    console.error('Error fetching logos:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch logos' }, { status: 500 });
  }
}

// POST - Create new logo
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'superadmin' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, imageUrl, altText, isActive, width, height } = body;

    if (!name || !imageUrl) {
      return NextResponse.json({ error: 'Name and image URL are required' }, { status: 400 });
    }

    await connectDB();

    // If this logo is being set as active, deactivate all others
    if (isActive) {
      await Logo.updateMany({}, { isActive: false });
    }

    const logo = await Logo.create({
      name,
      imageUrl,
      altText: altText || 'Website Logo',
      isActive: isActive || false,
      width: width || 150,
      height: height || 50,
    });

    return NextResponse.json({ logo, message: 'Logo created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating logo:', error);
    return NextResponse.json({ error: error.message || 'Failed to create logo' }, { status: 500 });
  }
}

// DELETE - Delete all logos (bulk delete)
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden - Only superadmin can bulk delete' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    await connectDB();
    const idArray = ids.split(',');
    await Logo.deleteMany({ _id: { $in: idArray } });

    return NextResponse.json({ message: 'Logos deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting logos:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete logos' }, { status: 500 });
  }
}
