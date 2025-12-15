import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch single subcategory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('GET subcategory ID:', id);
    const { db } = await connectToDatabase();

    const subcategory = await db.collection('categories').findOne({
      _id: new ObjectId(id),
    });

    console.log('Found subcategory:', subcategory);

    if (!subcategory) {
      console.error('Subcategory not found with ID:', id);
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    // Verify it has a parentId (is a subcategory, not a category)
    if (!subcategory.parentId && subcategory.parentId !== '') {
      console.error('Document is not a subcategory:', subcategory);
      return NextResponse.json(
        { error: 'This is a category, not a subcategory' },
        { status: 400 }
      );
    }

    // Get category name
    let category = null;
    if (subcategory.parentId) {
      category = await db.collection('categories').findOne({ _id: new ObjectId(subcategory.parentId) });
    }

    return NextResponse.json({
      ...subcategory,
      _id: subcategory._id.toString(),
      categoryId: subcategory.parentId?.toString(),
      categoryName: category?.name || 'Unknown',
    });
  } catch (error) {
    console.error('Failed to fetch subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcategory' },
      { status: 500 }
    );
  }
}

// PUT - Update subcategory
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('PUT subcategory ID:', id);
    const { db } = await connectToDatabase();

    const body = await request.json();
    console.log('PUT request body:', body);
    const { name, slug, categoryId, description, image, banner, position, status } = body;

    // First, find the subcategory to verify it exists
    const subcategory = await db.collection('categories').findOne({
      _id: new ObjectId(id),
    });

    console.log('Found document:', subcategory);

    if (!subcategory) {
      console.error('Subcategory not found with ID:', id);
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    // Verify it's actually a subcategory (has parentId)
    if (!subcategory.parentId && subcategory.parentId !== '') {
      console.error('Document is not a subcategory, parentId:', subcategory.parentId);
      return NextResponse.json(
        { error: 'This is a category, not a subcategory. ParentId is missing.' },
        { status: 400 }
      );
    }

    // If categoryId is provided, verify the parent category exists
    if (categoryId) {
      const category = await db.collection('categories').findOne({ 
        _id: new ObjectId(categoryId)
      });
      console.log('Parent category lookup for ID:', categoryId, 'Found:', category);
      if (!category) {
        console.error('Parent category not found with ID:', categoryId);
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 404 }
        );
      }
      // Verify it's a parent category (not a subcategory)
      if (category.parentId) {
        console.error('Selected category is actually a subcategory:', category);
        return NextResponse.json(
          { error: 'Cannot set a subcategory as parent. Please select a main category.' },
          { status: 400 }
        );
      }
    }

    // Check if slug is being changed and if it already exists
    if (slug && slug !== subcategory.slug) {
      const existingWithSlug = await db.collection('categories').findOne({ 
        slug, 
        _id: { $ne: new ObjectId(id) } 
      });
      if (existingWithSlug) {
        return NextResponse.json(
          { error: 'A category or subcategory with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (categoryId !== undefined) updateData.parentId = categoryId;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (banner !== undefined) updateData.banner = banner;
    if (position !== undefined) updateData.position = Number(position);
    if (status !== undefined) updateData.status = status;

    // Update the subcategory
    const result = await db.collection('categories').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update subcategory' },
        { status: 500 }
      );
    }

    // Fetch the updated subcategory
    const updatedSubcategory = await db.collection('categories').findOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({
      success: true,
      subcategory: {
        ...updatedSubcategory,
        _id: updatedSubcategory?._id.toString(),
        categoryId: updatedSubcategory?.parentId?.toString(),
      },
    });
  } catch (error) {
    console.error('Failed to update subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to update subcategory' },
      { status: 500 }
    );
  }
}

// DELETE - Delete subcategory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    const result = await db.collection('categories').deleteOne({
      _id: new ObjectId(id),
      parentId: { $exists: true, $ne: null },
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500 }
    );
  }
}
