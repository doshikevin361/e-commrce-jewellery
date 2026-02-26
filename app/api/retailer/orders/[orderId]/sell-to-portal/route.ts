import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * POST - Add all products from this B2B order to retailer's portal listing (retailer_products).
 * One click "Sell to Portal" → all order items get added to retailer's sellable inventory.
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
      { projection: { companyName: 1, fullName: 1 } }
    );
    const shopName =
      (retailerDoc?.companyName as string) ||
      (retailerDoc as { fullName?: string })?.fullName ||
      'Retailer';

    let added = 0;
    for (const item of items) {
      const sourceProductId =
        item.product instanceof ObjectId ? item.product : new ObjectId(String(item.product));
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const name = item.productName || 'Product';
      const mainImage = item.productImage || '';
      const sellingPrice = Number(item.price) || 0;

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
