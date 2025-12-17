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

    const diamondType = await db.collection("diamond_types").findOne({
      _id: new ObjectId(id),
    });

    if (!diamondType) {
      return NextResponse.json(
        { error: "Diamond type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...diamondType,
      _id: diamondType._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to fetch diamond type:", error);
    return NextResponse.json(
      { error: "Failed to fetch diamond type" },
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

    const result = await db.collection("diamond_types").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Diamond type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result,
      _id: result._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to update diamond type:", error);
    return NextResponse.json(
      { error: "Failed to update diamond type" },
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

    const result = await db.collection("diamond_types").findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Diamond type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Diamond type deleted successfully" });
  } catch (error) {
    console.error("[v0] Failed to delete diamond type:", error);
    return NextResponse.json(
      { error: "Failed to delete diamond type" },
      { status: 500 }
    );
  }
}


