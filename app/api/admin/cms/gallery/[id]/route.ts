import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    const item = await db.collection('homepage_gallery').findOne({ _id: new ObjectId(id) });

    if (!item) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...item,
      _id: item._id.toString(),
    });
  } catch (error) {
    console.error('[v0] Failed to fetch gallery item:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { db } = await connectToDatabase();

    const existingItem = await db.collection('homepage_gallery').findOne({ _id: new ObjectId(id) });
    if (!existingItem) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    const updateData = {
      image: body.image,
      displayOrder: body.displayOrder || 0,
      updatedAt: new Date(),
    };

    await db.collection('homepage_gallery').updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    const updatedItem = await db.collection('homepage_gallery').findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      ...updatedItem,
      _id: updatedItem?._id.toString(),
    });
  } catch (error) {
    console.error('[v0] Failed to update gallery item:', error);
    return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    const result = await db.collection('homepage_gallery').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('[v0] Failed to delete gallery item:', error);
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}

