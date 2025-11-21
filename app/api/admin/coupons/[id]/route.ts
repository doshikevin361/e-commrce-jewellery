import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid coupon ID' }, { status: 400 });
    }

    const coupon = await db.collection('coupons').findOne({ _id: new ObjectId(id) });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...coupon,
      _id: coupon._id.toString(),
    });
  } catch (error) {
    console.error('[v0] Error fetching coupon:', error);
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    const body = await request.json();
    const {
      title,
      description,
      code,
      type,
      amount,
      isExpired,
      isFirstOrder,
      status,
      applyToAllProducts,
      products,
      minimumSpend,
      isUnlimited,
      usagePerCoupon,
      usagePerCustomer,
    } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid coupon ID' }, { status: 400 });
    }

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!description || description.trim() === '') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    if (!code || code.trim() === '') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }
    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Amount is required and must be greater than 0' }, { status: 400 });
    }

    // Check if coupon with same code exists (excluding current coupon)
    const existingCoupon = await db.collection('coupons').findOne({
      code: { $regex: new RegExp(`^${code}$`, 'i') },
      _id: { $ne: new ObjectId(id) },
    });

    if (existingCoupon) {
      return NextResponse.json({ error: 'Coupon with this code already exists' }, { status: 400 });
    }

    // Validation for restriction tab
    if (!applyToAllProducts && (!products || products.length === 0)) {
      return NextResponse.json({ error: 'Products are required when not applying to all products' }, { status: 400 });
    }
    if (!minimumSpend || minimumSpend <= 0) {
      return NextResponse.json({ error: 'Minimum spend is required and must be greater than 0' }, { status: 400 });
    }

    // Validation for usage tab
    if (!isUnlimited) {
      if (!usagePerCoupon || usagePerCoupon <= 0) {
        return NextResponse.json({ error: 'Usage per coupon is required and must be greater than 0' }, { status: 400 });
      }
      if (!usagePerCustomer || usagePerCustomer <= 0) {
        return NextResponse.json({ error: 'Usage per customer is required and must be greater than 0' }, { status: 400 });
      }
    }

    const updateData = {
      title: title.trim(),
      description: description.trim(),
      code: code.trim().toUpperCase(),
      type: type,
      amount: parseFloat(amount),
      isExpired: isExpired || false,
      isFirstOrder: isFirstOrder || false,
      status: status !== undefined ? status : true,
      applyToAllProducts: applyToAllProducts || false,
      products: Array.isArray(products) ? products : [],
      minimumSpend: parseFloat(minimumSpend) || 0,
      isUnlimited: isUnlimited || false,
      usagePerCoupon: isUnlimited ? 0 : (parseInt(usagePerCoupon) || 0),
      usagePerCustomer: isUnlimited ? 0 : (parseInt(usagePerCustomer) || 0),
      updatedAt: new Date(),
    };

    const result = await db.collection('coupons').updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    const updated = await db.collection('coupons').findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      ...updated,
      _id: updated?._id.toString(),
    });
  } catch (error) {
    console.error('[v0] Error updating coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid coupon ID' }, { status: 400 });
    }

    const result = await db.collection('coupons').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('[v0] Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}

