import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch only active/published categories for public use
    const allCategories = await db
      .collection("categories")
      .aggregate([
        { 
          $match: { 
            status: "active" // Only show active categories on homepage
          } 
        },
        {
          $lookup: {
            from: "products",
            localField: "name", // Match category name with product category
            foreignField: "category",
            pipeline: [
              { $match: { status: "active" } }, // Only count active products
            ],
            as: "products",
          },
        },
        {
          $addFields: {
            productCount: { $size: "$products" },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            description: 1,
            image: 1,
            icon: 1,
            featured: 1,
            productCount: 1,
            parentId: 1,
            displayOrder: 1,
            position: 1,
            createdAt: 1,
          },
        },
        { $sort: { displayOrder: 1, featured: -1, createdAt: -1 } }, // Sort by displayOrder, then featured, then newest
      ])
      .toArray();

    // Convert to array with string IDs
    const categoriesWithStringIds = allCategories.map((cat) => ({
      ...cat,
      _id: cat._id.toString(),
      parentId: cat.parentId ? cat.parentId.toString() : null,
    }));

    // Build tree structure
    const categoryMap = new Map<string, any>();
    const rootCategories: any[] = [];

    // First pass: create map
    categoriesWithStringIds.forEach((cat: any) => {
      categoryMap.set(cat._id, {
        ...cat,
        children: [],
      });
    });

    // Second pass: build tree
    categoryMap.forEach((category) => {
      if (!category.parentId) {
        rootCategories.push(category);
      } else {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(category);
        } else {
          // Parent not found or inactive, treat as root
          rootCategories.push(category);
        }
      }
    });

    // Sort children within each category
    const sortCategories = (cats: any[]) => {
      return cats.sort((a, b) => {
        // Use position for subcategories, displayOrder for categories
        const aOrder = a.position !== undefined ? a.position : a.displayOrder;
        const bOrder = b.position !== undefined ? b.position : b.displayOrder;
        
        if (aOrder !== bOrder) {
          return (aOrder || 999) - (bOrder || 999);
        }
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    };

    rootCategories.forEach((cat) => {
      if (cat.children && cat.children.length > 0) {
        cat.children = sortCategories(cat.children);
      }
    });

    return NextResponse.json({
      categories: sortCategories(rootCategories),
      total: rootCategories.length,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch public categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
