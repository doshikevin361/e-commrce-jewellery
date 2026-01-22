import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getCustomerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { formatProductPrice } from '@/lib/utils/price-calculator';

// Get cart items
export async function GET(request: NextRequest) {
  try {
    const customer = getCustomerFromRequest(request);
    
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Get customer with cart
    const customerData = await db.collection('customers').findOne(
      { _id: new ObjectId(customer.id) },
      { projection: { cart: 1 } }
    );

    const cartItems = customerData?.cart || [];

    if (cartItems.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Fetch products for cart items
    const productIds = cartItems.map((item: any) => new ObjectId(item.productId));
    const products = await db.collection('products').find({
      _id: { $in: productIds },
      status: { $in: ['published', 'active'] }
    }).toArray();

    const normalizeCategoryId = (value: any) => {
      if (!value) return null;
      if (value instanceof ObjectId) return value.toString();
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && value._id) return value._id.toString();
      return null;
    };

    const categoryIds = Array.from(
      new Set(
        products
          .map(product => normalizeCategoryId(product.category))
          .filter((id): id is string => !!id && ObjectId.isValid(id))
      )
    );

    const categories = categoryIds.length
      ? await db
          .collection('categories')
          .find({ _id: { $in: categoryIds.map(id => new ObjectId(id)) } })
          .project({ name: 1 })
          .toArray()
      : [];

    const categoryMap = new Map(categories.map(category => [category._id.toString(), category.name]));

    // Create a map for quick product lookup
    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

    // Format cart items with product details
    const formattedItems = cartItems
      .map((item: any) => {
        const product = productMap.get(item.productId);
        if (!product) return null; // Skip if product not found

        const priceData = formatProductPrice(product);

        const categoryId = normalizeCategoryId(product.category);
        const categoryName = categoryId ? categoryMap.get(categoryId) : null;

        return {
          _id: product._id.toString(),
          id: product._id.toString(),
          name: product.name,
          title: product.name,
          category: (categoryName ? categoryName : product.category) || '',
          price: `₹${priceData.displayPrice.toLocaleString()}`,
          image: product.mainImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
          quantity: item.quantity || 1,
          urlSlug: product.urlSlug || product._id.toString(),
          displayPrice: priceData.displayPrice,
          originalPriceNum: priceData.originalPrice,
          stock: product.stock || 0,
        };
      })
      .filter((item: any) => item !== null); // Remove null items

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error('[Cart] Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// Add product to cart
export async function POST(request: NextRequest) {
  try {
    const customer = getCustomerFromRequest(request);
    
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Try to find product by slug first, then by ID
    let product = await db.collection('products').findOne({ 
      urlSlug: productId,
      status: { $in: ['published', 'active'] }
    });

    // If not found by slug, try to find by ID
    if (!product && ObjectId.isValid(productId)) {
      product = await db.collection('products').findOne({ 
        _id: new ObjectId(productId),
        status: { $in: ['published', 'active'] }
      });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check stock availability
    if ((product.stock || 0) < quantity) {
      return NextResponse.json({ 
        error: 'Insufficient stock available',
        availableStock: product.stock || 0
      }, { status: 400 });
    }

    // Get current cart
    const customerData = await db.collection('customers').findOne(
      { _id: new ObjectId(customer.id) },
      { projection: { cart: 1 } }
    );

    const currentCart = customerData?.cart || [];
    const productIdStr = product._id.toString();

    // Check if product already exists in cart
    const existingItemIndex = currentCart.findIndex(
      (item: any) => item.productId === productIdStr
    );

    if (existingItemIndex !== -1) {
      // Product already in cart
      return NextResponse.json({ 
        message: 'This item already exists in cart',
        alreadyInCart: true
      }, { status: 200 });
    }

    // Add to cart
    const updatedCart = [
      ...currentCart,
      {
        productId: productIdStr,
        quantity: quantity,
        addedAt: new Date()
      }
    ];

    await db.collection('customers').updateOne(
      { _id: new ObjectId(customer.id) },
      { 
        $set: { 
          cart: updatedCart,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ 
      message: 'Product added to cart successfully',
      added: true,
      alreadyInCart: false
    });
  } catch (error) {
    console.error('[Cart] Error adding to cart:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

// Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const customer = getCustomerFromRequest(request);
    
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Get current cart
    const customerData = await db.collection('customers').findOne(
      { _id: new ObjectId(customer.id) },
      { projection: { cart: 1 } }
    );

    const currentCart = customerData?.cart || [];
    const productIdStr = productId.toString();

    // Find and update the item
    const itemIndex = currentCart.findIndex(
      (item: any) => item.productId === productIdStr
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    // Check stock availability
    const product = await db.collection('products').findOne({
      _id: new ObjectId(productIdStr),
      status: { $in: ['published', 'active'] }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if ((product.stock || 0) < quantity) {
      return NextResponse.json({ 
        error: 'Insufficient stock available',
        availableStock: product.stock || 0
      }, { status: 400 });
    }

    // Update quantity
    const updatedCart = [...currentCart];
    updatedCart[itemIndex] = {
      ...updatedCart[itemIndex],
      quantity: quantity,
      updatedAt: new Date()
    };

    await db.collection('customers').updateOne(
      { _id: new ObjectId(customer.id) },
      { 
        $set: { 
          cart: updatedCart,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('[Cart] Error updating cart:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

// Remove product from cart or clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const customer = getCustomerFromRequest(request);
    
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const clearAll = searchParams.get('clearAll') === 'true';

    const { db } = await connectToDatabase();

    // If clearAll is true, clear the entire cart
    if (clearAll) {
      console.log('[Cart] Clearing entire cart for customer:', customer.id);
      await db.collection('customers').updateOne(
        { _id: new ObjectId(customer.id) },
        { 
          $set: { 
            cart: [],
            updatedAt: new Date()
          } 
        }
      );
      return NextResponse.json({ message: 'Cart cleared successfully', cleared: true });
    }

    // Otherwise, remove specific product
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Get current cart
    const customerData = await db.collection('customers').findOne(
      { _id: new ObjectId(customer.id) },
      { projection: { cart: 1 } }
    );

    const currentCart = customerData?.cart || [];
    const productIdStr = productId.toString();

    // Remove from cart
    const updatedCart = currentCart.filter(
      (item: any) => item.productId !== productIdStr
    );

    await db.collection('customers').updateOne(
      { _id: new ObjectId(customer.id) },
      { 
        $set: { 
          cart: updatedCart,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ message: 'Product removed from cart', removed: true });
  } catch (error) {
    console.error('[Cart] Error removing from cart:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}

