import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export type SubscriptionPlanType = 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionRole = 'vendor' | 'retailer';
export type UserSubscriptionStatus = 'active' | 'expired';

export interface SubscriptionPlan {
  _id?: ObjectId;
  role: SubscriptionRole;
  plan_type: SubscriptionPlanType;
  price: number;
  duration_days: number;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSubscription {
  _id?: ObjectId;
  user_id: string;
  role: SubscriptionRole;
  plan_id: ObjectId;
  start_date: Date;
  end_date: Date;
  status: UserSubscriptionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const PLAN_DURATION_DAYS: Record<SubscriptionPlanType, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

export function getDurationDays(planType: SubscriptionPlanType): number {
  return PLAN_DURATION_DAYS[planType];
}

export async function getPlansByRole(role: SubscriptionRole): Promise<SubscriptionPlan[]> {
  const { db } = await connectToDatabase();
  const plans = await db
    .collection<SubscriptionPlan>('subscription_plans')
    .find({ role, status: 'active' })
    .sort({ duration_days: 1 })
    .toArray();
  return plans;
}

export async function getPlanById(planId: string): Promise<SubscriptionPlan | null> {
  const { db } = await connectToDatabase();
  const plan = await db
    .collection<SubscriptionPlan>('subscription_plans')
    .findOne({ _id: new ObjectId(planId), status: 'active' });
  return plan;
}

export async function upsertSubscriptionPlan(
  role: SubscriptionRole,
  planType: SubscriptionPlanType,
  price: number
): Promise<ObjectId> {
  const { db } = await connectToDatabase();
  const duration_days = getDurationDays(planType);
  const now = new Date();
  const result = await db.collection<SubscriptionPlan>('subscription_plans').findOneAndUpdate(
    { role, plan_type: planType },
    {
      $set: {
        role,
        plan_type: planType,
        price,
        duration_days,
        status: 'active',
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
  const doc = result?.value ?? result;
  return (doc as SubscriptionPlan)._id!;
}

export async function getActiveSubscription(
  userId: string,
  role: SubscriptionRole
): Promise<UserSubscription | null> {
  const { db } = await connectToDatabase();
  const now = new Date();
  const sub = await db.collection<UserSubscription>('user_subscriptions').findOne({
    user_id: userId,
    role,
    status: 'active',
    end_date: { $gt: now },
  });
  return sub;
}

export async function createUserSubscription(
  userId: string,
  role: SubscriptionRole,
  planId: string
): Promise<UserSubscription> {
  const { db } = await connectToDatabase();
  const plan = await getPlanById(planId);
  if (!plan) {
    throw new Error('Invalid plan');
  }
  const now = new Date();
  const start_date = now;
  const end_date = new Date(now);
  end_date.setDate(end_date.getDate() + plan.duration_days);

  const doc: Omit<UserSubscription, '_id'> = {
    user_id: userId,
    role,
    plan_id: plan._id!,
    start_date,
    end_date,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection<UserSubscription>('user_subscriptions').insertOne(doc as UserSubscription);
  return { ...doc, _id: result.insertedId } as UserSubscription;
}

export async function expireOldSubscriptions(): Promise<void> {
  const { db } = await connectToDatabase();
  const now = new Date();
  await db.collection<UserSubscription>('user_subscriptions').updateMany(
    { status: 'active', end_date: { $lte: now } },
    { $set: { status: 'expired', updatedAt: now } }
  );
}

export async function getCurrentSubscription(
  userId: string,
  role: SubscriptionRole
): Promise<UserSubscription | null> {
  const { db } = await connectToDatabase();
  const sub = await db
    .collection<UserSubscription>('user_subscriptions')
    .findOne(
      { user_id: userId, role },
      { sort: { start_date: -1 } }
    );
  if (!sub) return null;
  const now = new Date();
  if (sub.end_date < now && sub.status === 'active') {
    await db.collection<UserSubscription>('user_subscriptions').updateOne(
      { _id: sub._id },
      { $set: { status: 'expired', updatedAt: now } }
    );
    return { ...sub, status: 'expired' as UserSubscriptionStatus };
  }
  return sub;
}
