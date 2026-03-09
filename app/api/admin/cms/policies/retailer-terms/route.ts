import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

const POLICY_TYPE = 'retailer_terms';
const DEFAULT_TITLE = 'Retailer Terms & Conditions';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const policy = await db.collection('cms_policies').findOne({ type: POLICY_TYPE });

    if (!policy) {
      return NextResponse.json({
        type: POLICY_TYPE,
        title: DEFAULT_TITLE,
        content: '',
        metaTitle: '',
        metaDescription: '',
        status: 'active',
      });
    }

    return NextResponse.json({
      ...policy,
      _id: policy._id.toString(),
    });
  } catch (error) {
    console.error('[retailer-terms] Failed to fetch policy:', error);
    return NextResponse.json({ error: 'Failed to fetch retailer terms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const policyData = {
      type: POLICY_TYPE,
      title: body.title || DEFAULT_TITLE,
      content: body.content || '',
      metaTitle: body.metaTitle || '',
      metaDescription: body.metaDescription || '',
      status: body.status || 'active',
      updatedAt: new Date(),
    };

    const existing = await db.collection('cms_policies').findOne({ type: POLICY_TYPE });

    if (existing) {
      await db.collection('cms_policies').updateOne(
        { type: POLICY_TYPE },
        { $set: policyData }
      );
      const updated = await db.collection('cms_policies').findOne({ type: POLICY_TYPE });
      return NextResponse.json({
        ...updated,
        _id: updated?._id.toString(),
      });
    } else {
      const result = await db.collection('cms_policies').insertOne({
        ...policyData,
        createdAt: new Date(),
      });
      const newPolicy = await db.collection('cms_policies').findOne({ _id: result.insertedId });
      return NextResponse.json(
        {
          ...newPolicy,
          _id: newPolicy?._id.toString(),
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('[retailer-terms] Failed to save policy:', error);
    return NextResponse.json({ error: 'Failed to save retailer terms' }, { status: 500 });
  }
}
