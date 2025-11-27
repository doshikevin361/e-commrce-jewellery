import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

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
        // Jewelry specific fields for pricing display
        metalType: 1,
        metalPurity: 1,
        livePriceEnabled: 1,
        metalCost: 1,
        makingChargeAmount: 1,
        gstAmount: 1,
      })
      .toArray();

    // Get total count for pagination
    const total = await db.collection("products").countDocuments(query);

    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        _id: product._id.toString(),
        // Format price display
        displayPrice: product.sellingPrice || product.regularPrice || 0,
        originalPrice: product.mrp || product.regularPrice || 0,
        hasDiscount: (product.mrp || product.regularPrice) > (product.sellingPrice || product.regularPrice),
        discountPercent: product.discount || 0,
      })),
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
