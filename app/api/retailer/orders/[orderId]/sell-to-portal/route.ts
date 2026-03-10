import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { formatProductPrice } from '@/lib/utils/price-calculator';
import { ObjectId } from 'mongodb';

/**
 * POST - Add all products from this B2B order to retailer's portal listing (retailer_products).
 * One click "Sell to Portal" → all order items get added with full info from source product.
 * Same product again → quantity increases, other fields updated from source.
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

    if ((order as { orderStatus?: string }).orderStatus !== 'delivered') {
      return NextResponse.json(
        { error: 'Sell to Portal is available only after the order is delivered by vendor/admin.' },
        { status: 400 }
      );
    }

    if ((order as { soldToPortalAt?: Date }).soldToPortalAt) {
      return NextResponse.json(
        { error: 'This order has already been added to your portal listing.' },
        { status: 400 }
      );
    }

    const items = Array.isArray(order.items) ? order.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: 'Order has no items' }, { status: 400 });
    }

    const retailerDoc = await db.collection('retailers').findOne(
      { _id: retailerId },
      { projection: { companyName: 1, fullName: 1 } }
    );
    const shopName =
      (retailerDoc?.companyName as string) ||
      (retailerDoc as { fullName?: string })?.fullName ||
      'Retailer';

    const sourceIds = items
      .map((item: { product?: unknown }) => item.product)
      .filter(Boolean)
      .map((id: unknown) => (id instanceof ObjectId ? id : new ObjectId(String(id))));
    const sourceProducts = await db
      .collection('products')
      .find({ _id: { $in: sourceIds } })
      .toArray();
    const sourceProductMap = new Map(sourceProducts.map((p: { _id: ObjectId }) => [p._id.toString(), p]));

    const categoryIds = [
      ...new Set(
        sourceProducts
          .map((p: { category?: ObjectId }) => p.category)
          .filter(Boolean)
          .map((c: unknown) => (c instanceof ObjectId ? c.toString() : String(c)))
      ),
    ].filter((id): id is string => !!id && ObjectId.isValid(id));
    const categoryDocs =
      categoryIds.length > 0
        ? await db
            .collection('categories')
            .find({ _id: { $in: categoryIds.map((id: string) => new ObjectId(id)) } })
            .project({ _id: 1, name: 1 })
            .toArray()
        : [];
    const categoryIdToName = new Map(
      categoryDocs.map((c: { _id: ObjectId; name: string }) => [c._id.toString(), c.name])
    );

    let added = 0;
    for (const item of items) {
      const sourceProductId =
        item.product instanceof ObjectId ? item.product : new ObjectId(String(item.product));
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const sourceProduct = sourceProductMap.get(sourceProductId.toString()) as Record<string, unknown> | undefined;

      const name = (item.productName as string) || (sourceProduct?.name as string) || 'Product';
      const mainImage = (item.productImage as string) || (sourceProduct?.mainImage as string) || '';
      const itemPrice = Number(item.price) || 0;
      const sellingPrice =
        itemPrice > 0
          ? itemPrice
          : sourceProduct
            ? Number(formatProductPrice(sourceProduct).displayPrice) || 0
            : 0;

      const categoryId = sourceProduct?.category
        ? sourceProduct.category instanceof ObjectId
          ? sourceProduct.category.toString()
          : String(sourceProduct.category)
        : '';
      const categoryName = categoryId ? (categoryIdToName.get(categoryId) || '') : '';

      const baseSet: Record<string, unknown> = {
        retailerId,
        sourceProductId,
        name,
        mainImage,
        shopName,
        sellingPrice,
        updatedAt: new Date(),
        status: 'active',
        category: categoryName,
        product_type: (sourceProduct?.product_type as string) || '',
        designType: (sourceProduct?.designType as string) || '',
        metalType: (sourceProduct?.metalType as string) || (sourceProduct?.product_type as string) || '',
        goldPurity: (sourceProduct?.goldPurity as string) || '',
        silverPurity: (sourceProduct?.silverPurity as string) || '',
        metalColour: (sourceProduct?.metalColour as string) || '',
        weight: typeof sourceProduct?.weight === 'number' ? sourceProduct.weight : 0,
        size: (sourceProduct?.size as string) || '',
        sku: (sourceProduct?.sku as string) || '',
        hsnCode: (sourceProduct?.hsnCode as string) || '',
        shortDescription: (sourceProduct?.shortDescription as string) || (sourceProduct?.description as string) || '',
        description: (sourceProduct?.description as string) || (sourceProduct?.shortDescription as string) || '',
      };

      await db.collection('retailer_products').updateOne(
        { retailerId, sourceProductId },
        {
          $set: baseSet,
          $inc: { quantity },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
      added += 1;
    }

    await db.collection('orders').updateOne(
      { orderId: orderId.trim(), customer: retailerId, orderType: 'b2b' },
      { $set: { soldToPortalAt: new Date(), updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: `All ${added} product(s) added to your portal listing with full details. Manage them in My Products.`,
      added,
    });
  } catch (e) {
    console.error('[Sell to Portal] Error:', e);
    return NextResponse.json({ error: 'Failed to add products to portal' }, { status: 500 });
  }
}
