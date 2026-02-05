import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const filter: any = {};
    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }
    if (status && status !== "all") {
      filter.status = status;
    }

    const subscribers = await db
      .collection("newsletter_subscribers")
      .find(filter)
      .sort({ subscribedAt: -1 })
      .toArray();

    return NextResponse.json({
      subscribers: subscribers.map((sub) => ({
        ...sub,
        _id: sub._id.toString(),
        subscribedAt: sub.subscribedAt ? new Date(sub.subscribedAt).toISOString() : null,
        createdAt: sub.createdAt ? new Date(sub.createdAt).toISOString() : null,
        updatedAt: sub.updatedAt ? new Date(sub.updatedAt).toISOString() : null,
      })),
      total: subscribers.length,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch newsletter subscribers:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletter subscribers" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Subscriber ID is required" }, { status: 400 });
    }

    const { ObjectId } = await import('mongodb');
    const result = await db.collection("newsletter_subscribers").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subscriber deleted successfully" });
  } catch (error) {
    console.error("[v0] Failed to delete newsletter subscriber:", error);
    return NextResponse.json(
      { error: "Failed to delete newsletter subscriber" },
      { status: 500 }
    );
  }
}
