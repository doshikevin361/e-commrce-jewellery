import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isVendor } from '@/lib/auth';
import { getRetailerFromRequest } from '@/lib/auth';
import { createUserSubscription } from '@/lib/models/subscription';
import type { SubscriptionRole } from '@/lib/models/subscription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const planId = body?.planId;

    if (!planId || typeof planId !== 'string') {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const adminUser = getUserFromRequest(request);
    const retailer = getRetailerFromRequest(request);

    let userId: string;
    let role: SubscriptionRole;

    if (adminUser && isVendor(adminUser)) {
      userId = adminUser.id;
      role = 'vendor';
    } else if (retailer) {
      userId = retailer.id;
      role = 'retailer';
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await createUserSubscription(userId, role, planId);
    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription._id?.toString(),
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        status: subscription.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Subscription Purchase] POST failed:', error);
    return NextResponse.json({ error: message || 'Failed to purchase subscription' }, { status: 500 });
  }
}
