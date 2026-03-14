import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getActiveSubscription } from '@/lib/models/subscription';
import type { SubscriptionRole } from '@/lib/models/subscription';
import { getUserFromRequest, isVendor } from '@/lib/auth';
import { getRetailerFromRequest } from '@/lib/auth';

export interface SubscriptionAccessResult {
  allowed: boolean;
  reason?: string;
  subscriptionEnabled?: boolean;
}

/**
 * Check if the user has access to vendor/retailer panel features.
 * - If subscription is disabled for the role → allow full access.
 * - If subscription is enabled and user has active subscription → allow.
 * - If subscription is enabled and user has no active subscription → deny.
 */
export async function checkSubscriptionAccess(
  userId: string,
  role: SubscriptionRole
): Promise<SubscriptionAccessResult> {
  const { db } = await connectToDatabase();
  const settings = await db.collection('settings').findOne({});
  const enabled =
    role === 'vendor'
      ? settings?.vendorSubscriptionEnabled === true
      : settings?.retailerSubscriptionEnabled === true;

  if (!enabled) {
    return { allowed: true, subscriptionEnabled: false };
  }

  const subscription = await getActiveSubscription(userId, role);
  const hasActive = subscription !== null && subscription.status === 'active' && new Date() < subscription.end_date;

  if (hasActive) {
    return { allowed: true, subscriptionEnabled: true };
  }

  return {
    allowed: false,
    subscriptionEnabled: true,
    reason: 'Active subscription required. Please purchase a plan to continue.',
  };
}

/**
 * Get subscription settings for a role (whether subscription is enabled).
 * Used by frontend to show/hide subscription UI and enforce redirects.
 */
export async function getSubscriptionEnabled(role: SubscriptionRole): Promise<boolean> {
  const { db } = await connectToDatabase();
  const settings = await db.collection('settings').findOne({});
  return role === 'vendor'
    ? settings?.vendorSubscriptionEnabled === true
    : settings?.retailerSubscriptionEnabled === true;
}

/**
 * Use in API routes that require subscription when enabled.
 * Returns a 403 NextResponse if subscription is required and user does not have access; otherwise null.
 * Call only for vendor or retailer routes (not admin-only).
 */
export async function requireSubscriptionOr403(
  request: NextRequest,
  role: SubscriptionRole
): Promise<NextResponse | null> {
  let userId: string | undefined;
  if (role === 'vendor') {
    const user = getUserFromRequest(request);
    if (!user || !isVendor(user)) return null;
    userId = user.id;
  } else {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return null;
    userId = retailer.id;
  }
  if (!userId) return null;
  const access = await checkSubscriptionAccess(userId, role);
  if (access.allowed) return null;
  return NextResponse.json(
    { error: access.reason || 'Active subscription required.' },
    { status: 403 }
  );
}
