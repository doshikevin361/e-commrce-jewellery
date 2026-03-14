import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isAdmin, isVendor } from '@/lib/auth';
import { getRetailerFromRequest } from '@/lib/auth';
import { getPlansByRole } from '@/lib/models/subscription';
import type { SubscriptionRole } from '@/lib/models/subscription';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as SubscriptionRole | null;

    if (!role || !['vendor', 'retailer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid or missing role' }, { status: 400 });
    }

    if (role === 'vendor') {
      const user = getUserFromRequest(request);
      if (!user || (!isAdmin(user) && !isVendor(user))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      const retailer = getRetailerFromRequest(request);
      if (!retailer) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const plans = await getPlansByRole(role);
    return NextResponse.json({
      plans: plans.map(p => ({
        id: p._id?.toString(),
        plan_type: p.plan_type,
        price: p.price,
        duration_days: p.duration_days,
      })),
    });
  } catch (error) {
    console.error('[Subscription Plans] GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}
