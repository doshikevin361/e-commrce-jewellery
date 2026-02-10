"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Loader2, RefreshCw, Plus, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { defaultSiteSettings, type SiteSettings, type CommissionRow } from "@/lib/site-settings";
import { useSettings } from "@/components/settings/settings-provider";
import { MetalPriceManagement } from "./metal-price-management";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PRODUCT_TYPES = ["Gold", "Silver", "Platinum", "Diamonds", "Gemstone", "Imitation"];
const METAL_OPTIONS = ["Gold", "Silver", "Platinum"];
const PURITY_OPTIONS = ["24kt", "22kt", "20kt", "18kt", "14kt", "80%"];

export function PricingSettingsPanel() {
  const { toast } = useToast();
  const { updateLocal, refresh } = useSettings();
  const [formData, setFormData] = useState<SiteSettings>(defaultSiteSettings);
  const [lastSaved, setLastSaved] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [designTypeOptions, setDesignTypeOptions] = useState<{ value: string; label: string }[]>([]);

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
      const commissionRows = Array.isArray(data.commissionRows)
        ? data.commissionRows.map((r: any) => ({
            ...r,
            vendorCommission: typeof r?.vendorCommission === 'number' ? r.vendorCommission : 0,
            platformCommission: typeof r?.platformCommission === 'number' ? r.platformCommission : 0,
          }))
        : [];
      const normalized: SiteSettings = {
        ...defaultSiteSettings,
        ...data,
        commissionRows,
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

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, designRes] = await Promise.all([
          fetch("/api/admin/categories", { cache: "no-store" }),
          fetch("/api/admin/design-types", { cache: "no-store" }),
        ]);
        if (catRes.ok) {
          const d = await catRes.json();
          const list = Array.isArray(d.categories) ? d.categories : [];
          const flatten = (arr: any[], prefix = ""): { value: string; label: string }[] => {
            let out: { value: string; label: string }[] = [];
            for (const c of arr) {
              const name = (c.name || c.slug || String(c._id ?? "")).trim();
              if (name) out.push({ value: name, label: prefix ? `${prefix} > ${name}` : name });
              if (Array.isArray(c.children) && c.children.length) out = out.concat(flatten(c.children, prefix ? `${prefix} > ${name}` : name));
            }
            return out;
          };
          setCategoryOptions(flatten(list));
        }
        if (designRes.ok) {
          const d = await designRes.json();
          const list = Array.isArray(d.designTypes) ? d.designTypes : [];
          setDesignTypeOptions(list.map((item: any) => ({ value: item.name || item._id, label: item.name || item._id })));
        }
      } catch (_) {}
    };
    fetchOptions();
  }, []);

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
        commissionRows: formData.commissionRows ?? [],
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

          <form onSubmit={handleSubmit}>
            <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/20">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Commission by combination
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  When adding a product, vendor commission is set from the matching row (product type + category + design type + metal + purity). Add rows and save.
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900/20">
                      <TableHead className="whitespace-nowrap">Product Type</TableHead>
                      <TableHead className="whitespace-nowrap">Category</TableHead>
                      <TableHead className="whitespace-nowrap">Design Type</TableHead>
                      <TableHead className="whitespace-nowrap">Metal</TableHead>
                      <TableHead className="whitespace-nowrap">Purity</TableHead>
                      <TableHead className="whitespace-nowrap">Vendor (%)</TableHead>
                      <TableHead className="whitespace-nowrap">Platform / Admin (%)</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {((formData.commissionRows ?? []).length === 0 ? [{ productType: "", category: "", designType: "", metal: "", purityKarat: "", vendorCommission: 0, platformCommission: 0 }] : (formData.commissionRows ?? [])).map((row: CommissionRow, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="p-2">
                          <select
                            value={row.productType}
                            onChange={(e) => {
                              const rows = [...(formData.commissionRows ?? [])];
                              if (rows.length <= index) rows.push({ productType: "", category: "", designType: "", metal: "", purityKarat: "", vendorCommission: 0, platformCommission: 0 });
                              rows[index] = { ...rows[index], productType: e.target.value };
                              updateField("commissionRows", rows);
                            }}
                            className="h-9 min-w-[100px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">Select</option>
                            {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </TableCell>
                        <TableCell className="p-2">
                          <select
                            value={row.category}
                            onChange={(e) => {
                              const rows = [...(formData.commissionRows ?? [])];
                              if (rows.length <= index) rows.push({ productType: "", category: "", designType: "", metal: "", purityKarat: "", vendorCommission: 0, platformCommission: 0 });
                              rows[index] = { ...rows[index], category: e.target.value };
                              updateField("commissionRows", rows);
                            }}
                            className="h-9 min-w-[120px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">Select</option>
                            {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </TableCell>
                        <TableCell className="p-2">
                          <select
                            value={row.designType}
                            onChange={(e) => {
                              const rows = [...(formData.commissionRows ?? [])];
                              if (rows.length <= index) rows.push({ productType: "", category: "", designType: "", metal: "", purityKarat: "", vendorCommission: 0, platformCommission: 0 });
                              rows[index] = { ...rows[index], designType: e.target.value };
                              updateField("commissionRows", rows);
                            }}
                            className="h-9 min-w-[110px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">Select</option>
                            {designTypeOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                          </select>
                        </TableCell>
                        <TableCell className="p-2">
                          <select
                            value={row.metal}
                            onChange={(e) => {
                              const rows = [...(formData.commissionRows ?? [])];
                              if (rows.length <= index) rows.push({ productType: "", category: "", designType: "", metal: "", purityKarat: "", vendorCommission: 0, platformCommission: 0 });
                              rows[index] = { ...rows[index], metal: e.target.value };
                              updateField("commissionRows", rows);
                            }}
                            className="h-9 min-w-[100px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">Select</option>
                            {METAL_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </TableCell>
                        <TableCell className="p-2">
                          <select
                            value={row.purityKarat}
                            onChange={(e) => {
                              const rows = [...(formData.commissionRows ?? [])];
                              if (rows.length <= index) rows.push({ productType: "", category: "", designType: "", metal: "", purityKarat: "", vendorCommission: 0, platformCommission: 0 });
                              rows[index] = { ...rows[index], purityKarat: e.target.value };
                              updateField("commissionRows", rows);
                            }}
                            className="h-9 min-w-[90px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">Select</option>
                            {PURITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            min={0}
                            step={0.5}
                            className="h-9 w-24"
                            value={row.vendorCommission || ""}
                            onChange={(e) => {
                              const rows = [...(formData.commissionRows ?? [])];
                              if (rows.length <= index) rows.push({ productType: "", category: "", designType: "", metal: "", purityKarat: "", vendorCommission: 0, platformCommission: 0 });
                              rows[index] = { ...rows[index], vendorCommission: parseFloat(e.target.value) || 0 };
                              updateField("commissionRows", rows);
                            }}
                            placeholder="%"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            min={0}
                            step={0.5}
                            className="h-9 w-24"
                            value={(row as any).platformCommission ?? ""}
                            onChange={(e) => {
                              const rows = [...(formData.commissionRows ?? [])];
                              if (rows.length <= index) rows.push({ productType: "", category: "", designType: "", metal: "", purityKarat: "", vendorCommission: 0, platformCommission: 0 });
                              rows[index] = { ...rows[index], platformCommission: parseFloat(e.target.value) || 0 };
                              updateField("commissionRows", rows);
                            }}
                            placeholder="%"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              const rows = (formData.commissionRows ?? []).filter((_, i) => i !== index);
                              updateField("commissionRows", rows.length ? rows : []);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateField("commissionRows", [...(formData.commissionRows ?? []), { productType: "", category: "", designType: "", metal: "", purityKarat: "", vendorCommission: 0, platformCommission: 0 }])}
                  className="border-slate-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add row
                </Button>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {hasChanges ? "You have unsaved changes" : "All changes saved"}
                  </div>
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
