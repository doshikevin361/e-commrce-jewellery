import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    const settingType = await db.collection("setting_types").findOne({
      _id: new ObjectId(id),
    });

    if (!settingType) {
      return NextResponse.json(
        { error: "Setting type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...settingType,
      _id: settingType._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to fetch setting type:", error);
    return NextResponse.json(
      { error: "Failed to fetch setting type" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    const body = await request.json();

    const updateData = {
      name: body.name,
      status: body.status,
      displayOrder: body.displayOrder,
      updatedAt: new Date(),
    };

    const result = await db.collection("setting_types").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Setting type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result,
      _id: result._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to update setting type:", error);
    return NextResponse.json(
      { error: "Failed to update setting type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    const result = await db.collection("setting_types").findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Setting type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Setting type deleted successfully" });
  } catch (error) {
    console.error("[v0] Failed to delete setting type:", error);
    return NextResponse.json(
      { error: "Failed to delete setting type" },
      { status: 500 }
    );
  }
}

