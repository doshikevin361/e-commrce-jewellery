import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { formatProductPrice } from "@/lib/utils/price-calculator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { db } = await connectToDatabase();
    
    // Try to find product by slug first
    let product = await db.collection("products").findOne({
      urlSlug: slug,
      status: "active", // Only show active products
    });

    // If not found by slug, try to find by ID (for backward compatibility)
    if (!product && ObjectId.isValid(slug)) {
      product = await db.collection("products").findOne({
        _id: new ObjectId(slug),
        status: "active",
      });
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productId = product._id;

    // Increment view count for trending calculation
    await db.collection("products").updateOne(
      { _id: productId },
      { $inc: { views: 1 } }
    );

    // Fetch related products from same category
    const relatedProducts = await db
      .collection("products")
      .find({
        category: product.category,
        _id: { $ne: productId },
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
        urlSlug: 1,
        price: 1,
        subTotal: 1,
        totalAmount: 1,
        livePriceEnabled: 1,
        metalCost: 1,
        makingChargeAmount: 1,
        gstAmount: 1,
      })
      .toArray();

    // Calculate prices using the price calculator
    const priceData = formatProductPrice(product);

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
      // Format pricing using calculated prices
      displayPrice: priceData.displayPrice,
      originalPrice: priceData.originalPrice,
      sellingPrice: priceData.sellingPrice,
      regularPrice: priceData.regularPrice,
      mrp: priceData.mrp,
      hasDiscount: priceData.hasDiscount,
      discountPercent: priceData.discountPercent,
      // Related products
      relatedProducts: relatedProducts.map(rp => {
        const rpPriceData = formatProductPrice(rp);
        return {
          id: rp._id.toString(),
          _id: rp._id.toString(),
          title: rp.name || 'Untitled Product',
          category: product.category || 'Jewellery',
          price: `₹${rpPriceData.displayPrice.toLocaleString()}`,
          originalPrice: rpPriceData.hasDiscount && rpPriceData.originalPrice > rpPriceData.displayPrice
            ? `₹${rpPriceData.originalPrice.toLocaleString()}` 
            : undefined,
          rating: rp.rating || 4.5,
          reviews: rp.reviewCount || 0,
          image: rp.mainImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
          displayPrice: rpPriceData.displayPrice,
          originalPriceValue: rpPriceData.originalPrice,
          urlSlug: rp.urlSlug || rp._id.toString(),
        };
      }),
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

