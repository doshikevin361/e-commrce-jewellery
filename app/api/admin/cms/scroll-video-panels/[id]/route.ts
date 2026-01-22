import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const COLLECTION_NAME = 'homepage_scroll_video_panels';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    const item = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
    if (!item) {
      return NextResponse.json({ error: 'Scroll video panel not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: item._id.toString(),
      videoUrl: item.videoUrl || '',
      hashtag: item.hashtag || '',
      productId: item.productId || '',
      productSlug: item.productSlug || '',
      displayOrder: item.displayOrder ?? 0,
    });
  } catch (error) {
    console.error('[v0] Failed to fetch scroll video panel:', error);
    return NextResponse.json({ error: 'Failed to fetch scroll video panel' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { db } = await connectToDatabase();

    const existingItem = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
    if (!existingItem) {
      return NextResponse.json({ error: 'Scroll video panel not found' }, { status: 404 });
    }

    const updateData = {
      videoUrl: typeof body.videoUrl === 'string' ? body.videoUrl.trim() : '',
      hashtag: typeof body.hashtag === 'string' ? body.hashtag.trim() : '',
      productId: typeof body.productId === 'string' ? body.productId.trim() : '',
      productSlug: typeof body.productSlug === 'string' ? body.productSlug.trim() : '',
      displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : 0,
      updatedAt: new Date(),
    };

    if (!updateData.videoUrl || !updateData.hashtag || (!updateData.productId && !updateData.productSlug)) {
      return NextResponse.json({ error: 'Video, hashtag, and product are required' }, { status: 400 });
    }

    await db.collection(COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    const updatedItem = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      _id: updatedItem?._id.toString(),
      videoUrl: updatedItem?.videoUrl || '',
      hashtag: updatedItem?.hashtag || '',
      productId: updatedItem?.productId || '',
      productSlug: updatedItem?.productSlug || '',
      displayOrder: updatedItem?.displayOrder ?? 0,
    });
  } catch (error) {
    console.error('[v0] Failed to update scroll video panel:', error);
    return NextResponse.json({ error: 'Failed to update scroll video panel' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Scroll video panel not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Scroll video panel deleted successfully' });
  } catch (error) {
    console.error('[v0] Failed to delete scroll video panel:', error);
    return NextResponse.json({ error: 'Failed to delete scroll video panel' }, { status: 500 });
  }
}

