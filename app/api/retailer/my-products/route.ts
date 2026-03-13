import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * POST - Create new retailer product (same fields as vendor product form).
 */
export async function POST(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return NextResponse.json({ error: 'Product name is required' }, { status: 400 });

    const { db } = await connectToDatabase();
    const retailerId = new ObjectId(retailer.id);
    const retailerDoc = await db.collection('retailers').findOne(
      { _id: retailerId },
      { projection: { companyName: 1, fullName: 1 } }
    );
    const shopName = (retailerDoc?.companyName as string) || (retailerDoc as { fullName?: string })?.fullName || 'Retailer';

    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    const num = (v: unknown, def: number) => (typeof v === 'number' && Number.isFinite(v) ? v : def);
    const now = new Date();
    const doc = {
      retailerId,
      shopName,
      name,
      mainImage: str(body.mainImage) || '',
      shortDescription: str(body.shortDescription) || '',
      description: str(body.description) || '',
      sellingPrice: Math.max(0, num(body.sellingPrice, 0)),
      quantity: Math.max(0, Math.floor(num(body.quantity, 1))),
      status: body.status === 'inactive' ? 'inactive' : 'active',
      retailerCommissionRate: Math.max(0, Math.min(100, num(body.retailerCommissionRate, 0))),
      category: str(body.category) || '',
      product_type: str(body.product_type) || '',
      designType: str(body.designType) || '',
      metalType: str(body.metalType) || '',
      goldPurity: str(body.goldPurity) || '',
      silverPurity: str(body.silverPurity) || '',
      metalColour: str(body.metalColour) || '',
      weight: num(body.weight, 0),
      size: str(body.size) || '',
      gender: Array.isArray(body.gender) ? body.gender : [],
      sku: str(body.sku) || '',
      hsnCode: str(body.hsnCode) || '',
      tags: Array.isArray(body.tags) ? body.tags : (typeof body.tags === 'string' ? body.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      specifications: Array.isArray(body.specifications) ? body.specifications : [],
      images: Array.isArray(body.images) ? body.images : [],
      seoTitle: str(body.seoTitle) || '',
      seoDescription: str(body.seoDescription) || '',
      seoTags: str(body.seoTags) || '',
      urlSlug: str(body.urlSlug) || '',
      relatedProducts: Array.isArray(body.relatedProducts) ? body.relatedProducts : [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection('retailer_products').insertOne(doc);
    const id = (result.insertedId as ObjectId).toString();
    return NextResponse.json({ success: true, _id: id, product: { _id: id, ...doc } }, { status: 201 });
  } catch (e) {
    console.error('[Retailer My Products] POST error:', e);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

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
    const limit = Math.min(500, Math.max(10, parseInt(searchParams.get('limit') || '20')));
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
      shortDescription: p.shortDescription,
      shopName: p.shopName,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      status: p.status,
      retailerCommissionRate: p.retailerCommissionRate,
      category: p.category,
      sku: p.sku,
      product_type: p.product_type,
      designType: p.designType,
      metalType: p.metalType,
      goldPurity: p.goldPurity,
      silverPurity: p.silverPurity,
      metalColour: p.metalColour,
      weight: p.weight,
      size: p.size,
      hsnCode: p.hsnCode,
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
