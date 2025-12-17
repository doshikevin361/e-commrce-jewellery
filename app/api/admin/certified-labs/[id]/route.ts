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

    const certifiedLab = await db.collection("certified_labs").findOne({
      _id: new ObjectId(id),
    });

    if (!certifiedLab) {
      return NextResponse.json(
        { error: "Certified lab not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...certifiedLab,
      _id: certifiedLab._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to fetch certified lab:", error);
    return NextResponse.json(
      { error: "Failed to fetch certified lab" },
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

    const result = await db.collection("certified_labs").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Certified lab not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result,
      _id: result._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to update certified lab:", error);
    return NextResponse.json(
      { error: "Failed to update certified lab" },
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

    const result = await db.collection("certified_labs").findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Certified lab not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Certified lab deleted successfully" });
  } catch (error) {
    console.error("[v0] Failed to delete certified lab:", error);
    return NextResponse.json(
      { error: "Failed to delete certified lab" },
      { status: 500 }
    );
  }
}

