import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { findRetailerCommissionFromRows } from '@/lib/retailer-commission';

function normalizeCategoryId(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof ObjectId) return value.toString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value && '_id' in value) return (value as { _id: ObjectId })._id.toString();
  return null;
}

/**
 * POST - Add all products from this B2B order to retailer's portal listing (retailer_products).
 * One click "Sell to Portal" → all order items get added to retailer's sellable inventory.
 * Product price (display on website) is set using the retailer's commission rules:
 * customer price = sellingPrice * (1 + retailerCommission% / 100).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId } = await params;
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const retailerId = new ObjectId(retailer.id);

    const order = await db.collection('orders').findOne({
      orderId: orderId.trim(),
      customer: retailerId,
      orderType: 'b2b',
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found or not yours' }, { status: 404 });
    }

    const items = Array.isArray(order.items) ? order.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: 'Order has no items' }, { status: 400 });
    }

    const retailerDoc = await db.collection('retailers').findOne(
      { _id: retailerId },
      { projection: { companyName: 1, fullName: 1, retailerCommissionRows: 1 } }
    );
    const shopName =
      (retailerDoc?.companyName as string) ||
      (retailerDoc as { fullName?: string })?.fullName ||
      'Retailer';
    const commissionRows = Array.isArray((retailerDoc as { retailerCommissionRows?: unknown[] })?.retailerCommissionRows)
      ? (retailerDoc as { retailerCommissionRows: { productType?: string; category?: string; designType?: string; metal?: string; purityKarat?: string; retailerCommission?: number }[] }).retailerCommissionRows
      : [];

    const sourceProductIds = [...new Set(items.map((item: { product?: unknown }) => item.product).filter(Boolean))].map(
      (id) => (id instanceof ObjectId ? id : new ObjectId(String(id)))
    );
    const sourceProducts =
      sourceProductIds.length > 0
        ? await db
            .collection('products')
            .find({ _id: { $in: sourceProductIds } })
            .project({ _id: 1, product_type: 1, category: 1, designType: 1, goldPurity: 1, silverPurity: 1 })
            .toArray()
        : [];
    const sourceMap = new Map(sourceProducts.map((p: { _id: ObjectId }) => [p._id.toString(), p]));

    const categoryIds = [...new Set(sourceProducts.map((p: { category?: unknown }) => normalizeCategoryId(p.category)).filter(Boolean))].filter(
      (id): id is string => !!id && ObjectId.isValid(id)
    );
    const categories =
      categoryIds.length > 0
        ? await db
            .collection('categories')
            .find({ _id: { $in: categoryIds.map((id) => new ObjectId(id)) } })
            .project({ _id: 1, name: 1 })
            .toArray()
        : [];
    const catNameMap = new Map(categories.map((c: { _id: ObjectId; name: string }) => [c._id.toString(), c.name]));

    let added = 0;
    for (const item of items) {
      const sourceProductId =
        item.product instanceof ObjectId ? item.product : new ObjectId(String(item.product));
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const name = item.productName || 'Product';
      const mainImage = item.productImage || '';
      const sellingPrice = Number(item.price) || 0;

      const source = sourceMap.get(sourceProductId.toString());
      const productType = (source?.product_type ?? '').trim();
      const categoryId = source?.category ? normalizeCategoryId(source.category) : null;
      const categoryName = categoryId ? (catNameMap.get(categoryId) || '') : '';
      const designType = (source?.designType ?? '').trim();
      const metal = productType === 'Gold' || productType === 'Silver' || productType === 'Platinum' ? productType : '';
      const purity = (source?.goldPurity ?? source?.silverPurity ?? '').trim();

      const retailerCommissionRate = findRetailerCommissionFromRows(
        commissionRows,
        productType,
        categoryName,
        designType,
        metal,
        purity
      );

      await db.collection('retailer_products').updateOne(
        { retailerId, sourceProductId },
        {
          $set: {
            retailerId,
            sourceProductId,
            name,
            mainImage,
            shopName,
            sellingPrice,
            retailerCommissionRate,
            product_type: productType || undefined,
            category: categoryId || undefined,
            designType: designType || undefined,
            goldPurity: productType === 'Gold' ? purity : undefined,
            silverPurity: productType === 'Silver' ? purity : undefined,
            updatedAt: new Date(),
            status: 'active',
          },
          $inc: { quantity },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
      added += 1;
    }

    return NextResponse.json({
      success: true,
      message: `All ${added} product(s) added to your portal listing. You can edit price & manage them in My Products.`,
      added,
    });
  } catch (e) {
    console.error('[Sell to Portal] Error:', e);
    return NextResponse.json({ error: 'Failed to add products to portal' }, { status: 500 });
  }
}
