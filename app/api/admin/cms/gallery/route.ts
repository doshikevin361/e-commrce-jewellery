import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    const galleryItems = await db
      .collection('homepage_gallery')
      .find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json(
      galleryItems.map(item => ({
        ...item,
        _id: item._id.toString(),
      }))
    );
  } catch (error) {
    console.error('[v0] Failed to fetch gallery items:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const newItem = {
      image: body.image || '',
      displayOrder: body.displayOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('homepage_gallery').insertOne(newItem);

    return NextResponse.json(
      {
        ...newItem,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Failed to create gallery item:', error);
    return NextResponse.json({ error: 'Failed to create gallery item' }, { status: 500 });
  }
}

