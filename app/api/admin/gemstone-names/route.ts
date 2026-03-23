import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUserFromRequest, isAdmin, isAdminOrVendor } from '@/lib/auth';
import { rejectIfNoAdminAccess } from '@/lib/admin-api-authorize';

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request as any);
    const deniedOr = rejectIfNoAdminAccess(request, user, 'admin-or-vendor');
    if (deniedOr) return deniedOr;

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const filter: any = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (status && status !== "all") {
      filter.status = status;
    }

    const gemstoneNames = await db
      .collection("gemstone_names")
      .find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      gemstoneNames: gemstoneNames.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
      total: gemstoneNames.length,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch gemstone names:", error);
    return NextResponse.json(
      { error: "Failed to fetch gemstone names" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request as any);
    const deniedAd = rejectIfNoAdminAccess(request, user, 'admin-only');
    if (deniedAd) return deniedAd;

    const { db } = await connectToDatabase();
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Gemstone name is required" },
        { status: 400 }
      );
    }

    // Check if gemstone name already exists
    const existing = await db.collection("gemstone_names").findOne({ 
      name: new RegExp(`^${body.name.trim()}$`, 'i') 
    });
    if (existing) {
      return NextResponse.json(
        { error: "Gemstone name already exists" },
        { status: 400 }
      );
    }

    const newGemstoneName = {
      name: body.name.trim(),
      status: body.status || "active",
      displayOrder: body.displayOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("gemstone_names").insertOne(newGemstoneName);

    return NextResponse.json(
      {
        ...newGemstoneName,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Failed to create gemstone name:", error);
    return NextResponse.json(
      { error: "Failed to create gemstone name" },
      { status: 500 }
    );
  }
}

