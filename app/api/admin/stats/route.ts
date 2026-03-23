import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isVendor } from '@/lib/auth';
import { rejectIfNoAdminAccess } from '@/lib/admin-api-authorize';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);
    const denied = rejectIfNoAdminAccess(request, currentUser, 'admin-or-vendor');
    if (denied) return denied;

    const { db } = await connectToDatabase();
    
    // Build filter based on user role
    const productFilter: any = {};
    const orderFilter: any = {};
    
    if (currentUser && isVendor(currentUser)) {
      // Vendors only see their own stats
      productFilter.vendorId = currentUser.id;
      orderFilter['items.vendorId'] = currentUser.id;
    }

    // Get total products
    const totalProducts = await db.collection('products').countDocuments(productFilter);

    // Get total orders (if exists)
    const totalOrders = await db.collection('orders').countDocuments(orderFilter).catch(() => 0);

    // Get revenue from orders
    const revenueAggregation = [
      ...(Object.keys(orderFilter).length > 0 ? [{ $match: orderFilter }] : []),
      { $group: { _id: null, total: { $sum: '$total' } } }
    ];
    
    const revenueResult = await db.collection('orders')
      .aggregate(revenueAggregation)
      .toArray()
      .catch(() => []);

    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get total customers (only for admins, vendors don't need this)
    const customers = currentUser && isVendor(currentUser) 
      ? 0 
      : await db.collection('users').countDocuments().catch(() => 0);

    // Product type distribution (Gold/Silver/etc.) for dashboard charts
    const productTypeDistribution = await db.collection('products')
      .aggregate([
        ...(Object.keys(productFilter).length > 0 ? [{ $match: productFilter }] : []),
        {
          $project: {
            productType: {
              $ifNull: ['$product_type', { $ifNull: ['$productType', 'Unknown'] }],
            },
          },
        },
        { $group: { _id: '$productType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ])
      .toArray()
      .catch(() => []);

    // Featured products for "Jewellery Deals" card
    const featuredProducts = await db.collection('products')
      .find(productFilter)
      .project({ name: 1, product_type: 1, productType: 1, price: 1, sellingPrice: 1 })
      .sort({ updatedAt: -1 })
      .limit(6)
      .toArray()
      .catch(() => []);

    // Supplier info rows for dashboard (dynamic, no static placeholder rows).
    const supplierCounts = await db.collection('products')
      .aggregate([
        ...(Object.keys(productFilter).length > 0 ? [{ $match: productFilter }] : []),
        { $group: { _id: '$vendorId', productCount: { $sum: 1 } } },
        { $sort: { productCount: -1 } },
        { $limit: 6 },
      ])
      .toArray()
      .catch(() => []);

    const supplierVendorIds = supplierCounts
      .map((s: any) => s?._id)
      .filter((id: any) => typeof id === 'string' && ObjectId.isValid(id))
      .map((id: string) => new ObjectId(id));

    const vendorDocs = supplierVendorIds.length > 0
      ? await db.collection('vendors')
          .find({ _id: { $in: supplierVendorIds } })
          .project({ _id: 1, storeName: 1, ownerName: 1, phone: 1, status: 1 })
          .toArray()
          .catch(() => [])
      : [];
    const vendorById = new Map(vendorDocs.map((v: any) => [String(v._id), v]));
    const topSuppliers = supplierCounts.map((s: any) => {
      const vendor = vendorById.get(String(s?._id));
      return {
        supplier: vendor?.storeName || vendor?.ownerName || 'Admin Catalog',
        products: Number(s?.productCount || 0),
        contact: vendor?.phone || '—',
        status: vendor?.status || (s?._id ? 'active' : 'system'),
      };
    });

    // Recent orders split by customer (B2C) and retailer (B2B)
    const recentCustomerOrders = await db.collection('orders')
      .find({ ...orderFilter, orderType: { $ne: 'b2b' } })
      .project({ orderId: 1, customerName: 1, total: 1, orderStatus: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()
      .catch(() => []);

    const recentRetailerOrders = await db.collection('orders')
      .find({ ...orderFilter, orderType: 'b2b' })
      .project({ orderId: 1, customerName: 1, total: 1, orderStatus: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()
      .catch(() => []);

    return NextResponse.json({
      totalProducts,
      totalOrders,
      revenue,
      customers,
      productTypeDistribution: productTypeDistribution.map((p: any) => ({
        name: p?._id || 'Unknown',
        value: Number(p?.count || 0),
      })),
      featuredProducts: featuredProducts.map((p: any) => ({
        name: p?.name || 'Product',
        type: p?.product_type || p?.productType || 'Unknown',
        price: Number(p?.sellingPrice ?? p?.price ?? 0),
      })),
      topSuppliers,
      recentCustomerOrders: recentCustomerOrders.map((o: any) => ({
        orderId: o?.orderId || '-',
        customerName: o?.customerName || 'Customer',
        total: Number(o?.total || 0),
        orderStatus: o?.orderStatus || 'pending',
        createdAt: o?.createdAt || null,
      })),
      recentRetailerOrders: recentRetailerOrders.map((o: any) => ({
        orderId: o?.orderId || '-',
        customerName: o?.customerName || 'Retailer',
        total: Number(o?.total || 0),
        orderStatus: o?.orderStatus || 'pending',
        createdAt: o?.createdAt || null,
      })),
    });
  } catch (error) {
    console.error('[v0] Error fetching stats:', error);
    return NextResponse.json(
      {
        totalProducts: 0,
        totalOrders: 0,
        revenue: 0,
        customers: 0,
        productTypeDistribution: [],
        featuredProducts: [],
        topSuppliers: [],
        recentCustomerOrders: [],
        recentRetailerOrders: [],
      }
    );
  }
}
