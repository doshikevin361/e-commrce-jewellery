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

    const settingTypes = await db
      .collection("setting_types")
      .find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      settingTypes: settingTypes.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
      total: settingTypes.length,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch setting types:", error);
    return NextResponse.json(
      { error: "Failed to fetch setting types" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const newSettingType = {
      name: body.name,
      status: body.status || "active",
      displayOrder: body.displayOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("setting_types").insertOne(newSettingType);

    return NextResponse.json(
      {
        ...newSettingType,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Failed to create setting type:", error);
    return NextResponse.json(
      { error: "Failed to create setting type" },
      { status: 500 }
    );
  }
}

