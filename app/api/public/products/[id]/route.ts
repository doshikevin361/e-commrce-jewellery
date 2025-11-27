import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Fetch product details for public view
    const product = await db.collection("products").findOne({
      _id: new ObjectId(id),
      status: "active", // Only show active products
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Increment view count for trending calculation
    await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );

    // Fetch related products from same category
    const relatedProducts = await db
      .collection("products")
      .find({
        category: product.category,
        _id: { $ne: new ObjectId(id) },
        status: "active",
        stock: { $gt: 0 },
      })
      .limit(8)
      .project({
        name: 1,
        shortDescription: 1,
        mainImage: 1,
        sellingPrice: 1,
        regularPrice: 1,
        mrp: 1,
        rating: 1,
        reviewCount: 1,
      })
      .toArray();

    const productData = {
      ...product,
      _id: product._id.toString(),
      // Ensure arrays are properly formatted
      tags: Array.isArray(product.tags) ? product.tags : [],
      galleryImages: Array.isArray(product.galleryImages) ? product.galleryImages : [],
      variants: Array.isArray(product.variants) ? product.variants.map((v: any) => ({
        ...v,
        options: Array.isArray(v.options) ? v.options : []
      })) : [],
      // Format pricing
      displayPrice: product.sellingPrice || product.regularPrice || 0,
      originalPrice: product.mrp || product.regularPrice || 0,
      hasDiscount: (product.mrp || product.regularPrice) > (product.sellingPrice || product.regularPrice),
      discountPercent: product.discount || 0,
      // Related products
      relatedProducts: relatedProducts.map(rp => ({
        ...rp,
        _id: rp._id.toString(),
        displayPrice: rp.sellingPrice || rp.regularPrice || 0,
        originalPrice: rp.mrp || rp.regularPrice || 0,
      })),
    };

    return NextResponse.json(productData);
  } catch (error) {
    console.error("[v0] Failed to fetch public product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
