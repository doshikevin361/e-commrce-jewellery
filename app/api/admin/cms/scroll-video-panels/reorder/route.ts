import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const COLLECTION_NAME = 'homepage_scroll_video_panels';

type ReorderItem = {
  id: string;
  displayOrder: number;
};

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const items: ReorderItem[] = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ error: 'No items to reorder' }, { status: 400 });
    }

    const operations = items.map(item => ({
      updateOne: {
        filter: { _id: new ObjectId(item.id) },
        update: { $set: { displayOrder: item.displayOrder, updatedAt: new Date() } },
      },
    }));

    await db.collection(COLLECTION_NAME).bulkWrite(operations);

    return NextResponse.json({ message: 'Reordered successfully' });
  } catch (error) {
    console.error('[v0] Failed to reorder scroll video panels:', error);
    return NextResponse.json({ error: 'Failed to reorder scroll video panels' }, { status: 500 });
  }
}

