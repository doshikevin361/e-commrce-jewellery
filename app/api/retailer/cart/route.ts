import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { formatProductPrice } from '@/lib/utils/price-calculator';

function getRetailerCommissionAndPrice(
  vendor: { b2bProductTypeCommissions?: Record<string, number>; b2bCommissionRows?: Array<{ productType: string; category: string; designType: string; metal: string; purityKarat: string; vendorCommission: number }> } | null,
  product: { product_type?: string; category?: unknown; designType?: string; goldPurity?: string; silverPurity?: string },
  categoryName: string | null
): { percent: number; retailerPrice: number } {
  const priceData = formatProductPrice(product);
  const basePrice = Number(priceData.displayPrice) || Number(priceData.sellingPrice) || Number(priceData.regularPrice) || 0;
  if (!vendor) return { percent: 0, retailerPrice: basePrice };
  const productType = (product.product_type || '').trim();
  const ptCommissions = vendor.b2bProductTypeCommissions;
  const rows = vendor.b2bCommissionRows;
  let percent = 0;
  if (Array.isArray(rows) && rows.length > 0) {
    const designType = (product.designType || '').trim();
    const metal = productType === 'Gold' || productType === 'Silver' || productType === 'Platinum' ? productType : '';
    const purity = (product.goldPurity || product.silverPurity || '').trim();
    const catMatch = categoryName ? categoryName.trim() : '';
    const norm = (s: string) => s.toLowerCase().trim();
    for (const row of rows) {
      const ptMatch = norm(row.productType) === norm(productType);
      const catOk = !row.category || norm(String(row.category)) === norm(catMatch);
      const designOk = !row.designType || norm(row.designType) === norm(designType);
      const metalOk = !row.metal || norm(row.metal) === norm(metal);
      const purityOk = !row.purityKarat || norm(row.purityKarat) === norm(purity);
      if (ptMatch && catOk && designOk && metalOk && purityOk && typeof row.vendorCommission === 'number') {
        percent = Math.max(0, Math.min(100, row.vendorCommission));
        break;
      }
    }
  }
  if (percent === 0 && ptCommissions && productType && typeof ptCommissions[productType] === 'number') {
    percent = Math.max(0, Math.min(100, ptCommissions[productType]));
  }
  const retailerPrice = percent > 0 && basePrice > 0 ? Math.round(basePrice * (1 - percent / 100)) : basePrice;
  return { percent, retailerPrice };
}

