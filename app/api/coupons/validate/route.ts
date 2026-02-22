import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectDB, connectToDatabase } from '@/lib/mongodb';
import { getCustomerFromRequest } from '@/lib/auth';
import Order from '@/lib/models/Order';

type CartItemPayload = {
  productId: string;
  quantity: number;
  price: number;
};

export async function POST(req: NextRequest) {
  try {
    const customer = getCustomerFromRequest(req);
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const code = (body?.code || '').toString().trim().toUpperCase();
    const items = Array.isArray(body?.items) ? (body.items as CartItemPayload[]) : [];
    const subtotal = Number(body?.subtotal || 0);

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    if (!items.length || subtotal <= 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const coupon = await db.collection('coupons').findOne({
      code: { $regex: new RegExp(`^${code}$`, 'i') },
      status: true,
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or inactive coupon' }, { status: 404 });
    }

    if (coupon.isExpired) {
      return NextResponse.json({ error: 'This coupon is expired' }, { status: 400 });
    }

    if (coupon.minimumSpend && subtotal < coupon.minimumSpend) {
      return NextResponse.json(
        { error: `Minimum spend of ₹${coupon.minimumSpend} is required` },
        { status: 400 }
      );
    }

    if (coupon.isFirstOrder) {
      await connectDB();
      const orderCount = await Order.countDocuments({ customer: new ObjectId(customer.id) });
      if (orderCount > 0) {
        return NextResponse.json({ error: 'Coupon valid only for first order' }, { status: 400 });
      }
    }

    const totalUsage = coupon.totalUsage || 0;
    if (!coupon.isUnlimited && coupon.usagePerCoupon && totalUsage >= coupon.usagePerCoupon) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }

    if (!coupon.isUnlimited && coupon.usagePerCustomer) {
      const usage = await db.collection('coupon_usages').findOne({
        couponId: coupon._id,
        customerId: customer.id,
      });
      const usageCount = usage?.usageCount || 0;
      if (usageCount >= coupon.usagePerCustomer) {
        return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 });
      }
    }

    let eligibleSubtotal = subtotal;
    if (!coupon.applyToAllProducts) {
      const allowedIds = new Set((coupon.products || []).map((id: ObjectId) => id.toString()));
      eligibleSubtotal = items.reduce((sum, item) => {
        if (allowedIds.has(item.productId)) {
          return sum + item.price * item.quantity;
        }
        return sum;
      }, 0);
      if (eligibleSubtotal <= 0) {
        return NextResponse.json({ error: 'Coupon not applicable to selected items' }, { status: 400 });
      }
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (eligibleSubtotal * coupon.amount) / 100;
    } else {
      discountAmount = Math.min(coupon.amount, eligibleSubtotal);
    }

    discountAmount = Math.max(0, Math.min(discountAmount, subtotal));
    discountAmount = Math.round(discountAmount);

    return NextResponse.json({
      valid: true,
      discountAmount,
      coupon: {
        id: coupon._id.toString(),
        code: coupon.code,
        title: coupon.title,
        type: coupon.type,
        amount: coupon.amount,
        minimumSpend: coupon.minimumSpend || 0,
      },
    });
  } catch (error) {
    console.error('[Coupon Validate] Error:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}



