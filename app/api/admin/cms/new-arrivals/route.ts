import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Get banner settings (single document)
    const banner = await db.collection('homepage_new_arrivals_banner').findOne({});
    
    // Get cards (multiple documents)
    const cards = await db
      .collection('homepage_new_arrivals_cards')
      .find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      banner: banner ? {
        ...banner,
        _id: banner._id.toString(),
      } : null,
      cards: cards.map(card => ({
        ...card,
        _id: card._id.toString(),
      })),
    });
  } catch (error) {
    console.error('[v0] Failed to fetch new arrivals:', error);
    return NextResponse.json({ error: 'Failed to fetch new arrivals' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();

    // Update or create banner
    if (body.banner) {
      const bannerData = {
        title: body.banner.title || 'New Arrivals',
        subtitle: body.banner.subtitle || body.banner.badgeText || '💎 500+ New Items',
        description: body.banner.description || '',
        backgroundImage: body.banner.backgroundImage || '',
        updatedAt: new Date(),
      };

      await db.collection('homepage_new_arrivals_banner').updateOne(
        {},
        { $set: bannerData },
        { upsert: true }
      );
    }

    return NextResponse.json({ message: 'New arrivals updated successfully' });
  } catch (error) {
    console.error('[v0] Failed to update new arrivals:', error);
    return NextResponse.json({ error: 'Failed to update new arrivals' }, { status: 500 });
  }
}