// GET cart
export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const retailerData = await db.collection('retailers').findOne(
      { _id: new ObjectId(retailer.id) },
      { projection: { cart: 1 } }
    );
    const cartItems = Array.isArray(retailerData?.cart) ? retailerData.cart : [];
    if (cartItems.length === 0) return NextResponse.json({ items: [] });

    const productIds = cartItems.map((item: { productId: string }) => new ObjectId(item.productId));
    const products = await db.collection('products').find({ _id: { $in: productIds }, status: 'active' }).toArray();
    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

    const vendorIds = Array.from(
      new Set(
        products.map((p: any) => p.vendorId).filter(Boolean).map((id: any) => (typeof id === 'string' ? id : (id instanceof ObjectId ? id : (id as ObjectId)).toString()))
      )
    );
    const vendorsList = vendorIds.length > 0
      ? await db.collection('vendors').find({ _id: { $in: vendorIds.map((id: string) => new ObjectId(id)) } }).project({ _id: 1, b2bProductTypeCommissions: 1, b2bCommissionRows: 1 }).toArray()
      : [];
    const vendorMap = new Map(vendorsList.map((v: any) => [v._id.toString(), v]));

    const categoryIds = Array.from(new Set(products.map((p: any) => (p.category instanceof ObjectId ? p.category.toString() : typeof p.category === 'string' ? p.category : null)).filter(Boolean)));
    const categories = categoryIds.length > 0 ? await db.collection('categories').find({ _id: { $in: categoryIds.map((id: string) => new ObjectId(id)) } }).project({ name: 1 }).toArray() : [];
    const categoryMap = new Map(categories.map((c: any) => [c._id.toString(), c.name]));

    const items = cartItems.map((item: { productId: string; quantity: number }) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      const categoryId = product.category instanceof ObjectId ? product.category.toString() : product.category;
      const categoryName = categoryId ? categoryMap.get(categoryId) : null;
      const vendor = product.vendorId ? vendorMap.get((product.vendorId as ObjectId).toString()) : null;
      const { percent, retailerPrice } = getRetailerCommissionAndPrice(vendor ?? null, product, categoryName ?? null);
      return {
        _id: product._id.toString(),
        id: product._id.toString(),
        name: product.name,
        title: product.name,
        productId: product._id.toString(),
        image: product.mainImage || '',
        quantity: item.quantity || 1,
        displayPrice: retailerPrice,
        originalPrice: formatProductPrice(product).originalPrice,
        retailerDiscountPercent: percent,
        subtotal: retailerPrice * (item.quantity || 1),
        stock: product.stock || 0,
      };
    }).filter(Boolean);

    return NextResponse.json({ items });
  } catch (e) {
    console.error('[Retailer Cart] GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// POST add to cart
export async function POST(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { productId, quantity = 1 } = body;
    if (!productId || quantity < 1) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const { db } = await connectToDatabase();
    let product = await db.collection('products').findOne({ _id: new ObjectId(productId), status: 'active' });
    if (!product) product = await db.collection('products').findOne({ urlSlug: productId, status: 'active' });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if ((product.stock || 0) < quantity) return NextResponse.json({ error: 'Insufficient stock', availableStock: product.stock || 0 }, { status: 400 });

    const retailerData = await db.collection('retailers').findOne({ _id: new ObjectId(retailer.id) }, { projection: { cart: 1 } });
    const currentCart = Array.isArray(retailerData?.cart) ? retailerData.cart : [];
    const pid = (product._id as ObjectId).toString();
    const existing = currentCart.findIndex((item: { productId: string }) => item.productId === pid);
    if (existing !== -1) {
      return NextResponse.json({ message: 'Already in cart', alreadyInCart: true });
    }

    const updatedCart = [...currentCart, { productId: pid, quantity, addedAt: new Date() }];
    await db.collection('retailers').updateOne(
      { _id: new ObjectId(retailer.id) },
      { $set: { cart: updatedCart, updatedAt: new Date() } }
    );
    return NextResponse.json({ message: 'Added to cart', added: true });
  } catch (e) {
    console.error('[Retailer Cart] POST error:', e);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

// PUT update quantity
export async function PUT(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { productId, quantity } = body;
    if (!productId || quantity < 1) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const { db } = await connectToDatabase();
    const retailerData = await db.collection('retailers').findOne({ _id: new ObjectId(retailer.id) }, { projection: { cart: 1 } });
    const currentCart = Array.isArray(retailerData?.cart) ? retailerData.cart : [];
    const pid = String(productId);
    const idx = currentCart.findIndex((item: { productId: string }) => item.productId === pid);
    if (idx === -1) return NextResponse.json({ error: 'Item not in cart' }, { status: 404 });

    const product = await db.collection('products').findOne({ _id: new ObjectId(pid), status: 'active' });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if ((product.stock || 0) < quantity) return NextResponse.json({ error: 'Insufficient stock', availableStock: product.stock }, { status: 400 });

    const updatedCart = [...currentCart];
    updatedCart[idx] = { ...updatedCart[idx], quantity, updatedAt: new Date() };
    await db.collection('retailers').updateOne(
      { _id: new ObjectId(retailer.id) },
      { $set: { cart: updatedCart, updatedAt: new Date() } }
    );
    return NextResponse.json({ message: 'Cart updated' });
  } catch (e) {
    console.error('[Retailer Cart] PUT error:', e);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

// DELETE remove item or clear cart
export async function DELETE(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const clearAll = searchParams.get('clearAll') === 'true';

    const { db } = await connectToDatabase();
    if (clearAll) {
      await db.collection('retailers').updateOne(
        { _id: new ObjectId(retailer.id) },
        { $set: { cart: [], updatedAt: new Date() } }
      );
      return NextResponse.json({ message: 'Cart cleared', cleared: true });
    }
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

    const retailerData = await db.collection('retailers').findOne({ _id: new ObjectId(retailer.id) }, { projection: { cart: 1 } });
    const currentCart = Array.isArray(retailerData?.cart) ? retailerData.cart : [];
    const updatedCart = currentCart.filter((item: { productId: string }) => item.productId !== String(productId));
    await db.collection('retailers').updateOne(
      { _id: new ObjectId(retailer.id) },
      { $set: { cart: updatedCart, updatedAt: new Date() } }
    );
    return NextResponse.json({ message: 'Item removed', removed: true });
  } catch (e) {
    console.error('[Retailer Cart] DELETE error:', e);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
