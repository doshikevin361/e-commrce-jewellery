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

/** GET - Single retailer product for detail page. Customer sees sellingPrice + retailer commission. */
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

    const p = product as Record<string, unknown> & { retailerId?: ObjectId; sourceProductId?: ObjectId; _id: ObjectId };
    const sellingPrice = Number(p.sellingPrice) || 0;
    let customerPrice = sellingPrice;

    if (p.sourceProductId && p.retailerId) {
      const [sourceProduct, retailer] = await Promise.all([
        db.collection('products').findOne(
          { _id: p.sourceProductId instanceof ObjectId ? p.sourceProductId : new ObjectId(String(p.sourceProductId)) },
          { projection: { product_type: 1, category: 1, designType: 1, goldPurity: 1, silverPurity: 1 } }
        ),
        db.collection('retailers').findOne(
          { _id: p.retailerId instanceof ObjectId ? p.retailerId : new ObjectId(String(p.retailerId)) },
          { projection: { retailerCommissionRows: 1 } }
        ),
      ]);
      const rows = Array.isArray((retailer as any)?.retailerCommissionRows) ? (retailer as any).retailerCommissionRows : [];
      if (sourceProduct && rows.length > 0) {
        const sp = sourceProduct as any;
        const productType = (sp.product_type || '').trim();
        const categoryId = normalizeCategoryId(sp.category);
        const categoryName = categoryId
          ? ((await db.collection('categories').findOne({ _id: new ObjectId(categoryId) }, { projection: { name: 1 } })) as any)?.name || ''
          : '';
        const designType = (sp.designType || '').trim();
        const metal = productType === 'Gold' || productType === 'Silver' || productType === 'Platinum' ? productType : '';
        const purity = (sp.goldPurity || sp.silverPurity || '').trim();
        const commissionPct = findRetailerCommissionFromRows(rows, productType, categoryName, designType, metal, purity);
        customerPrice = getCustomerPriceFromRetailer(sellingPrice, commissionPct);
      }
    }

    return NextResponse.json({
      _id: p._id.toString(),
      name: p.name,
      mainImage: p.mainImage,
      shopName: p.shopName,
      sellingPrice,
      customerPrice,
      quantity: p.quantity,
      retailerId: (p.retailerId as ObjectId)?.toString(),
      description: p.description || (p as any).shortDescription || '',
    });
  } catch (e) {
    console.error('[Public Retailer Product] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
