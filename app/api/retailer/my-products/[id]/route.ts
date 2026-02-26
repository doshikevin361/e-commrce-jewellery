import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * PATCH - Update retailer's portal product: sellingPrice, status.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { sellingPrice, status } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof sellingPrice === 'number' && sellingPrice >= 0) {
      updates.sellingPrice = sellingPrice;
    }
    if (status === 'active' || status === 'inactive') {
      updates.status = status;
    }

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: 'Provide sellingPrice and/or status' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const retailerId = new ObjectId(retailer.id);
    const productId = new ObjectId(id);

    const result = await db.collection('retailer_products').findOneAndUpdate(
      { _id: productId, retailerId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 });
    }

    const p = result as Record<string, unknown>;
    return NextResponse.json({
      success: true,
      product: {
        _id: (p._id as ObjectId)?.toString(),
        sellingPrice: p.sellingPrice,
        status: p.status,
        updatedAt: p.updatedAt,
      },
    });
  } catch (e) {
    console.error('[Retailer My Products] PATCH error:', e);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
