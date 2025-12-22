import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    const gemstoneName = await db.collection("gemstone_names").findOne({
      _id: new ObjectId(id),
    });

    if (!gemstoneName) {
      return NextResponse.json(
        { error: "Gemstone name not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...gemstoneName,
      _id: gemstoneName._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to fetch gemstone name:", error);
    return NextResponse.json(
      { error: "Failed to fetch gemstone name" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { db } = await connectToDatabase();
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Gemstone name is required" },
        { status: 400 }
      );
    }

    // Check if another gemstone name with the same name exists
    const existing = await db.collection("gemstone_names").findOne({ 
      name: new RegExp(`^${body.name.trim()}$`, 'i'),
      _id: { $ne: new ObjectId(id) }
    });
    if (existing) {
      return NextResponse.json(
        { error: "Gemstone name already exists" },
        { status: 400 }
      );
    }

    const updateData = {
      name: body.name.trim(),
      status: body.status,
      displayOrder: body.displayOrder,
      updatedAt: new Date(),
    };

    const result = await db.collection("gemstone_names").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Gemstone name not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result,
      _id: result._id.toString(),
    });
  } catch (error) {
    console.error("[v0] Failed to update gemstone name:", error);
    return NextResponse.json(
      { error: "Failed to update gemstone name" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { db } = await connectToDatabase();

    const result = await db.collection("gemstone_names").findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Gemstone name not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Gemstone name deleted successfully" });
  } catch (error) {
    console.error("[v0] Failed to delete gemstone name:", error);
    return NextResponse.json(
      { error: "Failed to delete gemstone name" },
      { status: 500 }
    );
  }
}

