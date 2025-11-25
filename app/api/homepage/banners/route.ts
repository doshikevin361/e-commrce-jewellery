import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();

    // Fetch only active banners sorted by display order
    const banners = await db
      .collection('homepage_banners')
      .find({ status: 'active' })
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json(
      banners.map(banner => ({
        _id: banner._id.toString(),
        title: banner.title,
        description: banner.description,
        image: banner.image,
        link: banner.link,
        buttonText: banner.buttonText,
        displayOrder: banner.displayOrder,
      }))
    );
  } catch (error) {
    console.error('[v0] Failed to fetch homepage banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
