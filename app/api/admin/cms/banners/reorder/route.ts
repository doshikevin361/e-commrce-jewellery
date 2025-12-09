import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { bannerIds } = body; // Array of banner IDs in the new order

    if (!Array.isArray(bannerIds)) {
      return NextResponse.json({ error: 'bannerIds must be an array' }, { status: 400 });
    }

    // Update displayOrder for each banner based on its position in the array
    const updatePromises = bannerIds.map((bannerId: string, index: number) => {
      if (!ObjectId.isValid(bannerId)) {
        return Promise.resolve();
      }
      return db.collection('homepage_banners').updateOne(
        { _id: new ObjectId(bannerId) },
        { $set: { displayOrder: index, updatedAt: new Date() } }
      );
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Banners reordered successfully' });
  } catch (error) {
    console.error('[v0] Failed to reorder banners:', error);
    return NextResponse.json({ error: 'Failed to reorder banners' }, { status: 500 });
  }
}
