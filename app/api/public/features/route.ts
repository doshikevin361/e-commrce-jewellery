import { NextResponse } from "next/server";
import { getActiveHomepageFeatures } from "@/lib/constants/features";

export async function GET() {
  try {
    const features = getActiveHomepageFeatures();
    return NextResponse.json({
      features,
      total: features.length,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}
