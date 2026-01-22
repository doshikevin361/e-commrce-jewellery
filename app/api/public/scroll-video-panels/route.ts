import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

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
        url: item.videoUrl || '',
        hashtag: item.hashtag || '',
        productSlug: item.productSlug || '',
        productId: item.productId || '',
      }))
    );
  } catch (error) {
    console.error('[v0] Failed to fetch public scroll video panels:', error);
    return NextResponse.json({ error: 'Failed to fetch scroll video panels' }, { status: 500 });
  }
}

