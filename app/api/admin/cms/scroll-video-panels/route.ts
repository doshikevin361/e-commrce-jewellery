import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

const COLLECTION_NAME = 'homepage_scroll_video_panels';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const items = await db
      .collection(COLLECTION_NAME)
      .find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json(
      items.map(item => ({
        _id: item._id.toString(),
        videoUrl: item.videoUrl || '',
        hashtag: item.hashtag || '',
        productId: item.productId || '',
        productSlug: item.productSlug || '',
        displayOrder: item.displayOrder ?? 0,
      }))
    );
  } catch (error) {
    console.error('[v0] Failed to fetch scroll video panels:', error);
    return NextResponse.json({ error: 'Failed to fetch scroll video panels' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const videoUrl = typeof body.videoUrl === 'string' ? body.videoUrl.trim() : '';
    const hashtag = typeof body.hashtag === 'string' ? body.hashtag.trim() : '';
    const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
    const productSlug = typeof body.productSlug === 'string' ? body.productSlug.trim() : '';

    if (!videoUrl || !hashtag || (!productId && !productSlug)) {
      return NextResponse.json({ error: 'Video, hashtag, and product are required' }, { status: 400 });
    }

    let displayOrder = typeof body.displayOrder === 'number' ? body.displayOrder : null;
    if (displayOrder === null || Number.isNaN(displayOrder)) {
      const latest = await db
        .collection(COLLECTION_NAME)
        .find({})
        .sort({ displayOrder: -1 })
        .limit(1)
        .toArray();
      displayOrder = latest[0]?.displayOrder ? latest[0].displayOrder + 1 : 0;
    }

    const newItem = {
      videoUrl,
      hashtag,
      productId,
      productSlug,
      displayOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newItem);

    return NextResponse.json(
      {
        ...newItem,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Failed to create scroll video panel:', error);
    return NextResponse.json({ error: 'Failed to create scroll video panel' }, { status: 500 });
  }
}

