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

    const certifiedLabs = await db
      .collection("certified_labs")
      .find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      certifiedLabs: certifiedLabs.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
      total: certifiedLabs.length,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch certified labs:", error);
    return NextResponse.json(
      { error: "Failed to fetch certified labs" },
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

    const newCertifiedLab = {
      name: body.name,
      status: body.status || "active",
      displayOrder: body.displayOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("certified_labs").insertOne(newCertifiedLab);

    return NextResponse.json(
      {
        ...newCertifiedLab,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Failed to create certified lab:", error);
    return NextResponse.json(
      { error: "Failed to create certified lab" },
      { status: 500 }
    );
  }
}

