import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

const DEFAULT_SETTINGS = {
  siteName: 'Grocify Admin',
  siteTitle: 'Grocify – Admin Panel',
  tagline: '',
  primaryColor: '#16a34a',
  accentColor: '#0f172a',
  logo: '',
  favicon: '',
  productType: true,
};

function normalizeSettings(doc: any = {}) {
  return {
    siteName: doc.siteName ?? DEFAULT_SETTINGS.siteName,
    siteTitle: doc.siteTitle ?? DEFAULT_SETTINGS.siteTitle,
    tagline: doc.tagline ?? DEFAULT_SETTINGS.tagline,
    primaryColor: doc.primaryColor ?? DEFAULT_SETTINGS.primaryColor,
    accentColor: doc.accentColor ?? DEFAULT_SETTINGS.accentColor,
    logo: doc.logo ?? DEFAULT_SETTINGS.logo,
    favicon: doc.favicon ?? DEFAULT_SETTINGS.favicon,
    productType: doc.productType ?? DEFAULT_SETTINGS.productType,
    updatedAt: doc.updatedAt ?? null,
    createdAt: doc.createdAt ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const settings = await db.collection('settings').findOne({});

    return NextResponse.json(normalizeSettings(settings));
  } catch (error) {
    console.error('[v0] Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();

    const siteName = (body.siteName || '').trim();
    const siteTitle = (body.siteTitle || '').trim();
    const tagline = (body.tagline || '').trim();
    const primaryColor = (body.primaryColor || DEFAULT_SETTINGS.primaryColor).trim();
    const accentColor = (body.accentColor || DEFAULT_SETTINGS.accentColor).trim();
    const logo = body.logo || '';
    const favicon = body.favicon || '';
    const productType = body.productType ?? DEFAULT_SETTINGS.productType;

    if (!siteName) {
      return NextResponse.json({ error: 'Website name is required' }, { status: 400 });
    }
    if (!siteTitle) {
      return NextResponse.json({ error: 'Page title is required' }, { status: 400 });
    }

    const now = new Date();

    const result = await db.collection('settings').findOneAndUpdate(
      {},
      {
        $set: {
          siteName,
          siteTitle,
          tagline,
          primaryColor,
          accentColor,
          logo,
          favicon,
          productType,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );

    // If result.value is null (shouldn't happen with upsert, but just in case),
    // fetch the document again to ensure we return the updated data
    let updatedDoc = result?.value;
    if (!updatedDoc) {
      updatedDoc = await db.collection('settings').findOne({});
    }

    return NextResponse.json(normalizeSettings(updatedDoc || {}));
  } catch (error) {
    console.error('[v0] Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

