import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

const EMPTY = {
  facebook: '',
  twitter: '',
  youtube: '',
  instagram: '',
  linkedin: '',
};

/** Public: footer “Follow us” URLs from CMS (settings.footerSocialLinks). */
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const doc = await db.collection('settings').findOne({}, { projection: { footerSocialLinks: 1 } });
    const links = doc?.footerSocialLinks;
    if (!links || typeof links !== 'object') {
      return NextResponse.json(EMPTY, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } });
    }
    return NextResponse.json(
      {
        facebook: typeof links.facebook === 'string' ? links.facebook.trim() : '',
        twitter: typeof links.twitter === 'string' ? links.twitter.trim() : '',
        youtube: typeof links.youtube === 'string' ? links.youtube.trim() : '',
        instagram: typeof links.instagram === 'string' ? links.instagram.trim() : '',
        linkedin: typeof links.linkedin === 'string' ? links.linkedin.trim() : '',
      },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
  } catch (e) {
    console.error('[Public Footer Social] GET error:', e);
    return NextResponse.json(EMPTY, { status: 200 });
  }
}
