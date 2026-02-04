import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { db } = await connectToDatabase();

    const page = await db.collection('cms_footer_pages').findOne({ _id: new ObjectId(id) });

    if (!page) {
      return NextResponse.json({ error: 'Footer page not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...page,
      _id: page._id.toString(),
    });
  } catch (error) {
    console.error('[v0] Failed to fetch footer page:', error);
    return NextResponse.json({ error: 'Failed to fetch footer page' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { db } = await connectToDatabase();

    const existingPage = await db.collection('cms_footer_pages').findOne({ _id: new ObjectId(id) });
    if (!existingPage) {
      return NextResponse.json({ error: 'Footer page not found' }, { status: 404 });
    }

    const slug = (body.slug || body.pageName || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');

    const allowedTypes = ['about', 'policies', 'jewellery-guide', 'customer-delight'];
    if (!body.pageType || !body.pageName || !slug) {
      return NextResponse.json({ error: 'Page type, page name, and slug are required' }, { status: 400 });
    }
    if (!allowedTypes.includes(body.pageType)) {
      return NextResponse.json({ error: 'Invalid page type' }, { status: 400 });
    }

    const existingSlug = await db
      .collection('cms_footer_pages')
      .findOne({ slug, _id: { $ne: new ObjectId(id) } });
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const updateData = {
      pageType: body.pageType,
      pageName: body.pageName,
      slug,
      content: body.content || '',
      status: body.status || 'active',
      updatedAt: new Date(),
    };

    await db.collection('cms_footer_pages').updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    const updatedPage = await db.collection('cms_footer_pages').findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      ...updatedPage,
      _id: updatedPage?._id.toString(),
    });
  } catch (error) {
    console.error('[v0] Failed to update footer page:', error);
    return NextResponse.json({ error: 'Failed to update footer page' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { db } = await connectToDatabase();

    const result = await db.collection('cms_footer_pages').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Footer page not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Footer page deleted successfully' });
  } catch (error) {
    console.error('[v0] Failed to delete footer page:', error);
    return NextResponse.json({ error: 'Failed to delete footer page' }, { status: 500 });
  }
}

