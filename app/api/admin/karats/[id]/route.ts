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

    const karat = await db.collection("karats").findOne({
      _id: new ObjectId(id),
    });

    if (!karat) {
      return NextResponse.json(
        { error: "Karat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...karat,
      _id: karat._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to fetch karat:", error);
    return NextResponse.json(
      { error: "Failed to fetch karat" },
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

    const result = await db.collection("karats").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Karat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result,
      _id: result._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to update karat:", error);
    return NextResponse.json(
      { error: "Failed to update karat" },
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

    const result = await db.collection("karats").findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Karat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Karat deleted successfully" });
  } catch (error) {
    console.error("[v0] Failed to delete karat:", error);
    return NextResponse.json(
      { error: "Failed to delete karat" },
      { status: 500 }
    );
  }
}

