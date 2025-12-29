import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Logo from '@/lib/models/Logo';
import { verifyToken } from '@/lib/auth';

// GET - Fetch single logo by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    const logo = await Logo.findById(params.id);

    if (!logo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    return NextResponse.json({ logo });
  } catch (error: any) {
    console.error('Error fetching logo:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch logo' }, { status: 500 });
  }
}

// PUT - Update logo
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    await connectDB();

    const logo = await Logo.findById(params.id);
    if (!logo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    // If this logo is being set as active, deactivate all others
    if (isActive && !logo.isActive) {
      await Logo.updateMany({ _id: { $ne: params.id } }, { isActive: false });
    }

    // Update the logo
    logo.name = name || logo.name;
    logo.imageUrl = imageUrl || logo.imageUrl;
    logo.altText = altText !== undefined ? altText : logo.altText;
    logo.isActive = isActive !== undefined ? isActive : logo.isActive;
    logo.width = width !== undefined ? width : logo.width;
    logo.height = height !== undefined ? height : logo.height;
    logo.updatedAt = new Date();

    await logo.save();

    return NextResponse.json({ logo, message: 'Logo updated successfully' });
  } catch (error: any) {
    console.error('Error updating logo:', error);
    return NextResponse.json({ error: error.message || 'Failed to update logo' }, { status: 500 });
  }
}

// DELETE - Delete single logo
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    const logo = await Logo.findByIdAndDelete(params.id);

    if (!logo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Logo deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting logo:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete logo' }, { status: 500 });
  }
}
