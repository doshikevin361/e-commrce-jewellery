import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    const card = await db.collection('homepage_dazzle').findOne({ _id: new ObjectId(id) });

    if (!card) {
      return NextResponse.json({ error: 'Dazzle card not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...card,
      _id: card._id.toString(),
    });
  } catch (error) {
    console.error('[v0] Failed to fetch dazzle card:', error);
    return NextResponse.json({ error: 'Failed to fetch dazzle card' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { db } = await connectToDatabase();

    const existingCard = await db.collection('homepage_dazzle').findOne({ _id: new ObjectId(id) });
    if (!existingCard) {
      return NextResponse.json({ error: 'Dazzle card not found' }, { status: 404 });
    }

    const updateData = {
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      buttonText: body.buttonText || 'Explore More',
      buttonLink: body.buttonLink || '/products',
      image: body.image,
      displayOrder: body.displayOrder || 0,
      updatedAt: new Date(),
    };

    await db.collection('homepage_dazzle').updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    const updatedCard = await db.collection('homepage_dazzle').findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      ...updatedCard,
      _id: updatedCard?._id.toString(),
    });
  } catch (error) {
    console.error('[v0] Failed to update dazzle card:', error);
    return NextResponse.json({ error: 'Failed to update dazzle card' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    const result = await db.collection('homepage_dazzle').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Dazzle card not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Dazzle card deleted successfully' });
  } catch (error) {
    console.error('[v0] Failed to delete dazzle card:', error);
    return NextResponse.json({ error: 'Failed to delete dazzle card' }, { status: 500 });
  }
}

