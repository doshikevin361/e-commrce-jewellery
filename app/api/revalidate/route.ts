import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-revalidate-secret');
    const secret = process.env.REVALIDATE_SECRET || 'your-secret-key';

    // Simple auth check
    if (authHeader !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { path, tag } = body;

    if (path) {
      revalidatePath(path);
    }

    if (tag) {
      revalidateTag(tag, 'max');
    }

    // Default: revalidate homepage and product pages
    if (!path && !tag) {
      revalidatePath('/');
      revalidatePath('/api/public/homepage');
      revalidateTag('products', 'max');
      revalidateTag('homepage', 'max');
    }

    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      path: path || 'all',
      tag: tag || 'all',
    });
  } catch (error) {
    console.error('[Revalidate] Error:', error);
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    );
  }
}
