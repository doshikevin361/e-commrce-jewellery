import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { findRetailerCommissionFromRows, getCustomerPriceFromRetailer } from '@/lib/retailer-commission';

function normalizeCategoryId(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof ObjectId) return value.toString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value && '_id' in value) return (value as { _id: ObjectId })._id.toString();
  return null;
}

/**
 * GET - List active retailer products for website (customer-facing).
 * Customer price = sellingPrice + (sellingPrice * retailerCommission%).
 */
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(24, Math.max(8, parseInt(searchParams.get('limit') || '12')));
    const skip = (page - 1) * limit;

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

    const sourceIds = [...new Set((products as any[]).map((p) => p.sourceProductId).filter(Boolean))].map((id) => (id instanceof ObjectId ? id : new ObjectId(String(id))));
    const retailerIds = [...new Set((products as any[]).map((p) => p.retailerId).filter(Boolean))].map((id) => (id instanceof ObjectId ? id : new ObjectId(String(id))));
    const [sourceProducts, retailerDocs] = await Promise.all([
      sourceIds.length > 0 ? db.collection('products').find({ _id: { $in: sourceIds } }).project({ _id: 1, product_type: 1, category: 1, designType: 1, goldPurity: 1, silverPurity: 1 }).toArray() : [],
      retailerIds.length > 0 ? db.collection('retailers').find({ _id: { $in: retailerIds } }).project({ _id: 1, retailerCommissionRows: 1 }).toArray() : [],
    ]);
    const sourceMap = new Map(sourceProducts.map((p: any) => [p._id.toString(), p]));
    const retailerMap = new Map(retailerDocs.map((r: any) => [r._id.toString(), r]));
    const allCatIds = [...new Set(sourceProducts.map((p: any) => normalizeCategoryId(p.category)).filter(Boolean))].filter((id): id is string => !!id && ObjectId.isValid(id));
    const catDocs = allCatIds.length > 0 ? await db.collection('categories').find({ _id: { $in: allCatIds.map((id) => new ObjectId(id)) } }).project({ _id: 1, name: 1 }).toArray() : [];
    const catNameMap = new Map(catDocs.map((c: any) => [c._id.toString(), c.name]));

    const list = (products as any[]).map((p) => {
      const sellingPrice = Number(p.sellingPrice) || 0;
      const source = p.sourceProductId ? sourceMap.get((p.sourceProductId instanceof ObjectId ? p.sourceProductId : new ObjectId(String(p.sourceProductId))).toString()) : null;
      const retailer = p.retailerId ? retailerMap.get((p.retailerId instanceof ObjectId ? p.retailerId : new ObjectId(String(p.retailerId))).toString()) : null;
      const rows = Array.isArray((retailer as any)?.retailerCommissionRows) ? (retailer as any).retailerCommissionRows : [];
      const productType = (source?.product_type || '').trim();
      const categoryId = source?.category ? normalizeCategoryId(source.category) : null;
      const categoryName = categoryId ? catNameMap.get(categoryId) || '' : '';
      const designType = (source?.designType || '').trim();
      const metal = productType === 'Gold' || productType === 'Silver' || productType === 'Platinum' ? productType : '';
      const purity = (source?.goldPurity || source?.silverPurity || '').trim();
      const commissionPct = findRetailerCommissionFromRows(rows, productType, categoryName, designType, metal, purity);
      const customerPrice = getCustomerPriceFromRetailer(sellingPrice, commissionPct);
      return {
        _id: (p._id as ObjectId)?.toString(),
        name: p.name,
        mainImage: p.mainImage,
        shopName: p.shopName,
        sellingPrice,
        customerPrice,
        quantity: p.quantity,
        retailerId: (p.retailerId as ObjectId)?.toString(),
      };
    });

    return NextResponse.json({
      products: list,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (e) {
    console.error('[Public Retailer Products] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
