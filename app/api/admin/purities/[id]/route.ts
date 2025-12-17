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

    const purity = await db.collection("purities").findOne({
      _id: new ObjectId(id),
    });

    if (!purity) {
      return NextResponse.json(
        { error: "Purity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...purity,
      _id: purity._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to fetch purity:", error);
    return NextResponse.json(
      { error: "Failed to fetch purity" },
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

    const result = await db.collection("purities").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Purity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result,
      _id: result._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to update purity:", error);
    return NextResponse.json(
      { error: "Failed to update purity" },
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

    const result = await db.collection("purities").findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Purity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Purity deleted successfully" });
  } catch (error) {
    console.error("[v0] Failed to delete purity:", error);
    return NextResponse.json(
      { error: "Failed to delete purity" },
      { status: 500 }
    );
  }
}

