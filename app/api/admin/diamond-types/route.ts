import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
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

    const diamondTypes = await db
      .collection("diamond_types")
      .find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      diamondTypes: diamondTypes.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
      total: diamondTypes.length,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch diamond types:", error);
    return NextResponse.json(
      { error: "Failed to fetch diamond types" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const newDiamondType = {
      name: body.name,
      status: body.status || "active",
      displayOrder: body.displayOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("diamond_types").insertOne(newDiamondType);

    return NextResponse.json(
      {
        ...newDiamondType,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Failed to create diamond type:", error);
    return NextResponse.json(
      { error: "Failed to create diamond type" },
      { status: 500 }
    );
  }
}


