'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

type PlanType = 'monthly' | 'quarterly' | 'yearly';

interface PlanRow {
  plan_type: PlanType;
  price: number;
  duration_days: number;
}

interface SubscriptionSettingsState {
  vendorSubscriptionEnabled: boolean;
  retailerSubscriptionEnabled: boolean;
  vendorPlans: PlanRow[];
  retailerPlans: PlanRow[];
}

const PLAN_LABELS: Record<PlanType, string> = {
  monthly: 'Monthly (1 month)',
  quarterly: 'Quarterly (3 months)',
  yearly: 'Yearly (12 months)',
};

export function SubscriptionSettingsPanel() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SubscriptionSettingsState>({
    vendorSubscriptionEnabled: false,
    retailerSubscriptionEnabled: false,
    vendorPlans: [
      { plan_type: 'monthly', price: 0, duration_days: 30 },
      { plan_type: 'quarterly', price: 0, duration_days: 90 },
      { plan_type: 'yearly', price: 0, duration_days: 365 },
    ],
    retailerPlans: [
      { plan_type: 'monthly', price: 0, duration_days: 30 },
      { plan_type: 'quarterly', price: 0, duration_days: 90 },
      { plan_type: 'yearly', price: 0, duration_days: 365 },
    ],
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/subscription-settings', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load subscription settings');
      const json = await res.json();
      setData({
        vendorSubscriptionEnabled: !!json.vendorSubscriptionEnabled,
        retailerSubscriptionEnabled: !!json.retailerSubscriptionEnabled,
        vendorPlans: Array.isArray(json.vendorPlans) && json.vendorPlans.length > 0
          ? json.vendorPlans
          : [
              { plan_type: 'monthly', price: 0, duration_days: 30 },
              { plan_type: 'quarterly', price: 0, duration_days: 90 },
              { plan_type: 'yearly', price: 0, duration_days: 365 },
            ],
        retailerPlans: Array.isArray(json.retailerPlans) && json.retailerPlans.length > 0
          ? json.retailerPlans
          : [
              { plan_type: 'monthly', price: 0, duration_days: 30 },
              { plan_type: 'quarterly', price: 0, duration_days: 90 },
              { plan_type: 'yearly', price: 0, duration_days: 365 },
            ],
      });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to load subscription settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const setVendorEnabled = (v: boolean) =>
    setData((prev) => ({ ...prev, vendorSubscriptionEnabled: v }));
  const setRetailerEnabled = (v: boolean) =>
    setData((prev) => ({ ...prev, retailerSubscriptionEnabled: v }));

  const setVendorPlanPrice = (planType: PlanType, price: number) => {
    setData((prev) => ({
      ...prev,
      vendorPlans: prev.vendorPlans.map((p) =>
        p.plan_type === planType ? { ...p, price } : p
      ),
    }));
  };
  const setRetailerPlanPrice = (planType: PlanType, price: number) => {
    setData((prev) => ({
      ...prev,
      retailerPlans: prev.retailerPlans.map((p) =>
        p.plan_type === planType ? { ...p, price } : p
      ),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const vendorPricing: Record<PlanType, number> = { monthly: 0, quarterly: 0, yearly: 0 };
      const retailerPricing: Record<PlanType, number> = { monthly: 0, quarterly: 0, yearly: 0 };
      data.vendorPlans.forEach((p) => {
        vendorPricing[p.plan_type] = Number(p.price) || 0;
      });
      data.retailerPlans.forEach((p) => {
        retailerPricing[p.plan_type] = Number(p.price) || 0;
      });
      const res = await fetch('/api/admin/subscription-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorSubscriptionEnabled: data.vendorSubscriptionEnabled,
          retailerSubscriptionEnabled: data.retailerSubscriptionEnabled,
          vendorPricing,
          retailerPricing,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to save');
      }
      toast({ title: 'Saved', variant: 'success', description: 'Subscription settings updated successfully.' });
      fetchSettings();
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to save subscription settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Subscription Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-medium">Vendor Subscription</h2>
        <div className="flex items-center gap-4 mb-6">
          <Switch
            id="vendor-subscription"
            checked={data.vendorSubscriptionEnabled}
            onCheckedChange={setVendorEnabled}
          />
          <Label htmlFor="vendor-subscription">Enable Vendor Subscription</Label>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          When enabled, vendors must purchase a plan to add/edit products and access vendor features.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {data.vendorPlans.map((p) => (
            <div key={p.plan_type} className="space-y-2">
              <Label>{PLAN_LABELS[p.plan_type]}</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={p.price}
                onChange={(e) => setVendorPlanPrice(p.plan_type, parseFloat(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-medium">Retailer Subscription</h2>
        <div className="flex items-center gap-4 mb-6">
          <Switch
            id="retailer-subscription"
            checked={data.retailerSubscriptionEnabled}
            onCheckedChange={setRetailerEnabled}
          />
          <Label htmlFor="retailer-subscription">Enable Retailer Subscription</Label>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          When enabled, retailers must purchase a plan to add/edit products and sell to portal.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {data.retailerPlans.map((p) => (
            <div key={p.plan_type} className="space-y-2">
              <Label>{PLAN_LABELS[p.plan_type]}</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={p.price}
                onChange={(e) => setRetailerPlanPrice(p.plan_type, parseFloat(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
