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
    const contact = await db.collection('cms_contact').findOne({ type: 'contact' });

    if (!contact) {
      return NextResponse.json({
        type: 'contact',
        title: 'Contact Us',
        content: '',
        address: '',
        phone: '',
        email: '',
        workingHours: '',
        mapEmbedCode: '',
        metaTitle: '',
        metaDescription: '',
        status: 'active',
      });
    }

    return NextResponse.json({
      ...contact,
      _id: contact._id.toString(),
    });
  } catch (error) {
    console.error('[v0] Failed to fetch contact data:', error);
    return NextResponse.json({ error: 'Failed to fetch contact data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();

    const contactData = {
      type: 'contact',
      title: body.title || 'Contact Us',
      content: body.content || '',
      address: body.address || '',
      phone: body.phone || '',
      email: body.email || '',
      workingHours: body.workingHours || '',
      mapEmbedCode: body.mapEmbedCode || '',
      metaTitle: body.metaTitle || '',
      metaDescription: body.metaDescription || '',
      status: body.status || 'active',
      updatedAt: new Date(),
    };

    const existing = await db.collection('cms_contact').findOne({ type: 'contact' });

    if (existing) {
      await db.collection('cms_contact').updateOne(
        { type: 'contact' },
        { $set: contactData }
      );
      const updated = await db.collection('cms_contact').findOne({ type: 'contact' });
      return NextResponse.json({
        ...updated,
        _id: updated?._id.toString(),
      });
    } else {
      const result = await db.collection('cms_contact').insertOne({
        ...contactData,
        createdAt: new Date(),
      });
      const newContact = await db.collection('cms_contact').findOne({ _id: result.insertedId });
      return NextResponse.json(
        {
          ...newContact,
          _id: newContact?._id.toString(),
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('[v0] Failed to save contact data:', error);
    return NextResponse.json({ error: 'Failed to save contact data' }, { status: 500 });
  }
}
