import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch banners from admin CMS (homepage_banners collection)
    const banners = await db
      .collection("homepage_banners")
      .find({ 
        status: "active" // Only show active banners
      })
      .sort({ displayOrder: 1, createdAt: -1 }) // Sort by display order first, then newest
      .limit(10) // Limit for performance
      .toArray();

    // Transform admin banner data to match frontend interface
    const transformedBanners = banners.map((banner) => ({
      _id: banner._id.toString(),
      title: banner.title || "Default Title",
      subtitle: banner.subtitle || "Default Subtitle", 
      description: banner.description || "Default Description",
      buttonText: banner.buttonText || "Shop Now",
      image: banner.image || "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1200&q=85",
      type: banner.type || "main", // main or side
      status: banner.status,
      order: banner.displayOrder || 0,
    }));

    // If no banners found in CMS, return default fallback banners
    if (transformedBanners.length === 0) {
      const defaultBanners = [
        {
          _id: "default-1",
          title: "Where Luxury Meets Affordability",
          subtitle: "Exquisite Collection",
          description: "Handcrafted jewelry that celebrates elegance and individuality.",
          buttonText: "Shop Now",
          image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1200&q=85",
          type: "main",
          status: "active",
          order: 1,
        },
        {
          _id: "default-2", 
          title: "Flash Sale",
          subtitle: "Gold Pricing",
          description: "Special offers on selected jewelry items",
          buttonText: "See Products",
          image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1200&q=85",
          type: "side",
          status: "active", 
          order: 2,
        },
      ];

      return NextResponse.json({
        banners: defaultBanners,
        total: defaultBanners.length,
      });
    }

    return NextResponse.json({
      banners: transformedBanners,
      total: transformedBanners.length,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch public banners:", error);
    
    // Return default banners if API fails
    const defaultBanners = [
      {
        _id: "default-1",
        title: "Where Luxury Meets Affordability",
        subtitle: "Exquisite Collection",
        description: "Handcrafted jewelry that celebrates elegance and individuality.",
        buttonText: "Shop Now",
        image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1200&q=85",
        type: "main",
        status: "active",
        order: 1,
      },
      {
        _id: "default-2", 
        title: "Flash Sale",
        subtitle: "Gold Pricing", 
        description: "Special offers on selected jewelry items",
        buttonText: "See Products",
        image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1200&q=85",
        type: "side",
        status: "active",
        order: 2,
      },
    ];

    return NextResponse.json({
      banners: defaultBanners,
      total: defaultBanners.length,
    });
  }
}
