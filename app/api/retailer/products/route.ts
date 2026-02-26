import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { formatProductPrice } from '@/lib/utils/price-calculator';

/** Product types for jewellery (filter) */
const PRODUCT_TYPES = ['Gold', 'Silver', 'Platinum', 'Diamonds', 'Gemstone', 'Imitation'];

export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const type = searchParams.get('type'); // product_type
    const subcategory = searchParams.get('subcategory');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 100);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      status: 'active',
    };

    if (category && category !== 'all') {
      if (ObjectId.isValid(category)) {
        query.$or = [
          { category: new ObjectId(category) },
          { category: category },
        ];
      } else {
        query.category = category;
      }
    }

    if (type && type !== 'all' && PRODUCT_TYPES.includes(type)) {
      query.product_type = type;
    }

    if (subcategory && subcategory !== 'all') {
      query.subcategory = subcategory;
    }

    if (brand && brand !== 'all') {
      query.brand = new RegExp(brand, 'i');
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      query.$and = query.$and || [];
      (query.$and as object[]).push({
        $or: [
          { name: searchRegex },
          { shortDescription: searchRegex },
          { sku: searchRegex },
          { brand: searchRegex },
          { tags: searchRegex },
        ],
      });
    }

    const sort: Record<string, 1 | -1> = { createdAt: -1 };

    const products = await db
      .collection('products')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .project({
        name: 1,
        shortDescription: 1,
        category: 1,
        subcategory: 1,
        brand: 1,
        mainImage: 1,
        galleryImages: 1,
        regularPrice: 1,
        sellingPrice: 1,
        mrp: 1,
        discount: 1,
        stock: 1,
        sku: 1,
        product_type: 1,
        tags: 1,
        urlSlug: 1,
        metalType: 1,
        metalPurity: 1,
        livePriceEnabled: 1,
        metalCost: 1,
        makingChargeAmount: 1,
        gstAmount: 1,
        price: 1,
        subTotal: 1,
        totalAmount: 1,
        status: 1,
        createdAt: 1,
        vendorId: 1,
        designType: 1,
        goldPurity: 1,
        silverPurity: 1,
      })
      .toArray();

    const total = await db.collection('products').countDocuments(query);

    const vendorIds = Array.from(
      new Set(
        products
          .map((p) => (p as { vendorId?: string | ObjectId }).vendorId)
          .filter((id): id is string | ObjectId => id != null && (typeof id === 'string' ? ObjectId.isValid(id) : id instanceof ObjectId))
          .map((id) => (typeof id === 'string' ? id : (id as ObjectId).toString()))
      )
    );

    const vendorsList =
      vendorIds.length > 0
        ? await db
            .collection('vendors')
            .find({ _id: { $in: vendorIds.map((id) => new ObjectId(id)) } })
            .project({ _id: 1, b2bProductTypeCommissions: 1, b2bCommissionRows: 1 })
            .toArray()
        : [];

    const vendorMap = new Map(
      vendorsList.map((v) => [v._id.toString(), v as { _id: ObjectId; b2bProductTypeCommissions?: Record<string, number>; b2bCommissionRows?: Array<{ productType: string; category: string; designType: string; metal: string; purityKarat: string; vendorCommission: number }> }])
    );

    function getRetailerCommissionPercent(
      vendor: { b2bProductTypeCommissions?: Record<string, number>; b2bCommissionRows?: Array<{ productType: string; category: string; designType: string; metal: string; purityKarat: string; vendorCommission: number }> } | null,
      product: { product_type?: string; category?: unknown; designType?: string; goldPurity?: string; silverPurity?: string },
      categoryName: string | null
    ): number {
      if (!vendor) return 0;
      const productType = (product.product_type || '').trim();
      const ptCommissions = vendor.b2bProductTypeCommissions;
      const rows = vendor.b2bCommissionRows;
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
            return Math.max(0, Math.min(100, row.vendorCommission));
          }
        }
      }
      if (ptCommissions && productType && typeof ptCommissions[productType] === 'number') {
        return Math.max(0, Math.min(100, ptCommissions[productType]));
      }
      return 0;
    }

    const normalizeCategoryId = (value: unknown): string | null => {
      if (!value) return null;
      if (value instanceof ObjectId) return value.toString();
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && value !== null && '_id' in value) return (value as { _id: ObjectId })._id.toString();
      return null;
    };

    const categoryIds = Array.from(
      new Set(
        products
          .map((p) => normalizeCategoryId(p.category))
          .filter((id): id is string => !!id && ObjectId.isValid(id))
      )
    );

    const categories =
      categoryIds.length > 0
        ? await db
            .collection('categories')
            .find({ _id: { $in: categoryIds.map((id) => new ObjectId(id)) } })
            .project({ name: 1 })
            .toArray()
        : [];

    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c.name]));

    const list = products.map((product) => {
      const priceData = formatProductPrice(product);
      const categoryId = normalizeCategoryId(product.category);
      const categoryName = categoryId ? categoryMap.get(categoryId) : null;
      const rawProduct = product as Record<string, unknown> & {
        vendorId?: string | ObjectId;
        product_type?: string;
        designType?: string;
        goldPurity?: string;
        silverPurity?: string;
      };
      const vendorIdStr =
        rawProduct.vendorId == null
          ? null
          : typeof rawProduct.vendorId === 'string'
            ? rawProduct.vendorId
            : (rawProduct.vendorId as ObjectId).toString();
      const vendor = vendorIdStr ? vendorMap.get(vendorIdStr) : null;
      const retailerCommissionPercent = getRetailerCommissionPercent(
        vendor ?? null,
        {
          product_type: rawProduct.product_type,
          category: product.category,
          designType: rawProduct.designType,
          goldPurity: rawProduct.goldPurity,
          silverPurity: rawProduct.silverPurity,
        },
        categoryName ?? null
      );
      const basePrice = Number(priceData.displayPrice) || Number(priceData.sellingPrice) || Number(priceData.regularPrice) || 0;
      const retailerPrice =
        retailerCommissionPercent > 0 && basePrice > 0
          ? Math.round(basePrice * (1 - retailerCommissionPercent / 100))
          : basePrice;

      const { vendor: _v, vendorId: _vid, ...rest } = rawProduct;
      return {
        ...rest,
        _id: (product as { _id?: ObjectId })._id?.toString(),
        categoryName: categoryName ?? categoryId ?? product.category,
        categoryId: categoryId || (product.category as string),
        originalPrice: priceData.originalPrice,
        sellingPrice: priceData.sellingPrice,
        regularPrice: priceData.regularPrice,
        mrp: priceData.mrp,
        hasDiscount: priceData.hasDiscount,
        discountPercent: priceData.discountPercent,
        retailerDiscountPercent: retailerCommissionPercent,
        retailerPrice,
        displayPrice: retailerPrice,
      };
    });

    return NextResponse.json({
      products: list,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
      productTypes: PRODUCT_TYPES,
    });
  } catch (error) {
    console.error('[Retailer Products] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
