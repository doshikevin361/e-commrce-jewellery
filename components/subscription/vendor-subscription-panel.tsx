'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  plan_type: string;
  price: number;
  duration_days: number;
}

interface SubscriptionStatus {
  subscriptionEnabled: boolean;
  hasActiveSubscription: boolean;
  allowed: boolean;
  subscription: {
    id: string;
    start_date: string;
    end_date: string;
    status: string;
  } | null;
}

export function VendorSubscriptionPanel() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/status', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/plans?role=vendor', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchPlans()]);
      setLoading(false);
    })();
  }, [fetchStatus, fetchPlans]);

  const handlePurchase = async (planId: string) => {
    try {
      setPurchasing(planId);
      const res = await fetch('/api/subscription/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Purchase failed');
      toast({ title: 'Success', description: 'Subscription activated successfully.' });
      await fetchStatus();
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to purchase plan',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!status?.subscriptionEnabled) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold mb-2">Vendor Subscription</h1>
        <p className="text-muted-foreground">
          Subscription is not required at this time. You have full access to vendor features.
        </p>
      </div>
    );
  }

  const planLabel = (type: string) => {
    if (type === 'monthly') return '1 month';
    if (type === 'quarterly') return '3 months';
    if (type === 'yearly') return '12 months';
    return type;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-semibold">Vendor Subscription</h1>

      {status.subscription && (
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            {status.hasActiveSubscription ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Active subscription
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-amber-600" />
                Subscription expired
              </>
            )}
          </h2>
          <dl className="grid gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Start: </span>
              <span>{new Date(status.subscription.start_date).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">End: </span>
              <span>{new Date(status.subscription.end_date).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status: </span>
              <span className="capitalize">{status.subscription.status}</span>
            </div>
          </dl>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Available plans
        </h2>
        {plans.length === 0 ? (
          <p className="text-muted-foreground">No plans available. Contact admin to set up subscription plans.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="p-4 border-2">
                <div className="font-medium">{planLabel(plan.plan_type)}</div>
                <div className="text-2xl font-semibold mt-1">
                  ₹{Number(plan.price).toLocaleString()}
                </div>
                <div className="text-muted-foreground text-sm">{plan.duration_days} days</div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => handlePurchase(plan.id)}
                  disabled={!!purchasing || status.hasActiveSubscription}
                >
                  {purchasing === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : status.hasActiveSubscription ? (
                    'Active'
                  ) : (
                    'Purchase'
                  )}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
