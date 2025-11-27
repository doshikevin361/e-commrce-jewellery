import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch only active/published categories for public use
    const categories = await db
      .collection("categories")
      .aggregate([
        { 
          $match: { 
            status: "active" // Only show active categories on homepage
          } 
        },
        {
          $lookup: {
            from: "products",
            localField: "name", // Match category name with product category
            foreignField: "category",
            pipeline: [
              { $match: { status: "active" } }, // Only count active products
            ],
            as: "products",
          },
        },
        {
          $addFields: {
            productCount: { $size: "$products" },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            description: 1,
            image: 1,
            icon: 1,
            featured: 1,
            productCount: 1,
            createdAt: 1,
          },
        },
        { $sort: { featured: -1, createdAt: -1 } }, // Featured first, then newest
        { $limit: 20 }, // Limit for homepage performance
      ])
      .toArray();

    return NextResponse.json({
      categories: categories.map((cat) => ({
        ...cat,
        _id: cat._id.toString(),
      })),
      total: categories.length,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch public categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
