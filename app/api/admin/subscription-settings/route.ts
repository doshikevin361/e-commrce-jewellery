import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isAdmin } from '@/lib/auth';
import {
  upsertSubscriptionPlan,
  getPlansByRole,
  getDurationDays,
} from '@/lib/models/subscription';
import type { SubscriptionPlanType, SubscriptionRole } from '@/lib/models/subscription';

const PLAN_TYPES: SubscriptionPlanType[] = ['monthly', 'quarterly', 'yearly'];

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const settings = await db.collection('settings').findOne({});
    const vendorSubscriptionEnabled = settings?.vendorSubscriptionEnabled === true;
    const retailerSubscriptionEnabled = settings?.retailerSubscriptionEnabled === true;

    const [vendorPlans, retailerPlans] = await Promise.all([
      getPlansByRole('vendor'),
      getPlansByRole('retailer'),
    ]);

    const toPlanPayload = (p: { plan_type: string; price: number; duration_days: number }) => ({
      plan_type: p.plan_type,
      price: p.price,
      duration_days: p.duration_days,
    });

    return NextResponse.json({
      vendorSubscriptionEnabled,
      retailerSubscriptionEnabled,
      vendorPlans: vendorPlans.length
        ? vendorPlans.map(toPlanPayload)
        : PLAN_TYPES.map(t => ({ plan_type: t, price: 0, duration_days: getDurationDays(t) })),
      retailerPlans: retailerPlans.length
        ? retailerPlans.map(toPlanPayload)
        : PLAN_TYPES.map(t => ({ plan_type: t, price: 0, duration_days: getDurationDays(t) })),
    });
  } catch (error) {
    console.error('[Subscription Settings] GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const vendorSubscriptionEnabled = body.vendorSubscriptionEnabled === true;
    const retailerSubscriptionEnabled = body.retailerSubscriptionEnabled === true;

    const vendorPricing = body.vendorPricing ?? {};
    const retailerPricing = body.retailerPricing ?? {};

    const { db } = await connectToDatabase();

    await db.collection('settings').findOneAndUpdate(
      {},
      {
        $set: {
          vendorSubscriptionEnabled,
          retailerSubscriptionEnabled,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    for (const planType of PLAN_TYPES) {
      const vPrice = typeof vendorPricing[planType] === 'number' ? vendorPricing[planType] : 0;
      const rPrice = typeof retailerPricing[planType] === 'number' ? retailerPricing[planType] : 0;
      await upsertSubscriptionPlan('vendor', planType, vPrice);
      await upsertSubscriptionPlan('retailer', planType, rPrice);
    }

    const [vendorPlans, retailerPlans] = await Promise.all([
      getPlansByRole('vendor'),
      getPlansByRole('retailer'),
    ]);

    return NextResponse.json({
      vendorSubscriptionEnabled,
      retailerSubscriptionEnabled,
      vendorPlans: vendorPlans.map(p => ({ plan_type: p.plan_type, price: p.price, duration_days: p.duration_days })),
      retailerPlans: retailerPlans.map(p => ({ plan_type: p.plan_type, price: p.price, duration_days: p.duration_days })),
    });
  } catch (error) {
    console.error('[Subscription Settings] PUT failed:', error);
    return NextResponse.json({ error: 'Failed to update subscription settings' }, { status: 500 });
  }
}
