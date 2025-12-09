import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getCustomerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Get wishlist items
export async function GET(request: NextRequest) {
  try {
    const customer = getCustomerFromRequest(request);
    
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Get customer with wishlist
    const customerData = await db.collection('customers').findOne(
      { _id: new ObjectId(customer.id) },
      { projection: { wishlist: 1 } }
    );

    const wishlistProductIds = customerData?.wishlist || [];

    if (wishlistProductIds.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Fetch products
    const products = await db.collection('products').find({
      _id: { $in: wishlistProductIds.map((id: string) => new ObjectId(id)) },
      status: { $in: ['published', 'active'] }
    }).toArray();

    // Format products for frontend
    const formattedProducts = products.map(product => ({
      _id: product._id.toString(),
      id: product._id.toString(), // Use string ID for consistency
      name: product.name,
      title: product.name,
      category: product.category || '',
      price: `₹${product.sellingPrice?.toLocaleString() || product.regularPrice?.toLocaleString() || '0'}`,
      originalPrice: product.regularPrice && product.regularPrice > (product.sellingPrice || 0)
        ? `₹${product.regularPrice.toLocaleString()}`
        : undefined,
      image: product.mainImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
      rating: 4.5,
      reviews: 0,
      badge: product.featured ? 'Featured' : product.trending ? 'Trending' : undefined,
      displayPrice: product.sellingPrice || product.regularPrice || 0,
      originalPriceNum: product.regularPrice || 0,
      stock: product.stock || 0,
      inStock: (product.stock || 0) > 0,
      urlSlug: product.urlSlug || product._id.toString(),
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error('[Wishlist] Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// Add product to wishlist
export async function POST(request: NextRequest) {
  try {
    const customer = getCustomerFromRequest(request);
    
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
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

    // Get current wishlist
    const customerData = await db.collection('customers').findOne(
      { _id: new ObjectId(customer.id) },
      { projection: { wishlist: 1 } }
    );

    const currentWishlist = customerData?.wishlist || [];
    const productIdStr = productId.toString();

    // Check if already in wishlist
    if (currentWishlist.includes(productIdStr)) {
      return NextResponse.json({ message: 'Product already in wishlist', added: false });
    }

    // Add to wishlist
    await db.collection('customers').updateOne(
      { _id: new ObjectId(customer.id) },
      { 
        $set: { 
          wishlist: [...currentWishlist, productIdStr],
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ message: 'Product added to wishlist', added: true });
  } catch (error) {
    console.error('[Wishlist] Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// Remove product from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const customer = getCustomerFromRequest(request);
    
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Get current wishlist
    const customerData = await db.collection('customers').findOne(
      { _id: new ObjectId(customer.id) },
      { projection: { wishlist: 1 } }
    );

    const currentWishlist = customerData?.wishlist || [];
    const productIdStr = productId.toString();

    // Remove from wishlist
    const updatedWishlist = currentWishlist.filter((id: string) => id !== productIdStr);

    await db.collection('customers').updateOne(
      { _id: new ObjectId(customer.id) },
      { 
        $set: { 
          wishlist: updatedWishlist,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ message: 'Product removed from wishlist', removed: true });
  } catch (error) {
    console.error('[Wishlist] Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}

