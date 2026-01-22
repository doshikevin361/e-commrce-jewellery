import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { formatProductPrice } from "@/lib/utils/price-calculator";

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

    return NextResponse.json({
      products: products.map((product) => {
        const priceData = formatProductPrice(product);
        const categoryId = normalizeCategoryId(product.category);
        const categoryName = categoryId ? categoryMap.get(categoryId) : null;

        return {
          ...product,
          _id: product._id.toString(),
          category: categoryName ? categoryName : product.category,
          // Format price display using calculated prices
          displayPrice: priceData.displayPrice,
          originalPrice: priceData.originalPrice,
          sellingPrice: priceData.sellingPrice,
          regularPrice: priceData.regularPrice,
          mrp: priceData.mrp,
          hasDiscount: priceData.hasDiscount,
          discountPercent: priceData.discountPercent,
        };
      }),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
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
