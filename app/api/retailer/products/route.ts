import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/** GET: List all vendor products for B2B retailer panel (retailer sees all vendors' products). */
export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const vendorId = searchParams.get('vendorId')?.trim() || '';

    const query: Record<string, unknown> = {};
    if (vendorId) query.vendorId = vendorId;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await db
      .collection('products')
      .find(query)
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    const vendorIds = [...new Set(products.map((p: any) => p.vendorId).filter(Boolean))];
    let vendorMap: Record<string, string> = {};
    if (vendorIds.length > 0) {
      const vendors = await db
        .collection('vendors')
        .find({ _id: { $in: vendorIds.map((id: string) => new ObjectId(id)) } })
        .project({ _id: 1, storeName: 1 })
        .toArray();
      vendors.forEach((v: any) => {
        vendorMap[v._id.toString()] = v.storeName || '—';
      });
    }

    const serialized = products.map((p: any) => ({
      _id: p._id?.toString(),
      name: p.name,
      sku: p.sku,
      category: p.category,
      product_type: p.product_type,
      vendorId: p.vendorId,
      vendorName: vendorMap[p.vendorId] || '—',
      price: p.price,
      sellingPrice: p.sellingPrice,
      regularPrice: p.regularPrice,
      stock: p.stock,
      status: p.status,
      mainImage: p.mainImage || p.image,
      urlSlug: p.urlSlug,
      createdAt: p.createdAt,
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('[Retailer] Products list error:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
