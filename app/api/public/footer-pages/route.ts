import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const filter: Record<string, any> = { status: 'active' };
    if (type) {
      filter.pageType = type;
    }

    const pages = await db.collection('cms_footer_pages').find(filter).sort({ updatedAt: -1 }).toArray();

    return NextResponse.json(
      pages.map(page => ({
        _id: page._id.toString(),
        pageName: page.pageName,
        slug: page.slug,
        pageType: page.pageType,
      }))
    );
  } catch (error) {
    console.error('[v0] Failed to fetch footer pages:', error);
    return NextResponse.json({ error: 'Failed to fetch footer pages' }, { status: 500 });
  }
}

