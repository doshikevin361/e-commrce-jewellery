import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const purities = await db
      .collection("purities")
      .find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      purities: purities.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
      total: purities.length,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch purities:", error);
    return NextResponse.json(
      { error: "Failed to fetch purities" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();

    const newPurity = {
      name: body.name,
      status: body.status || "active",
      displayOrder: body.displayOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("purities").insertOne(newPurity);

    return NextResponse.json(
      {
        ...newPurity,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Failed to create purity:", error);
    return NextResponse.json(
      { error: "Failed to create purity" },
      { status: 500 }
    );
  }
}

