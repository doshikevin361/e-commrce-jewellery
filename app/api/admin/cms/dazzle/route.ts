import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const cards = await db
      .collection('homepage_dazzle')
      .find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json(
      cards.map(card => ({
        ...card,
        _id: card._id.toString(),
      }))
    );
  } catch (error) {
    console.error('[v0] Failed to fetch dazzle cards:', error);
    return NextResponse.json({ error: 'Failed to fetch dazzle cards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const newCard = {
      title: body.title || '',
      subtitle: body.subtitle || '',
      description: body.description || '',
      buttonText: body.buttonText || 'Explore More',
      buttonLink: body.buttonLink || '/products',
      image: body.image || '',
      displayOrder: body.displayOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('homepage_dazzle').insertOne(newCard);

    return NextResponse.json(
      {
        ...newCard,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Failed to create dazzle card:', error);
    return NextResponse.json({ error: 'Failed to create dazzle card' }, { status: 500 });
  }
}

