import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { formatProductPrice } from "@/lib/utils/price-calculator";
import { findRetailerCommissionFromRows, getCustomerPriceFromRetailer } from "@/lib/retailer-commission";

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const trending = searchParams.get("trending");
    const limit = parseInt(searchParams.get("limit") || "12");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build query for public products
    const query: any = { 
      status: "active", // Only show active products
      stock: { $gt: 0 } // Only show products in stock
    };
    
    if (category && category !== "all") {
      query.category = category;
    }
    
    if (featured === "true") {
      query.featured = true;
    }
    
    if (trending === "true") {
      query.trending = true;
    }

    // Fetch products with proper sorting
    let sortQuery: any = { createdAt: -1 }; // Default: newest first
    
    if (featured === "true") {
      sortQuery = { featured: -1, createdAt: -1 }; // Featured first
    } else if (trending === "true") {
      sortQuery = { trending: -1, views: -1, createdAt: -1 }; // Trending by views
    }

    const products = await db
      .collection("products")
      .find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .project({
        // Only return necessary fields for homepage performance
        name: 1,
        shortDescription: 1,
        category: 1,
        brand: 1,
        mainImage: 1,
        regularPrice: 1,
        sellingPrice: 1,
        mrp: 1,
        discount: 1,
        rating: 1,
        reviewCount: 1,
        stock: 1,
        featured: 1,
        trending: 1,
        tags: 1,
        createdAt: 1,
        views: 1,
        urlSlug: 1,
        // Jewelry specific fields for pricing display
        metalType: 1,
        metalPurity: 1,
        livePriceEnabled: 1,
        metalCost: 1,
        makingChargeAmount: 1,
        gstAmount: 1,
        price: 1,
        subTotal: 1,
        totalAmount: 1,
      })
      .toArray();

    // Get total count for pagination
    const total = await db.collection("products").countDocuments(query);

    const normalizeCategoryId = (value: any) => {
      if (!value) return null;
      if (value instanceof ObjectId) return value.toString();
      if (typeof value === "string") return value;
      if (typeof value === "object" && value._id) return value._id.toString();
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
          .collection("categories")
          .find({ _id: { $in: categoryIds.map(id => new ObjectId(id)) } })
          .project({ name: 1 })
          .toArray()
      : [];

    const categoryMap = new Map(categories.map(category => [category._id.toString(), category.name]));

    // Fetch active retailer products and merge into same listing (no separate section)
    const retailerQuery = {
      $or: [
        { status: "active" },
        { status: { $regex: /^active$/i } },
        { status: { $exists: false } },
        { status: null },
      ],
    };
    const retailerProducts = await db
      .collection("retailer_products")
      .find(retailerQuery)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();

    // Resolve retailer commission: customer price = sellingPrice + (sellingPrice * retailerCommission%)
    const sourceIds = [...new Set((retailerProducts as any[]).map((rp) => rp.sourceProductId).filter(Boolean))].map((id) => (id instanceof ObjectId ? id : new ObjectId(String(id))));
    const retailerIds = [...new Set((retailerProducts as any[]).map((rp) => rp.retailerId).filter(Boolean))].map((id) => (id instanceof ObjectId ? id : new ObjectId(String(id))));
    const [sourceProducts, retailerDocs] = await Promise.all([
      sourceIds.length > 0 ? db.collection("products").find({ _id: { $in: sourceIds } }).project({ _id: 1, product_type: 1, category: 1, designType: 1, goldPurity: 1, silverPurity: 1 }).toArray() : [],
      retailerIds.length > 0 ? db.collection("retailers").find({ _id: { $in: retailerIds } }).project({ _id: 1, retailerCommissionRows: 1 }).toArray() : [],
    ]);
    const sourceMap = new Map(sourceProducts.map((p: any) => [p._id.toString(), p]));
    const retailerMap = new Map(retailerDocs.map((r: any) => [r._id.toString(), r]));
    const allCatIds = [...new Set(sourceProducts.map((p: any) => normalizeCategoryId(p.category)).filter(Boolean))].filter((id): id is string => !!id && ObjectId.isValid(id));
    const catDocs = allCatIds.length > 0 ? await db.collection("categories").find({ _id: { $in: allCatIds.map((id) => new ObjectId(id)) } }).project({ _id: 1, name: 1 }).toArray() : [];
    const catNameMap = new Map(catDocs.map((c: any) => [c._id.toString(), c.name]));

    const retailerList = (retailerProducts as any[]).map((rp) => {
      const sellingPrice = Number(rp.sellingPrice) || 0;
      let commissionPct = typeof rp.retailerCommissionRate === "number" && Number.isFinite(rp.retailerCommissionRate) ? rp.retailerCommissionRate : NaN;
      if (Number.isNaN(commissionPct)) {
        const source = rp.sourceProductId ? sourceMap.get((rp.sourceProductId instanceof ObjectId ? rp.sourceProductId : new ObjectId(String(rp.sourceProductId))).toString()) : null;
        const retailer = rp.retailerId ? retailerMap.get((rp.retailerId instanceof ObjectId ? rp.retailerId : new ObjectId(String(rp.retailerId))).toString()) : null;
        const rows = Array.isArray((retailer as any)?.retailerCommissionRows) ? (retailer as any).retailerCommissionRows : [];
        const productType = (source?.product_type || rp.product_type || "").trim();
        const categoryId = source?.category ? normalizeCategoryId(source.category) : null;
        const categoryName = categoryId ? (catNameMap.get(categoryId) || "") : (rp.category || "").trim();
        const designType = (source?.designType || rp.designType || "").trim();
        const metal = productType === "Gold" || productType === "Silver" || productType === "Platinum" ? productType : "";
        const purity = (source?.goldPurity || source?.silverPurity || rp.goldPurity || rp.silverPurity || "").trim();
        commissionPct = findRetailerCommissionFromRows(rows, productType, categoryName, designType, metal, purity);
      }
      const customerPrice = getCustomerPriceFromRetailer(sellingPrice, commissionPct);
      return {
        _id: (rp._id as ObjectId).toString(),
        name: rp.name,
        mainImage: rp.mainImage || null,
        category: rp.shopName ? `Sold by ${rp.shopName}` : "Partner Store",
        displayPrice: customerPrice,
        originalPrice: sellingPrice,
        sellingPrice: customerPrice,
        regularPrice: customerPrice,
        stock: rp.quantity ?? 0,
        urlSlug: (rp._id as ObjectId).toString(),
        sellerType: "retailer",
        retailerId: (rp.retailerId as ObjectId)?.toString(),
      };
    });

    const mergedProducts = [
      ...products.map((product) => {
        const priceData = formatProductPrice(product);
        const categoryId = normalizeCategoryId(product.category);
        const categoryName = categoryId ? categoryMap.get(categoryId) : null;
        return {
          ...product,
          _id: product._id.toString(),
          category: categoryName ? categoryName : product.category,
          displayPrice: priceData.displayPrice,
          originalPrice: priceData.originalPrice,
          sellingPrice: priceData.sellingPrice,
          regularPrice: priceData.regularPrice,
          mrp: priceData.mrp,
          hasDiscount: priceData.hasDiscount,
          discountPercent: priceData.discountPercent,
          sellerType: "vendor",
        };
      }),
      ...retailerList,
    ];

    return NextResponse.json({
      products: mergedProducts,
      pagination: {
        total: total + retailerList.length,
        page,
        limit,
        pages: Math.ceil((total + retailerList.length) / limit),
      },
    });
  } catch (error) {
    console.error("[v0] Failed to fetch public products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
