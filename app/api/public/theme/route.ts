import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

const DEFAULT_PRIMARY = '#001e38';
const DEFAULT_SECONDARY = '#C8A15B';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const settings = await db.collection('settings').findOne({});

    const primaryColor = settings?.primaryColor ?? DEFAULT_PRIMARY;
    const secondaryColor = settings?.secondaryColor ?? DEFAULT_SECONDARY;

    return NextResponse.json({
      primaryColor: String(primaryColor).trim() || DEFAULT_PRIMARY,
      secondaryColor: String(secondaryColor).trim() || DEFAULT_SECONDARY,
    });
  } catch (error) {
    console.error('[public/theme] Failed to fetch theme:', error);
    return NextResponse.json(
      { primaryColor: DEFAULT_PRIMARY, secondaryColor: DEFAULT_SECONDARY },
      { status: 200 }
    );
  }
}
