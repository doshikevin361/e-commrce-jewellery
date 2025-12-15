import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch all subcategories
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const categoryId = searchParams.get('categoryId') || '';

    let query: any = { parentId: { $exists: true, $ne: null } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (categoryId && categoryId !== 'all') {
      query.parentId = categoryId;
    }

    const subcategories = await db
      .collection('categories')
      .find(query)
      .sort({ position: 1, createdAt: -1 })
      .toArray();

    // Populate category names
    const subcategoriesWithCategoryNames = await Promise.all(
      subcategories.map(async (sub: any) => {
        const category = await db.collection('categories').findOne({ _id: new ObjectId(sub.parentId) });
        return {
          ...sub,
          _id: sub._id.toString(),
          categoryId: sub.parentId?.toString(),
          categoryName: category?.name || 'Unknown',
        };
      })
    );

    return NextResponse.json({
      success: true,
      subcategories: subcategoriesWithCategoryNames,
    });
  } catch (error) {
    console.error('Failed to fetch subcategories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}

// POST - Create new subcategory
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();

    const body = await request.json();
    const { name, slug, categoryId, description, image, banner, position, status } = body;

    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { error: 'Name, slug, and category are required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await db.collection('categories').findOne({ _id: new ObjectId(categoryId) });
    if (!category) {
      return NextResponse.json(
        { error: 'Parent category not found' },
        { status: 404 }
      );
    }

    // Check if slug already exists
    const existingSubcategory = await db.collection('categories').findOne({ slug });
    if (existingSubcategory) {
      return NextResponse.json(
        { error: 'Subcategory with this slug already exists' },
        { status: 400 }
      );
    }

    const subcategoryData = {
      name,
      slug,
      parentId: categoryId,
      description: description || '',
      image: image || '',
      banner: banner || '',
      position: position || 0,
      status: status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('categories').insertOne(subcategoryData);

    return NextResponse.json({
      success: true,
      subcategory: {
        ...subcategoryData,
        _id: result.insertedId.toString(),
        categoryId: categoryId,
      },
    });
  } catch (error) {
    console.error('Failed to create subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500 }
    );
  }
}
