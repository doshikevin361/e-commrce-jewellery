import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isVendor } from '@/lib/auth';
import { getRetailerFromRequest } from '@/lib/auth';
import { getCurrentSubscription } from '@/lib/models/subscription';
import { getSubscriptionEnabled } from '@/lib/subscription-access';
import type { SubscriptionRole } from '@/lib/models/subscription';

export async function GET(request: NextRequest) {
  try {
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

    const [subscriptionEnabled, subscription] = await Promise.all([
      getSubscriptionEnabled(role),
      getCurrentSubscription(userId, role),
    ]);

    const now = new Date();
    const hasActiveSubscription =
      subscription !== null &&
      subscription.status === 'active' &&
      subscription.end_date > now;

    return NextResponse.json({
      subscriptionEnabled,
      hasActiveSubscription,
      allowed: !subscriptionEnabled || hasActiveSubscription,
      subscription: subscription
        ? {
            id: subscription._id?.toString(),
            start_date: subscription.start_date,
            end_date: subscription.end_date,
            status: subscription.status,
          }
        : null,
    });
  } catch (error) {
    console.error('[Subscription Status] GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription status' }, { status: 500 });
  }
}
