import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * GET - List active retailer products for website (customer-facing).
 * Used by "Partner Stores" / "From Retailers" section.
 */
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(24, Math.max(8, parseInt(searchParams.get('limit') || '12')));
    const skip = (page - 1) * limit;

    // Only active retailer products. Exclude inactive so they don't show on website.
    const query = {
      $and: [
        {
          $or: [
            { status: 'active' },
            { status: { $regex: '^active$', $options: 'i' } },
            { status: { $exists: false } },
            { status: null },
          ],
        },
        { status: { $nin: ['inactive', 'Inactive', 'INACTIVE'] } },
      ],
    };

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
      name: p.name,
      mainImage: p.mainImage,
      shopName: p.shopName,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      retailerId: (p.retailerId as ObjectId)?.toString(),
    }));

    return NextResponse.json({
      products: list,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (e) {
    console.error('[Public Retailer Products] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
