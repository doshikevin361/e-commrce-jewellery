"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Loader2, RefreshCw, Coins, AlertCircle, Percent } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { defaultSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { useSettings } from "@/components/settings/settings-provider";
import { MetalPriceManagement } from "./metal-price-management";

export function PricingSettingsPanel() {
  const { toast } = useToast();
  const { updateLocal, refresh } = useSettings();
  const [formData, setFormData] = useState<SiteSettings>(defaultSiteSettings);
  const [lastSaved, setLastSaved] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasChanges = useMemo(
    () =>
      Object.keys(formData).some(
        (key) =>
          formData[key as keyof SiteSettings] !==
          lastSaved[key as keyof SiteSettings]
      ),
    [formData, lastSaved]
  );

  useEffect(() => {
    // Hide scroll
    document.body.style.overflowY = 'hidden';
  
    // Cleanup when leaving page
    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Unable to load settings");
      }
      const data = await response.json();
      const normalized: SiteSettings = {
        ...defaultSiteSettings,
        ...data,
      };
      setFormData(normalized);
      setLastSaved(normalized);
      setErrors({});
      updateLocal(normalized);
    } catch (error) {
      console.error("[v0] Settings fetch failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, updateLocal]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateField = <K extends keyof SiteSettings>(
    field: K,
    value: SiteSettings[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Missing details",
        description: "Please fill the highlighted fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Failed to update settings");
      }

      const savedData: SiteSettings = {
        siteName: formData.siteName,
        siteTitle: formData.siteTitle,
        tagline: formData.tagline,
        primaryColor: formData.primaryColor,
        accentColor: formData.accentColor,
        logo: formData.logo,
        favicon: formData.favicon,
        productTypeCommissions: formData.productTypeCommissions,
      };
      
      setFormData(savedData);
      setLastSaved(savedData);
      updateLocal(savedData);

      toast({
        title: "Settings saved",
        description: "Commission rates updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("[v0] Settings update failed:", error);
      toast({
        title: "Error",
        description:
        error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(lastSaved);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Configuration
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Pricing & Commission Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage metal prices and product type commission rates.
        </p>
      </div>

      {loading ? (
        <Card className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading settings...</span>
        </div>
        </Card>
      ) : (
        <>
          {/* Metal Price Management */}
          <MetalPriceManagement />

          {/* Product Type Commission Rates */}
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
                      Set specific commission rates for each product type. These will be automatically applied when creating products.
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
                      value={formData.productTypeCommissions?.Gold ?? 5}
                      onChange={(event) =>
                        updateField("productTypeCommissions", {
                          ...formData.productTypeCommissions,
                          Gold: parseFloat(event.target.value) || 0,
                        })
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
                      value={formData.productTypeCommissions?.Silver ?? 4}
                      onChange={(event) =>
                        updateField("productTypeCommissions", {
                          ...formData.productTypeCommissions,
                          Silver: parseFloat(event.target.value) || 0,
                        })
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
                      value={formData.productTypeCommissions?.Platinum ?? 6}
                      onChange={(event) =>
                        updateField("productTypeCommissions", {
                          ...formData.productTypeCommissions,
                          Platinum: parseFloat(event.target.value) || 0,
                        })
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
                      value={formData.productTypeCommissions?.Gemstone ?? 8}
                      onChange={(event) =>
                        updateField("productTypeCommissions", {
                          ...formData.productTypeCommissions,
                          Gemstone: parseFloat(event.target.value) || 0,
                        })
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
                      value={formData.productTypeCommissions?.Diamonds ?? 10}
                      onChange={(event) =>
                        updateField("productTypeCommissions", {
                          ...formData.productTypeCommissions,
                          Diamonds: parseFloat(event.target.value) || 0,
                        })
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
                      value={formData.productTypeCommissions?.Imitation ?? 3}
                      onChange={(event) =>
                        updateField("productTypeCommissions", {
                          ...formData.productTypeCommissions,
                          Imitation: parseFloat(event.target.value) || 0,
                        })
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
        </>
      )}
    </div>
  );
}

interface FieldRowProps {
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  alignTop?: boolean;
  children: ReactNode;
}

function FieldRow({
  label,
  description,
  required,
  error,
  alignTop,
  children,
}: FieldRowProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
      <div className={`sm:w-56 ${alignTop ? "sm:pt-1.5" : ""}`}>
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Label>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="flex-1">
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  );
}
