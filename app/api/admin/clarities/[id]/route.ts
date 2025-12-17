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

    const clarity = await db.collection("clarities").findOne({
      _id: new ObjectId(id),
    });

    if (!clarity) {
      return NextResponse.json(
        { error: "Clarity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...clarity,
      _id: clarity._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to fetch clarity:", error);
    return NextResponse.json(
      { error: "Failed to fetch clarity" },
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

    const result = await db.collection("clarities").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Clarity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result,
      _id: result._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to update clarity:", error);
    return NextResponse.json(
      { error: "Failed to update clarity" },
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

    const result = await db.collection("clarities").findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Clarity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Clarity deleted successfully" });
  } catch (error) {
    console.error("[v0] Failed to delete clarity:", error);
    return NextResponse.json(
      { error: "Failed to delete clarity" },
      { status: 500 }
    );
  }
}

