import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const policy = await db.collection('cms_policies').findOne({ type: 'retailer_terms' });

    if (!policy || policy.status !== 'active') {
      return NextResponse.json({
        title: 'Retailer Terms & Conditions',
        content: '',
      });
    }

    return NextResponse.json({
      title: policy.title || 'Retailer Terms & Conditions',
      content: policy.content || '',
    });
  } catch (error) {
    console.error('[terms/retailer] Failed to fetch:', error);
    return NextResponse.json({ error: 'Failed to fetch retailer terms' }, { status: 500 });
  }
}
