import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    const card = await db.collection('homepage_new_arrivals_cards').findOne({ _id: new ObjectId(id) });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: card._id.toString(),
      title: card.title,
      image: card.image,
      displayOrder: card.displayOrder,
      type: card.type || 'card',
    });
  } catch (error) {
    console.error('[v0] Failed to fetch card:', error);
    return NextResponse.json({ error: 'Failed to fetch card' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { db } = await connectToDatabase();

    const existingCard = await db.collection('homepage_new_arrivals_cards').findOne({ _id: new ObjectId(id) });
    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const updateData = {
      title: body.title,
      image: body.image,
      displayOrder: body.displayOrder || 0,
      type: body.type || 'card',
      updatedAt: new Date(),
    };

    await db.collection('homepage_new_arrivals_cards').updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    const updatedCard = await db.collection('homepage_new_arrivals_cards').findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      _id: updatedCard?._id.toString(),
      title: updatedCard?.title,
      image: updatedCard?.image,
      displayOrder: updatedCard?.displayOrder,
      type: updatedCard?.type || 'card',
    });
  } catch (error) {
    console.error('[v0] Failed to update card:', error);
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    const result = await db.collection('homepage_new_arrivals_cards').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('[v0] Failed to delete card:', error);
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 });
  }
}

