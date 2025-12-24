import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const productType = searchParams.get("productType");
    const limit = parseInt(searchParams.get("limit") || "1");

    // Build query
    const query: any = { 
      status: "active",
      stock: { $gt: 0 }
    };
    
    if (category && category !== "all") {
      query.category = category;
    }
    
    if (subcategory && subcategory !== "all") {
      query.subcategory = subcategory;
    }
    
    if (productType && productType !== "all") {
      query.product_type = productType;
    }

    // Fetch products with images
    const products = await db
      .collection("products")
      .find(query)
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit)
      .project({
        _id: 1,
        name: 1,
        mainImage: 1,
        category: 1,
        subcategory: 1,
        product_type: 1,
      })
      .toArray();

    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        _id: product._id.toString(),
      }))
    });
  } catch (error) {
    console.error("[v0] Failed to fetch menu images:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu images" },
      { status: 500 }
    );
  }
}

