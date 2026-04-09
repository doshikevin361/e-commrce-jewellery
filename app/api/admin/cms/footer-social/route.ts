import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { rejectIfNoAdminAccess } from '@/lib/admin-api-authorize';

export type FooterSocialLinks = {
  facebook: string;
  twitter: string;
  youtube: string;
  instagram: string;
};

const EMPTY: FooterSocialLinks = {
  facebook: '',
  twitter: '',
  youtube: '',
  instagram: '',
};

function sanitizeUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const t = raw.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  if (/^\/\//.test(t)) return `https:${t}`;
  return `https://${t.replace(/^\/+/, '')}`;
}

function normalizeLinks(body: unknown): FooterSocialLinks {
  const b = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  return {
    facebook: sanitizeUrl(b.facebook),
    twitter: sanitizeUrl(b.twitter),
    youtube: sanitizeUrl(b.youtube),
    instagram: sanitizeUrl(b.instagram),
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const deniedAd = rejectIfNoAdminAccess(request, user, 'admin-only');
    if (deniedAd) return deniedAd;

    const { db } = await connectToDatabase();
    const doc = await db.collection('settings').findOne({}, { projection: { footerSocialLinks: 1 } });
    const links = doc?.footerSocialLinks;
    const merged: FooterSocialLinks = {
      ...EMPTY,
      ...(links && typeof links === 'object' ? links : {}),
    };
    return NextResponse.json(merged);
  } catch (e) {
    console.error('[CMS Footer Social] GET error:', e);
    return NextResponse.json({ error: 'Failed to load footer social links' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const deniedAd = rejectIfNoAdminAccess(request, user, 'admin-only');
    if (deniedAd) return deniedAd;

    const body = await request.json().catch(() => ({}));
    const footerSocialLinks = normalizeLinks(body);

    const { db } = await connectToDatabase();
    await db.collection('settings').updateOne(
      {},
      { $set: { footerSocialLinks, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, footerSocialLinks });
  } catch (e) {
    console.error('[CMS Footer Social] PUT error:', e);
    return NextResponse.json({ error: 'Failed to save footer social links' }, { status: 500 });
  }
}
