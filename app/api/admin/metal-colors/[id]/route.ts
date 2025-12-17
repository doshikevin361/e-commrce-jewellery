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

    const metalColor = await db.collection("metal_colors").findOne({
      _id: new ObjectId(id),
    });

    if (!metalColor) {
      return NextResponse.json(
        { error: "Metal color not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...metalColor,
      _id: metalColor._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to fetch metal color:", error);
    return NextResponse.json(
      { error: "Failed to fetch metal color" },
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

    const result = await db.collection("metal_colors").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Metal color not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result,
      _id: result._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to update metal color:", error);
    return NextResponse.json(
      { error: "Failed to update metal color" },
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

    const result = await db.collection("metal_colors").findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Metal color not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Metal color deleted successfully" });
  } catch (error) {
    console.error("[v0] Failed to delete metal color:", error);
    return NextResponse.json(
      { error: "Failed to delete metal color" },
      { status: 500 }
    );
  }
}

