import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { formatProductPrice } from "@/lib/utils/price-calculator";

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const productType = searchParams.get("productType");
    const gender = searchParams.get("gender");

    // Build query for featured product
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
    
    if (gender && gender !== "all") {
      // Gender can be an array or a string
      query.$or = [
        { gender: gender },
        { gender: { $in: [gender] } },
        { gender: { $elemMatch: { $eq: gender } } }
      ];
    }

    // Fetch one featured product, prioritizing featured products
    const product = await db
      .collection("products")
      .find(query)
      .sort({ featured: -1, createdAt: -1 })
      .limit(1)
      .project({
        _id: 1,
        name: 1,
        mainImage: 1,
        urlSlug: 1,
        sellingPrice: 1,
        regularPrice: 1,
        mrp: 1,
        category: 1,
        subcategory: 1,
        product_type: 1,
        gender: 1,
        price: 1,
        subTotal: 1,
        totalAmount: 1,
        livePriceEnabled: 1,
        metalCost: 1,
        makingChargeAmount: 1,
        gstAmount: 1,
      })
      .toArray();

    if (product.length === 0) {
      return NextResponse.json({ product: null });
    }

    const featuredProduct = product[0];
    const priceData = formatProductPrice(featuredProduct);

    return NextResponse.json({
      product: {
        ...featuredProduct,
        _id: featuredProduct._id.toString(),
        displayPrice: priceData.displayPrice,
        originalPrice: priceData.originalPrice,
        sellingPrice: priceData.sellingPrice,
        regularPrice: priceData.regularPrice,
        mrp: priceData.mrp,
        hasDiscount: priceData.hasDiscount,
        discountPercent: priceData.discountPercent,
      }
    });
  } catch (error) {
    console.error("[v0] Failed to fetch featured product:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured product" },
      { status: 500 }
    );
  }
}

