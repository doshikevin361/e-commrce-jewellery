import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'all') {
      filter.status = status === 'active';
    }

    const coupons = await db
      .collection('coupons')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      coupons.map(coupon => ({
        ...coupon,
        _id: coupon._id.toString(),
      }))
    );
  } catch (error) {
    console.error('[v0] Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Check if coupon with same code exists
    const existingCoupon = await db.collection('coupons').findOne({
      code: { $regex: new RegExp(`^${code}$`, 'i') },
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

    const newCoupon = {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('coupons').insertOne(newCoupon);

    return NextResponse.json(
      {
        ...newCoupon,
        _id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

