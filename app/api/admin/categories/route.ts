import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUserFromRequest, isAdmin, isAdminOrVendor } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user || !isAdminOrVendor(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    if (featured && featured !== "all") {
      filter.featured = featured === "true";
    }

    const categories = await db
      .collection("categories")
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "category",
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
            products: 0,
          },
        },
        { $sort: { createdAt: -1, _id: -1 } },
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
    console.error("[v0] Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();

    const newCategory = {
      ...body,
      parentId: body.parentId === "none" ? "" : body.parentId || null,
      focusKeywords: Array.isArray(body.focusKeywords)
        ? body.focusKeywords
        : [],
      occasions: Array.isArray(body.occasions)
        ? body.occasions
        : [],
      megaMenuProductId: body.megaMenuProductId || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("categories").insertOne(newCategory);

    return NextResponse.json(
      {
        ...newCategory,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Failed to create category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
