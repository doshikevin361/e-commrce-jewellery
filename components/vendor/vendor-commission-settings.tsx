"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface CommissionRates {
  Gold: number;
  Silver: number;
  Platinum: number;
  Gemstone: number;
  Diamonds: number;
  Imitation: number;
}

const DEFAULT_COMMISSIONS: CommissionRates = {
  Gold: 5,
  Silver: 4,
  Platinum: 6,
  Gemstone: 8,
  Diamonds: 10,
  Imitation: 3,
};

export function VendorCommissionSettings() {
  const { toast } = useToast();
  const [commissions, setCommissions] = useState<CommissionRates>(DEFAULT_COMMISSIONS);
  const [lastSaved, setLastSaved] = useState<CommissionRates>(DEFAULT_COMMISSIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const hasChanges = useMemo(
    () =>
      Object.keys(commissions).some(
        (key) =>
          commissions[key as keyof CommissionRates] !==
          lastSaved[key as keyof CommissionRates]
      ),
    [commissions, lastSaved]
  );

  useEffect(() => {
    document.body.style.overflowY = 'hidden';
    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, []);

  const fetchCommissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vendor/commission-settings", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Unable to load commission settings");
      }
      const data = await response.json();
      const loadedCommissions = data.commissions || DEFAULT_COMMISSIONS;
      setCommissions(loadedCommissions);
      setLastSaved(loadedCommissions);
    } catch (error) {
      console.error("[v0] Commission settings fetch failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load commission settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const updateCommission = (productType: keyof CommissionRates, value: number) => {
    setCommissions((prev) => ({
      ...prev,
      [productType]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);
    try {
      const response = await fetch("/api/vendor/commission-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commissions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Failed to update commission settings");
      }

      setLastSaved(commissions);

      toast({
        title: "Settings saved",
        description: "Commission rates updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("[v0] Commission settings update failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update commission settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCommissions(lastSaved);
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading commission settings...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Configuration
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Commission Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Set commission rates for each product type. These rates will be automatically applied when you add products.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/20">
            <div className="flex items-center gap-3">
              <Percent className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Product Type Commission Rates (%)
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Set commission rates for each product type. These will be automatically applied when creating products.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow
                label="Gold Commission (%)"
                description="Commission rate for Gold products"
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissions.Gold}
                  onChange={(event) =>
                    updateCommission('Gold', parseFloat(event.target.value) || 0)
                  }
                  placeholder="5.0"
                  className="h-12"
                />
              </FieldRow>

              <FieldRow
                label="Silver Commission (%)"
                description="Commission rate for Silver products"
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissions.Silver}
                  onChange={(event) =>
                    updateCommission('Silver', parseFloat(event.target.value) || 0)
                  }
                  placeholder="4.0"
                  className="h-12"
                />
              </FieldRow>

              <FieldRow
                label="Platinum Commission (%)"
                description="Commission rate for Platinum products"
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissions.Platinum}
                  onChange={(event) =>
                    updateCommission('Platinum', parseFloat(event.target.value) || 0)
                  }
                  placeholder="6.0"
                  className="h-12"
                />
              </FieldRow>

              <FieldRow
                label="Gemstone Commission (%)"
                description="Commission rate for Gemstone products"
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissions.Gemstone}
                  onChange={(event) =>
                    updateCommission('Gemstone', parseFloat(event.target.value) || 0)
                  }
                  placeholder="8.0"
                  className="h-12"
                />
              </FieldRow>

              <FieldRow
                label="Diamonds Commission (%)"
                description="Commission rate for Diamonds products"
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissions.Diamonds}
                  onChange={(event) =>
                    updateCommission('Diamonds', parseFloat(event.target.value) || 0)
                  }
                  placeholder="10.0"
                  className="h-12"
                />
              </FieldRow>

              <FieldRow
                label="Imitation Commission (%)"
                description="Commission rate for Imitation products"
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissions.Imitation}
                  onChange={(event) =>
                    updateCommission('Imitation', parseFloat(event.target.value) || 0)
                  }
                  placeholder="3.0"
                  className="h-12"
                />
              </FieldRow>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/20 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {hasChanges ? "You have unsaved changes" : "All changes saved"}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                disabled={!hasChanges || saving}
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}

interface FieldRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function FieldRow({ label, description, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
      <div className="sm:w-56">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
