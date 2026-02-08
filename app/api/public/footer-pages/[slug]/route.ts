import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { db } = await connectToDatabase();

    const page = await db.collection('cms_footer_pages').findOne({ slug, status: 'active' });

    if (!page) {
      return NextResponse.json({ error: 'Footer page not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: page._id.toString(),
      pageName: page.pageName,
      slug: page.slug,
      pageType: page.pageType,
      content: page.content || '',
    });
  } catch (error) {
    console.error('[v0] Failed to fetch footer page:', error);
    return NextResponse.json({ error: 'Failed to fetch footer page' }, { status: 500 });
  }
}


