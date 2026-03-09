import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getCustomerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { formatProductPrice } from '@/lib/utils/price-calculator';
import { findRetailerCommissionFromRows, getCustomerPriceFromRetailer } from '@/lib/retailer-commission';

function normalizeCategoryId(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof ObjectId) return value.toString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value && '_id' in value) return (value as { _id: ObjectId })._id.toString();
  return null;
}

// Get cart items (vendor + retailer)
export async function GET(request: NextRequest) {
  try {
    const customer = getCustomerFromRequest(request);
    if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const customerData = await db.collection('customers').findOne(
      { _id: new ObjectId(customer.id) },
      { projection: { cart: 1 } }
    );
    const cartItems = Array.isArray(customerData?.cart) ? customerData.cart : [];

    if (cartItems.length === 0) return NextResponse.json({ items: [] });

    const vendorItems = cartItems.filter((i: { productId?: string }) => i.productId);
    const retailerItems = cartItems.filter((i: { retailerProductId?: string }) => i.retailerProductId);

    const formatted: Array<{
      _id: string;
      id: string;
      name: string;
      title: string;
      category: string;
      price: string;
      image: string;
      quantity: number;
      displayPrice: number;
      originalPriceNum?: number;
      stock: number;
      urlSlug?: string;
      sellerType?: 'vendor' | 'retailer';
      retailerId?: string;
      shopName?: string;
    }> = [];

    if (vendorItems.length > 0) {
      const productIds = vendorItems.map((i: { productId: string }) => new ObjectId(i.productId));
      const products = await db.collection('products').find({
        _id: { $in: productIds },
        status: { $in: ['published', 'active'] },
      }).toArray();
      const productMap = new Map(products.map((p: { _id: ObjectId }) => [p._id.toString(), p]));

      const normalizeCategoryId = (value: unknown) => {
        if (!value) return null;
        if (value instanceof ObjectId) return value.toString();
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value && '_id' in value) return (value as { _id: ObjectId })._id.toString();
        return null;
      };
      const categoryIds = Array.from(
        new Set(
          products
            .map((p: { category?: unknown }) => normalizeCategoryId(p.category))
            .filter((id): id is string => !!id && ObjectId.isValid(id))
        )
      );
      const categories = categoryIds.length
        ? await db.collection('categories').find({ _id: { $in: categoryIds.map((id: string) => new ObjectId(id)) } }).project({ name: 1 }).toArray()
        : [];
      const categoryMap = new Map(categories.map((c: { _id: ObjectId; name: string }) => [c._id.toString(), c.name]));

      for (const item of vendorItems) {
        const product = productMap.get(item.productId);
        if (!product) continue;
        const priceData = formatProductPrice(product);
        const categoryId = normalizeCategoryId(product.category);
        const categoryName = categoryId ? categoryMap.get(categoryId) : null;
        formatted.push({
          _id: product._id.toString(),
          id: product._id.toString(),
          name: product.name,
          title: product.name,
          category: (categoryName ?? product.category) || '',
          price: `₹${priceData.displayPrice.toLocaleString()}`,
          image: product.mainImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
          quantity: item.quantity || 1,
          urlSlug: product.urlSlug || product._id.toString(),
          displayPrice: priceData.displayPrice,
          originalPriceNum: priceData.originalPrice,
          stock: product.stock || 0,
          sellerType: 'vendor',
        });
      }
    }

    if (retailerItems.length > 0) {
      const rpIds = retailerItems.map((i: { retailerProductId: string }) => new ObjectId(i.retailerProductId));
      const rps = await db.collection('retailer_products').find({ _id: { $in: rpIds }, status: 'active' }).toArray();
      const rpMap = new Map(rps.map((p: { _id: ObjectId }) => [p._id.toString(), p]));

      const srcIds = [...new Set((rps as any[]).map((p) => p.sourceProductId).filter(Boolean))].map((id) => (id instanceof ObjectId ? id : new ObjectId(String(id))));
      const retIds = [...new Set((rps as any[]).map((p) => p.retailerId).filter(Boolean))].map((id) => (id instanceof ObjectId ? id : new ObjectId(String(id))));
      const [sourceProducts, retailerDocs] = await Promise.all([
        srcIds.length > 0 ? db.collection('products').find({ _id: { $in: srcIds } }).project({ _id: 1, product_type: 1, category: 1, designType: 1, goldPurity: 1, silverPurity: 1 }).toArray() : [],
        retIds.length > 0 ? db.collection('retailers').find({ _id: { $in: retIds } }).project({ _id: 1, retailerCommissionRows: 1 }).toArray() : [],
      ]);
      const srcMap = new Map(sourceProducts.map((p: any) => [p._id.toString(), p]));
      const retMap = new Map(retailerDocs.map((r: any) => [r._id.toString(), r]));
      const catIds = [...new Set(sourceProducts.map((p: any) => normalizeCategoryId(p.category)).filter(Boolean))].filter((id): id is string => !!id && ObjectId.isValid(id));
      const catDocs = catIds.length > 0 ? await db.collection('categories').find({ _id: { $in: catIds.map((id) => new ObjectId(id)) } }).project({ _id: 1, name: 1 }).toArray() : [];
      const catNameMap = new Map(catDocs.map((c: any) => [c._id.toString(), c.name]));

      for (const item of retailerItems) {
        const rp = rpMap.get(item.retailerProductId);
        if (!rp) continue;
        const qty = Math.max(1, item.quantity || 1);
        const sellingPrice = Number((rp as { sellingPrice?: number }).sellingPrice) || 0;
        let customerPrice = sellingPrice;
        const storedPct = (rp as { retailerCommissionRate?: number }).retailerCommissionRate;
        if (typeof storedPct === 'number' && Number.isFinite(storedPct)) {
          customerPrice = getCustomerPriceFromRetailer(sellingPrice, storedPct);
        } else {
          const source = (rp as any).sourceProductId ? srcMap.get(((rp as any).sourceProductId instanceof ObjectId ? (rp as any).sourceProductId : new ObjectId(String((rp as any).sourceProductId))).toString()) : null;
          const retailer = (rp as any).retailerId ? retMap.get(((rp as any).retailerId instanceof ObjectId ? (rp as any).retailerId : new ObjectId(String((rp as any).retailerId))).toString()) : null;
          const rows = Array.isArray((retailer as any)?.retailerCommissionRows) ? (retailer as any).retailerCommissionRows : [];
          if (rows.length > 0) {
            const productType = (source?.product_type || (rp as any).product_type || '').trim();
            const categoryId = source?.category ? normalizeCategoryId(source.category) : null;
            const categoryName = categoryId ? catNameMap.get(categoryId) || '' : ((rp as any).category || '').trim();
            const designType = (source?.designType || (rp as any).designType || '').trim();
            const metal = productType === 'Gold' || productType === 'Silver' || productType === 'Platinum' ? productType : '';
            const purity = (source?.goldPurity || source?.silverPurity || (rp as any).goldPurity || (rp as any).silverPurity || '').trim();
            const pct = findRetailerCommissionFromRows(rows, productType, categoryName, designType, metal, purity);
            customerPrice = getCustomerPriceFromRetailer(sellingPrice, pct);
          }
        }
        formatted.push({
          _id: (rp._id as ObjectId).toString(),
          id: (rp._id as ObjectId).toString(),
          name: (rp as { name?: string }).name || 'Product',
          title: (rp as { name?: string }).name || 'Product',
          category: 'Partner Store',
          price: `₹${customerPrice.toLocaleString()}`,
          image: (rp as { mainImage?: string }).mainImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
          quantity: qty,
          displayPrice: customerPrice,
          originalPriceNum: sellingPrice,
          stock: (rp as { quantity?: number }).quantity || 0,
          sellerType: 'retailer',
          retailerId: (rp as { retailerId?: ObjectId }).retailerId?.toString(),
          shopName: (rp as { shopName?: string }).shopName,
        });
      }
    }

    return NextResponse.json({ items: formatted });
  } catch (error) {
    console.error('[Cart] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// Add to cart: productId (vendor) OR retailerProductId + retailerId (retailer)
export async function POST(request: NextRequest) {
  try {
    const customer = getCustomerFromRequest(request);
    if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { productId, quantity = 1, retailerProductId, retailerId } = body;

    if (quantity < 1) return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });

    const { db } = await connectToDatabase();
    const customerData = await db.collection('customers').findOne(
      { _id: new ObjectId(customer.id) },
      { projection: { cart: 1 } }
    );
    const currentCart = Array.isArray(customerData?.cart) ? customerData.cart : [];

    const hasVendor = currentCart.some((i: { productId?: string }) => i.productId);
    const hasRetailer = currentCart.some((i: { retailerProductId?: string }) => i.retailerProductId);
    const existingRetailerId = currentCart.find((i: { retailerId?: string }) => i.retailerId)?.retailerId;

    if (retailerProductId && retailerId) {
      if (hasVendor) return NextResponse.json({ error: 'Clear cart to add from partner store' }, { status: 400 });
      if (hasRetailer && existingRetailerId !== retailerId) return NextResponse.json({ error: 'Cart has items from another partner. Clear cart to add from this store.' }, { status: 400 });

      const rp = await db.collection('retailer_products').findOne({
        _id: new ObjectId(retailerProductId),
        retailerId: new ObjectId(retailerId),
        status: 'active',
      });
      if (!rp) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      const stock = (rp as { quantity?: number }).quantity || 0;
      if (stock < quantity) return NextResponse.json({ error: 'Insufficient stock', availableStock: stock }, { status: 400 });

      const existing = currentCart.find((i: { retailerProductId?: string }) => i.retailerProductId === retailerProductId);
      if (existing) return NextResponse.json({ message: 'Already in cart', alreadyInCart: true }, { status: 200 });

      const updatedCart = [
        ...currentCart,
        { retailerProductId, retailerId, quantity, addedAt: new Date() },
      ];
      await db.collection('customers').updateOne(
        { _id: new ObjectId(customer.id) },
        { $set: { cart: updatedCart, updatedAt: new Date() } }
      );
      return NextResponse.json({ message: 'Product added to cart', added: true, alreadyInCart: false });
    }

    if (!productId) return NextResponse.json({ error: 'Product ID or retailer product info required' }, { status: 400 });
    if (hasRetailer) return NextResponse.json({ error: 'Clear cart to add store products' }, { status: 400 });

    let product = await db.collection('products').findOne({ urlSlug: productId, status: { $in: ['published', 'active'] } });
    if (!product && ObjectId.isValid(productId)) {
      product = await db.collection('products').findOne({ _id: new ObjectId(productId), status: { $in: ['published', 'active'] } });
    }
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if ((product.stock || 0) < quantity) return NextResponse.json({ error: 'Insufficient stock', availableStock: product.stock || 0 }, { status: 400 });

    const productIdStr = product._id.toString();
    if (currentCart.some((i: { productId: string }) => i.productId === productIdStr)) {
      return NextResponse.json({ message: 'Already in cart', alreadyInCart: true }, { status: 200 });
    }

    const updatedCart = [...currentCart, { productId: productIdStr, quantity, addedAt: new Date() }];
    await db.collection('customers').updateOne(
      { _id: new ObjectId(customer.id) },
      { $set: { cart: updatedCart, updatedAt: new Date() } }
    );
    return NextResponse.json({ message: 'Product added to cart', added: true, alreadyInCart: false });
  } catch (error) {
    console.error('[Cart] POST error:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

// Update quantity: productId or retailerProductId
export async function PUT(request: NextRequest) {
  try {
    const customer = getCustomerFromRequest(request);
    if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { productId, retailerProductId, quantity } = body;
    const itemId = productId || retailerProductId;
    if (!itemId || quantity < 1) return NextResponse.json({ error: 'Item id and quantity required' }, { status: 400 });

    const { db } = await connectToDatabase();
    const customerData = await db.collection('customers').findOne(
      { _id: new ObjectId(customer.id) },
      { projection: { cart: 1 } }
    );
    const currentCart = Array.isArray(customerData?.cart) ? customerData.cart : [];
    const itemIndex = currentCart.findIndex(
      (i: { productId?: string; retailerProductId?: string }) => i.productId === itemId || i.retailerProductId === itemId
    );
    if (itemIndex === -1) return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });

    const item = currentCart[itemIndex];
    if (item.retailerProductId) {
      const rp = await db.collection('retailer_products').findOne({ _id: new ObjectId(item.retailerProductId), status: 'active' });
      if (!rp) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      const stock = (rp as { quantity?: number }).quantity || 0;
      if (stock < quantity) return NextResponse.json({ error: 'Insufficient stock', availableStock: stock }, { status: 400 });
    } else {
      const product = await db.collection('products').findOne({ _id: new ObjectId(item.productId), status: { $in: ['published', 'active'] } });
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      if ((product.stock || 0) < quantity) return NextResponse.json({ error: 'Insufficient stock', availableStock: product.stock || 0 }, { status: 400 });
    }

    const updatedCart = [...currentCart];
    updatedCart[itemIndex] = { ...updatedCart[itemIndex], quantity, updatedAt: new Date() };
    await db.collection('customers').updateOne(
      { _id: new ObjectId(customer.id) },
      { $set: { cart: updatedCart, updatedAt: new Date() } }
    );
    return NextResponse.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('[Cart] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

// Remove: productId or retailerProductId; or clearAll
export async function DELETE(request: NextRequest) {
  try {
    const customer = getCustomerFromRequest(request);
    if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const retailerProductId = searchParams.get('retailerProductId');
    const clearAll = searchParams.get('clearAll') === 'true';

    const { db } = await connectToDatabase();

    if (clearAll) {
      await db.collection('customers').updateOne(
        { _id: new ObjectId(customer.id) },
        { $set: { cart: [], updatedAt: new Date() } }
      );
      return NextResponse.json({ message: 'Cart cleared', cleared: true });
    }

    const itemId = productId || retailerProductId;
    if (!itemId) return NextResponse.json({ error: 'Product ID or retailer product ID required' }, { status: 400 });

    const customerData = await db.collection('customers').findOne(
      { _id: new ObjectId(customer.id) },
      { projection: { cart: 1 } }
    );
    const currentCart = Array.isArray(customerData?.cart) ? customerData.cart : [];
    const updatedCart = currentCart.filter(
      (i: { productId?: string; retailerProductId?: string }) => i.productId !== itemId && i.retailerProductId !== itemId
    );
    await db.collection('customers').updateOne(
      { _id: new ObjectId(customer.id) },
      { $set: { cart: updatedCart, updatedAt: new Date() } }
    );
    return NextResponse.json({ message: 'Item removed', removed: true });
  } catch (error) {
    console.error('[Cart] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}
