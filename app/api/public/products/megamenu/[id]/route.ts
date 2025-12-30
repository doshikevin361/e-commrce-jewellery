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

    // Fetch product by ID without status check (for megaMenu display)
    const product = await db.collection("products").findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          _id: 1,
          name: 1,
          mainImage: 1,
          urlSlug: 1,
          shortDescription: 1,
          status: 1,
        },
      }
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: product._id.toString(),
      name: product.name,
      mainImage: product.mainImage,
      urlSlug: product.urlSlug || product._id.toString(),
      shortDescription: product.shortDescription,
      status: product.status,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch megaMenu product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}




