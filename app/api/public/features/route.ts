import { NextResponse } from "next/server";

export async function GET() {
  try {
    // For now, return default features
    // In future, this can be made dynamic from database
    const features = [
      {
        _id: "feature-1",
        icon: "Truck",
        title: "Free Shipping",
        description: "Free shipping on orders over ₹2,000",
        status: "active",
        order: 1,
      },
      {
        _id: "feature-2", 
        icon: "Shield",
        title: "Secure Payment",
        description: "100% secure payment processing",
        status: "active",
        order: 2,
      },
      {
        _id: "feature-3",
        icon: "Headphones", 
        title: "24/7 Support",
        description: "Round-the-clock customer service",
        status: "active",
        order: 3,
      },
      {
        _id: "feature-4",
        icon: "Award",
        title: "Quality Guarantee", 
        description: "Certified authentic jewelry only",
        status: "active",
        order: 4,
      },
    ];

    return NextResponse.json({
      features: features.filter(f => f.status === "active"),
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
