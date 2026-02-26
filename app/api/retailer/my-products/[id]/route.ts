import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * GET - Fetch single retailer product for edit page.
 */
export async function GET(
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

    const { db } = await connectToDatabase();
    const product = await db.collection('retailer_products').findOne({
      _id: new ObjectId(id),
      retailerId: new ObjectId(retailer.id),
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 });
    }

    const p = product as Record<string, unknown> & { retailerId?: ObjectId; _id: ObjectId };
    return NextResponse.json({
      _id: (p._id as ObjectId).toString(),
      name: p.name,
      mainImage: p.mainImage,
      shortDescription: p.shortDescription,
      shopName: p.shopName,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });
  } catch (e) {
    console.error('[Retailer My Products] GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

/**
 * PATCH - Update retailer's portal product. Full edit like vendor: name, mainImage, description, sellingPrice, quantity, status.
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
    const { name, mainImage, shortDescription, description, sellingPrice, quantity, status } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof name === 'string' && name.trim()) {
      updates.name = name.trim();
    }
    if (mainImage !== undefined) {
      updates.mainImage = typeof mainImage === 'string' ? mainImage : '';
    }
    const desc = shortDescription ?? description;
    if (desc !== undefined) {
      updates.shortDescription = typeof desc === 'string' ? desc : '';
    }
    if (typeof sellingPrice === 'number' && sellingPrice >= 0) {
      updates.sellingPrice = sellingPrice;
    }
    if (typeof quantity === 'number' && quantity >= 0) {
      updates.quantity = Math.floor(quantity);
    }
    if (status === 'active' || status === 'inactive') {
      updates.status = status;
    }

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: 'Provide at least one field to update (name, mainImage, shortDescription, sellingPrice, quantity, status)' }, { status: 400 });
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
        name: p.name,
        mainImage: p.mainImage,
        shortDescription: p.shortDescription,
        sellingPrice: p.sellingPrice,
        quantity: p.quantity,
        status: p.status,
        updatedAt: p.updatedAt,
      },
    });
  } catch (e) {
    console.error('[Retailer My Products] PATCH error:', e);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
