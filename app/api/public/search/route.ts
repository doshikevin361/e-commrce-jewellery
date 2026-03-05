import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { formatProductPrice } from '@/lib/utils/price-calculator';
import { ObjectId } from 'mongodb';
import { findRetailerCommissionFromRows, getCustomerPriceFromRetailer } from '@/lib/retailer-commission';

function normalizeCategoryId(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof ObjectId) return value.toString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value && '_id' in value) return (value as { _id: ObjectId })._id.toString();
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    if (!query.trim()) {
      return NextResponse.json({
        keywords: [],
        categories: [],
        brands: [],
        attributes: [],
        products: [],
      });
    }

    const searchRegex = { $regex: query, $options: 'i' };

    // Fetch categories matching the query
    const categories = await db
      .collection('categories')
      .find({
        status: 'active',
        $or: [
          { name: searchRegex },
          { slug: searchRegex },
        ],
      })
      .limit(5)
      .toArray();

    // Fetch brands matching the query
    const brands = await db
      .collection('brands')
      .find({
        status: 'active',
        name: searchRegex,
      })
      .limit(5)
      .toArray();

    // Fetch attributes matching the query
    const attributes = await db
      .collection('attributes')
      .find({
        $or: [
          { name: searchRegex },
          { values: { $in: [new RegExp(query, 'i')] } },
        ],
      })
      .limit(10)
      .toArray();

    // Fetch vendor products matching the query
    const vendorProducts = await db
      .collection('products')
      .find({
        status: 'active',
        $or: [
          { name: searchRegex },
          { shortDescription: searchRegex },
          { category: searchRegex },
          { brand: searchRegex },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { metalType: searchRegex },
          { metalPurity: searchRegex },
          { stoneType: searchRegex },
        ],
      })
      .limit(6)
      .toArray();

    // Fetch retailer products matching the query (so "Boutique" etc. shows retailer listing too)
    const retailerProducts = await db
      .collection('retailer_products')
      .find({
        $and: [
          {
            $or: [
              { status: 'active' },
              { status: { $regex: /^active$/i } },
              { status: { $exists: false } },
              { status: null },
            ],
          },
          {
            $or: [
              { name: searchRegex },
              { shortDescription: searchRegex },
            ],
          },
        ],
      })
      .limit(4)
      .toArray();

    // Map vendor products
    const vendorList = vendorProducts.map((product: any) => {
      const priceData = formatProductPrice(product);
      return {
        _id: product._id.toString(),
        name: product.name,
        category: product.category,
        brand: product.brand,
        mainImage: product.mainImage,
        displayPrice: priceData.displayPrice,
        originalPrice: priceData.originalPrice,
        hasDiscount: priceData.hasDiscount,
        discountPercent: priceData.discountPercent,
        slug: product.urlSlug || product._id.toString(),
        metalType: product.metalType,
        metalPurity: product.metalPurity,
        stoneType: product.stoneType,
        sellerType: 'vendor',
      };
    });

    // Map retailer products with customer price = sellingPrice + retailer commission
    const rpSourceIds = [...new Set((retailerProducts as any[]).map((p) => p.sourceProductId).filter(Boolean))].map((id) => (id instanceof ObjectId ? id : new ObjectId(String(id))));
    const rpRetailerIds = [...new Set((retailerProducts as any[]).map((p) => p.retailerId).filter(Boolean))].map((id) => (id instanceof ObjectId ? id : new ObjectId(String(id))));
    const [rpSourceProducts, rpRetailerDocs] = await Promise.all([
      rpSourceIds.length > 0 ? db.collection('products').find({ _id: { $in: rpSourceIds } }).project({ _id: 1, product_type: 1, category: 1, designType: 1, goldPurity: 1, silverPurity: 1 }).toArray() : [],
      rpRetailerIds.length > 0 ? db.collection('retailers').find({ _id: { $in: rpRetailerIds } }).project({ _id: 1, retailerCommissionRows: 1 }).toArray() : [],
    ]);
    const rpSourceMap = new Map(rpSourceProducts.map((p: any) => [p._id.toString(), p]));
    const rpRetailerMap = new Map(rpRetailerDocs.map((r: any) => [r._id.toString(), r]));
    const rpCatIds = [...new Set(rpSourceProducts.map((p: any) => normalizeCategoryId(p.category)).filter(Boolean))].filter((id): id is string => !!id && ObjectId.isValid(id));
    const rpCatDocs = rpCatIds.length > 0 ? await db.collection('categories').find({ _id: { $in: rpCatIds.map((id) => new ObjectId(id)) } }).project({ _id: 1, name: 1 }).toArray() : [];
    const rpCatNameMap = new Map(rpCatDocs.map((c: any) => [c._id.toString(), c.name]));

    const retailerList = (retailerProducts as any[]).map((rp) => {
      const sellingPrice = Number(rp.sellingPrice) || 0;
      const source = rp.sourceProductId ? rpSourceMap.get((rp.sourceProductId instanceof ObjectId ? rp.sourceProductId : new ObjectId(String(rp.sourceProductId))).toString()) : null;
      const retailer = rp.retailerId ? rpRetailerMap.get((rp.retailerId instanceof ObjectId ? rp.retailerId : new ObjectId(String(rp.retailerId))).toString()) : null;
      const rows = Array.isArray((retailer as any)?.retailerCommissionRows) ? (retailer as any).retailerCommissionRows : [];
      const productType = (source?.product_type || '').trim();
      const categoryId = source?.category ? normalizeCategoryId(source.category) : null;
      const categoryName = categoryId ? rpCatNameMap.get(categoryId) || '' : '';
      const designType = (source?.designType || '').trim();
      const metal = productType === 'Gold' || productType === 'Silver' || productType === 'Platinum' ? productType : '';
      const purity = (source?.goldPurity || source?.silverPurity || '').trim();
      const commissionPct = findRetailerCommissionFromRows(rows, productType, categoryName, designType, metal, purity);
      const customerPrice = getCustomerPriceFromRetailer(sellingPrice, commissionPct);
      return {
        _id: (rp._id as ObjectId).toString(),
        name: rp.name,
        category: rp.shopName ? `Sold by ${rp.shopName}` : 'Partner Store',
        brand: undefined,
        mainImage: rp.mainImage || '',
        displayPrice: customerPrice,
        originalPrice: sellingPrice,
        hasDiscount: false,
        discountPercent: 0,
        slug: (rp._id as ObjectId).toString(),
        metalType: undefined,
        metalPurity: undefined,
        stoneType: undefined,
        sellerType: 'retailer',
        retailerId: (rp.retailerId as ObjectId)?.toString(),
      };
    });

    // Merge: vendor first, then retailer (so both show in search)
    const products = [...vendorList, ...retailerList].slice(0, 10);

    // Extract keywords from attributes and common jewellery terms
    const keywords: string[] = [];
    
    // Add attribute values as keywords
    attributes.forEach(attr => {
      attr.values?.forEach((value: string) => {
        if (value.toLowerCase().includes(query.toLowerCase()) && !keywords.includes(value)) {
          keywords.push(value);
        }
      });
    });

    // Add category names as keywords
    categories.forEach(cat => {
      if (!keywords.includes(cat.name)) {
        keywords.push(cat.name);
      }
    });

    // Add brand names as keywords
    brands.forEach(brand => {
      if (!keywords.includes(brand.name)) {
        keywords.push(brand.name);
      }
    });

    // Common jewellery keywords based on query
    const commonKeywords = [
      'Gold Ring', 'Diamond Necklace', 'Rose Gold', 'Platinum', '18K', '24K', 
      'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Men', 'Women', 'Bridal',
      'Engagement', 'Wedding', 'Earrings', 'Bracelets', 'Rings', 'Necklaces'
    ];

    commonKeywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(query.toLowerCase()) && !keywords.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    // Limit keywords to 8
    const limitedKeywords = keywords.slice(0, 8);

    return NextResponse.json({
      keywords: limitedKeywords,
      categories: categories.map((cat: any) => ({
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
      })),
      brands: brands.map((brand: any) => ({
        _id: brand._id.toString(),
        name: brand.name,
      })),
      attributes: attributes.map((attr: any) => ({
        _id: attr._id.toString(),
        name: attr.name,
        values: attr.values || [],
      })),
      products,
    });
  } catch (error) {
    console.error('[v0] Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

