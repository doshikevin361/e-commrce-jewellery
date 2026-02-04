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
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { pageName: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    if (type && type !== 'all') {
      filter.pageType = type;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }

    const pages = await db.collection('cms_footer_pages').find(filter).sort({ updatedAt: -1 }).toArray();

    return NextResponse.json(
      pages.map(page => ({
        ...page,
        _id: page._id.toString(),
      }))
    );
  } catch (error) {
    console.error('[v0] Failed to fetch footer pages:', error);
    return NextResponse.json({ error: 'Failed to fetch footer pages' }, { status: 500 });
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

    const existingSlug = await db.collection('cms_footer_pages').findOne({ slug });
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const newPage = {
      pageType: body.pageType,
      pageName: body.pageName,
      slug,
      content: body.content || '',
      status: body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('cms_footer_pages').insertOne(newPage);

    return NextResponse.json(
      {
        ...newPage,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Failed to create footer page:', error);
    return NextResponse.json({ error: 'Failed to create footer page' }, { status: 500 });
  }
}

