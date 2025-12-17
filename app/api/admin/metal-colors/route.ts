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

    const metalColors = await db
      .collection("metal_colors")
      .find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      metalColors: metalColors.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
      total: metalColors.length,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch metal colors:", error);
    return NextResponse.json(
      { error: "Failed to fetch metal colors" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const newMetalColor = {
      name: body.name,
      status: body.status || "active",
      displayOrder: body.displayOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("metal_colors").insertOne(newMetalColor);

    return NextResponse.json(
      {
        ...newMetalColor,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Failed to create metal color:", error);
    return NextResponse.json(
      { error: "Failed to create metal color" },
      { status: 500 }
    );
  }
}

