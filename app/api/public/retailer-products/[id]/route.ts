import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/** GET - Single retailer product for detail page. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const product = await db.collection('retailer_products').findOne({
      _id: new ObjectId(id),
      $or: [
        { status: 'active' },
        { status: { $regex: /^active$/i } },
        { status: { $exists: false } },
        { status: null },
      ],
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const p = product as Record<string, unknown> & { retailerId?: ObjectId; _id: ObjectId };
    return NextResponse.json({
      _id: p._id.toString(),
      name: p.name,
      mainImage: p.mainImage,
      shopName: p.shopName,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      retailerId: (p.retailerId as ObjectId)?.toString(),
      description: p.description || (p as any).shortDescription || '',
    });
  } catch (e) {
    console.error('[Public Retailer Product] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
