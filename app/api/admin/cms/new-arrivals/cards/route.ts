import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    const cards = await db
      .collection('homepage_new_arrivals_cards')
      .find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json(
      cards.map(card => ({
        _id: card._id.toString(),
        title: card.title,
        image: card.image,
        displayOrder: card.displayOrder,
        type: card.type || 'card',
      }))
    );
  } catch (error) {
    console.error('[v0] Failed to fetch new arrivals cards:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const newCard = {
      title: body.title || '',
      image: body.image || '',
      displayOrder: body.displayOrder || 0,
      type: body.type || 'card',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('homepage_new_arrivals_cards').insertOne(newCard);

    return NextResponse.json(
      {
        ...newCard,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Failed to create card:', error);
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
  }
}

