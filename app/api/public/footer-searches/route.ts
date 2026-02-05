import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Fetch active categories with product counts for Popular Searches
    const categories = await db
      .collection("categories")
      .aggregate([
        { $match: { status: "active" } },
        {
          $lookup: {
            from: "products",
            localField: "name",
            foreignField: "category",
            pipeline: [
              { $match: { status: "active", stock: { $gt: 0 } } },
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
            name: 1,
            slug: 1,
            productCount: 1,
            products: 0,
          },
        },
        { $sort: { productCount: -1, name: 1 } },
        { $limit: 20 },
      ])
      .toArray();

    // Fetch products to get unique combinations for searches
    const products = await db
      .collection("products")
      .find({ status: "active", stock: { $gt: 0 } })
      .project({ 
        product_type: 1, 
        category: 1, 
        gender: 1 
      })
      .toArray();

    // Get unique product types (Gold, Diamonds, etc.)
    const productTypes = Array.from(
      new Set(
        products
          .map(p => p.product_type)
          .filter((type): type is string => !!type && ['Gold', 'Diamonds', 'Silver', 'Platinum', 'Gemstone', 'Imitation'].includes(type))
      )
    );

    // Get unique categories
    const uniqueCategories = Array.from(
      new Set(
        products
          .map(p => p.category)
          .filter((cat): cat is string => !!cat)
      )
    );

    // Get unique genders
    const genders = Array.from(
      new Set(
        products
          .map(p => p.gender)
          .filter((gender): gender is string => !!gender && ['Man', 'Women', 'Unisex'].includes(gender))
      )
    );

    // Fetch categories with occasions
    const categoriesWithOccasions = await db
      .collection("categories")
      .find({ 
        status: "active",
        occasions: { $exists: true, $ne: [], $type: "array" }
      })
      .project({ occasions: 1, name: 1, slug: 1 })
      .toArray();

    // Extract unique occasions from all categories
    const allOccasions: string[] = [];
    categoriesWithOccasions.forEach(cat => {
      if (Array.isArray(cat.occasions)) {
        cat.occasions.forEach((occ: any) => {
          if (occ && typeof occ === 'object' && occ.name) {
            if (!allOccasions.includes(occ.name)) {
              allOccasions.push(occ.name);
            }
          } else if (typeof occ === 'string' && !allOccasions.includes(occ)) {
            allOccasions.push(occ);
          }
        });
      }
    });

    // Build Popular Searches (top categories by product count)
    const popularSearches = categories
      .slice(0, 15)
      .map(cat => ({
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
        url: `/jewellery?category=${encodeURIComponent(cat.name)}`
      }));

    // Build Gold Jewellery searches
    const goldSearches: Array<{ name: string; url: string }> = [];
    if (productTypes.includes('Gold')) {
      goldSearches.push({ name: 'Gold Jewellery', url: '/jewellery?product_type=Gold' });
      uniqueCategories.forEach(cat => {
        goldSearches.push({ 
          name: `Gold ${cat}`, 
          url: `/jewellery?product_type=Gold&category=${encodeURIComponent(cat)}` 
        });
      });
      genders.forEach(gender => {
        if (gender === 'Women') {
          goldSearches.push({ 
            name: `Women Gold Rings`, 
            url: `/jewellery?product_type=Gold&category=Ring&gender=Women` 
          });
        } else if (gender === 'Man') {
          goldSearches.push({ 
            name: `Men's Gold Earrings`, 
            url: `/jewellery?product_type=Gold&category=Earring&gender=Man` 
          });
          goldSearches.push({ 
            name: `Gold Chains for Men`, 
            url: `/jewellery?product_type=Gold&category=Chain&gender=Man` 
          });
        }
      });
      goldSearches.push({ 
        name: 'Dailywear Gold Earrings', 
        url: '/jewellery?product_type=Gold&category=Earring' 
      });
      goldSearches.push({ 
        name: 'Dailywear Gold Bangles', 
        url: '/jewellery?product_type=Gold&category=Bangle' 
      });
    }

    // Build Diamond Jewellery searches
    const diamondSearches: Array<{ name: string; url: string }> = [];
    if (productTypes.includes('Diamonds')) {
      diamondSearches.push({ name: 'Diamond Jewellery', url: '/jewellery?product_type=Diamonds' });
      uniqueCategories.forEach(cat => {
        diamondSearches.push({ 
          name: `Diamond ${cat}`, 
          url: `/jewellery?product_type=Diamonds&category=${encodeURIComponent(cat)}` 
        });
      });
      genders.forEach(gender => {
        if (gender === 'Women') {
          diamondSearches.push({ 
            name: `Women Diamond Rings`, 
            url: `/jewellery?product_type=Diamonds&category=Ring&gender=Women` 
          });
        } else if (gender === 'Man') {
          diamondSearches.push({ 
            name: `Men's Diamond Earrings`, 
            url: `/jewellery?product_type=Diamonds&category=Earring&gender=Man` 
          });
          diamondSearches.push({ 
            name: `Men's Diamond Rings`, 
            url: `/jewellery?product_type=Diamonds&category=Ring&gender=Man` 
          });
          diamondSearches.push({ 
            name: `Men's Diamond Braclets`, 
            url: `/jewellery?product_type=Diamonds&category=Bracelet&gender=Man` 
          });
        }
      });
    }

    // Build Men's Jewellery Collection
    const mensSearches: Array<{ name: string; url: string }> = [];
    if (genders.includes('Man')) {
      mensSearches.push({ name: "Men's Jewellery", url: '/jewellery?gender=Man' });
      uniqueCategories.forEach(cat => {
        if (['Ring', 'Earring'].includes(cat)) {
          mensSearches.push({ 
            name: `${cat}s for Men`, 
            url: `/jewellery?gender=Man&category=${encodeURIComponent(cat)}` 
          });
        }
      });
      mensSearches.push({ name: "Men's Kada", url: '/jewellery?gender=Man&category=Bangle' });
      mensSearches.push({ name: "Cufflinks for Men", url: '/jewellery?gender=Man&category=Pendant' });
    }

    // Build Women's Jewellery Collection
    const womensSearches: Array<{ name: string; url: string }> = [];
    if (genders.includes('Women')) {
      womensSearches.push({ name: "Jewellery For Women", url: '/jewellery?gender=Women' });
      uniqueCategories.forEach(cat => {
        womensSearches.push({ 
          name: `${cat}s for Women`, 
          url: `/jewellery?gender=Women&category=${encodeURIComponent(cat)}` 
        });
      });
    }

    // Build Jewellery by Occasion
    const occasionSearches: Array<{ name: string; url: string }> = [];
    if (allOccasions.length > 0) {
      allOccasions.forEach(occasion => {
        occasionSearches.push({ 
          name: occasion, 
          url: `/jewellery?occasion=${encodeURIComponent(occasion)}` 
        });
      });
    } else {
      // Fallback to common occasions if no occasions in database
      const commonOccasions = [
        'Engagement Ring',
        'Engagement Ring For Women',
        'Engagement Ring For Men',
        'Gold Engagement Rings for Women',
        'Gold Engagement Rings for Men',
        'Diamond Engagement Rings',
        'Diamond Engagement Rings for Women',
        'Jewellery Gifts for Anniversary',
        'Jewellery Gifts for Wedding'
      ];
      commonOccasions.forEach(occasion => {
        occasionSearches.push({ 
          name: occasion, 
          url: `/jewellery?search=${encodeURIComponent(occasion)}` 
        });
      });
    }

    return NextResponse.json({
      popularSearches: popularSearches.slice(0, 15),
      goldSearches: goldSearches.slice(0, 15),
      diamondSearches: diamondSearches.slice(0, 15),
      mensSearches: mensSearches.slice(0, 10),
      womensSearches: womensSearches.slice(0, 10),
      occasionSearches: occasionSearches.slice(0, 10),
    });
  } catch (error) {
    console.error("[v0] Failed to fetch footer searches:", error);
    return NextResponse.json(
      { error: "Failed to fetch footer searches" },
      { status: 500 }
    );
  }
}
