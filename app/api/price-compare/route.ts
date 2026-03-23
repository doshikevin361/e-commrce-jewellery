import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, getRetailerFromRequest, isAdminOrVendor } from '@/lib/auth';
import { staffCanAccessApiPath } from '@/lib/admin-modules';
import { formatProductPrice } from '@/lib/utils/price-calculator';
import { ObjectId } from 'mongodb';

/**
 * GET - Price/rate comparison for admin, vendor, and retailer.
 * Returns vendor + retailer products with seller name and price so users can
 * compare rates category-wise and set competitive prices/commission.
 * Auth: admin token (admin/vendor) OR retailer token.
 */
export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    const adminUser = getUserFromRequest(request);
    const isRetailer = !!retailer;
    const path = request.nextUrl.pathname;
    const isAdminOrVendorUser =
      !!adminUser &&
      (isAdminOrVendor(adminUser) ||
        (adminUser.role === 'staff' && staffCanAccessApiPath(adminUser.permissions || [], path)));
    if (!isRetailer && !isAdminOrVendorUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentUserId = isRetailer ? retailer?.id : adminUser?.id;

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category')?.trim() || '';
    const productTypeFilter = searchParams.get('product_type')?.trim() || '';
    const sellerTypeFilter = searchParams.get('seller_type')?.trim()?.toLowerCase() || 'all'; // 'all' | 'vendor' | 'retailer'

    const categories = await db.collection('categories').find({}).project({ _id: 1, name: 1 }).toArray();
    const categoryIdToName = new Map(categories.map((c: { _id: ObjectId; name: string }) => [c._id.toString(), c.name]));

    const vendorProducts = await db
      .collection('products')
      .find({ status: 'active' })
      .project({
        _id: 1,
        name: 1,
        category: 1,
        product_type: 1,
        vendorId: 1,
        sellingPrice: 1,
        price: 1,
        subTotal: 1,
        totalAmount: 1,
        regularPrice: 1,
        mrp: 1,
        discount: 1,
        livePriceEnabled: 1,
        metalCost: 1,
        makingChargeAmount: 1,
        gstAmount: 1,
      })
      .toArray();
    const vendorIds = [...new Set((vendorProducts as any[]).map(p => p.vendorId).filter(Boolean))].map(id =>
      id instanceof ObjectId ? id : new ObjectId(String(id))
    );
    const vendors = await db
      .collection('vendors')
      .find({ _id: { $in: vendorIds } })
      .project({ _id: 1, storeName: 1, companyName: 1 })
      .toArray();
    const vendorNameMap = new Map(
      vendors.map((v: any) => [
        (v._id as ObjectId).toString(),
        (v.storeName || v.companyName || 'Vendor').trim() || 'Vendor',
      ])
    );

    const retailerProducts = await db
      .collection('retailer_products')
      .find({ status: 'active' })
      .project({ _id: 1, name: 1, category: 1, product_type: 1, sellingPrice: 1, retailerId: 1, shopName: 1 })
      .toArray();
    const retailerIds = [...new Set((retailerProducts as any[]).map(p => p.retailerId).filter(Boolean))].map(id =>
      id instanceof ObjectId ? id : new ObjectId(String(id))
    );
    const retailers =
      retailerIds.length > 0
        ? await db
            .collection('retailers')
            .find({ _id: { $in: retailerIds } })
            .project({ _id: 1, companyName: 1, fullName: 1 })
            .toArray()
        : [];
    const retailerNameMap = new Map(
      retailers.map((r: any) => [
        (r._id as ObjectId).toString(),
        (r.companyName || r.fullName || 'Retailer').trim() || 'Retailer',
      ])
    );

    type Row = {
      productId: string;
      sellerType: 'vendor' | 'retailer';
      sellerId: string;
      sellerName: string;
      productName: string;
      category: string;
      productType: string;
      price: number;
      isOwn: boolean;
    };
    const rows: Row[] = [];

    if (sellerTypeFilter !== 'retailer') {
      for (const p of vendorProducts as any[]) {
        const categoryId = p.category ? (p.category instanceof ObjectId ? p.category.toString() : String(p.category)) : '';
        const categoryName = categoryId ? categoryIdToName.get(categoryId) || '' : '';
        if (categoryFilter && categoryName.toLowerCase() !== categoryFilter.toLowerCase()) continue;
        if (productTypeFilter && (p.product_type || '').toLowerCase() !== productTypeFilter.toLowerCase()) continue;
        const vendorIdStr = p.vendorId ? (p.vendorId instanceof ObjectId ? p.vendorId.toString() : String(p.vendorId)) : '';
        const vendorPriceData = formatProductPrice(p);
        const vendorPrice = Number(vendorPriceData.displayPrice) || Number(vendorPriceData.sellingPrice) || 0;
        rows.push({
          productId: (p._id as ObjectId).toString(),
          sellerType: 'vendor',
          sellerId: vendorIdStr,
          sellerName: vendorNameMap.get(vendorIdStr) || 'Vendor',
          productName: p.name || '',
          category: categoryName,
          productType: p.product_type || '',
          price: vendorPrice,
          isOwn: isAdminOrVendorUser && adminUser?.role === 'vendor' && vendorIdStr === currentUserId,
        });
      }
    }

    if (sellerTypeFilter !== 'vendor') {
      for (const p of retailerProducts as any[]) {
      const categoryName = (p.category || '').trim();
      if (categoryFilter && categoryName.toLowerCase() !== categoryFilter.toLowerCase()) continue;
      if (productTypeFilter && (p.product_type || '').toLowerCase() !== productTypeFilter.toLowerCase()) continue;
      const retailerIdStr = p.retailerId
        ? (p.retailerId instanceof ObjectId ? p.retailerId.toString() : String(p.retailerId))
        : '';
      const sellerName = (p.shopName || retailerNameMap.get(retailerIdStr) || 'Retailer').trim() || 'Retailer';
      rows.push({
        productId: (p._id as ObjectId).toString(),
        sellerType: 'retailer',
        sellerId: retailerIdStr,
        sellerName,
        productName: p.name || '',
        category: categoryName,
        productType: p.product_type || '',
        price: typeof p.sellingPrice === 'number' ? p.sellingPrice : 0,
        isOwn: isRetailer && retailerIdStr === currentUserId,
      });
      }
    }

    rows.sort((a, b) => {
      const cat = (a.category || '').localeCompare(b.category || '');
      if (cat !== 0) return cat;
      const type = (a.productType || '').localeCompare(b.productType || '');
      if (type !== 0) return type;
      return (a.price || 0) - (b.price || 0);
    });

    const allCategories = new Set<string>();
    const allProductTypes = new Set<string>();
    for (const p of vendorProducts as any[]) {
      const categoryId = p.category ? (p.category instanceof ObjectId ? p.category.toString() : String(p.category)) : '';
      const categoryName = categoryId ? categoryIdToName.get(categoryId) || '' : '';
      if (categoryName) allCategories.add(categoryName);
      if (p.product_type) allProductTypes.add(String(p.product_type).trim());
    }
    for (const p of retailerProducts as any[]) {
      const categoryName = (p.category || '').trim();
      if (categoryName) allCategories.add(categoryName);
      if (p.product_type) allProductTypes.add(String(p.product_type).trim());
    }
    const categoriesList = [...allCategories].sort();
    const productTypesList = [...allProductTypes].sort();

    return NextResponse.json({
      products: rows,
      categories: categoriesList,
      productTypes: productTypesList,
    });
  } catch (e) {
    console.error('[Price Compare] Error:', e);
    return NextResponse.json({ error: 'Failed to load comparison data' }, { status: 500 });
  }
}
