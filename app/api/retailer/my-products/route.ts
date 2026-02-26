import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * GET - List retailer's portal products (retailer_products) for "My Products" page.
 */
export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const retailerId = new ObjectId(retailer.id);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(10, parseInt(searchParams.get('limit') || '20')));
    const statusFilter = searchParams.get('status'); // 'active' | 'inactive' | 'all'
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { retailerId };
    if (statusFilter && statusFilter !== 'all') {
      query.status = statusFilter;
    }

    const [products, total] = await Promise.all([
      db
        .collection('retailer_products')
        .find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('retailer_products').countDocuments(query),
    ]);

    const list = products.map((p: Record<string, unknown>) => ({
      _id: (p._id as ObjectId)?.toString(),
      retailerId: (p.retailerId as ObjectId)?.toString(),
      sourceProductId: (p.sourceProductId as ObjectId)?.toString(),
      name: p.name,
      mainImage: p.mainImage,
      shopName: p.shopName,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({
      products: list,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (e) {
    console.error('[Retailer My Products] GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
