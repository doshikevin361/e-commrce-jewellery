"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const PRODUCT_TYPES_SETUP = ["Gold", "Silver", "Platinum", "Diamonds", "Gemstone", "Imitation"];
const METAL_OPTIONS = ["Gold", "Silver", "Platinum"];
const PURITY_KARAT_OPTIONS = ["24kt", "22kt", "20kt", "18kt", "14kt", "80%"];
const DEFAULT_DESIGN_TYPES = ["Ring", "Necklace", "Earrings", "Bracelet", "Pendant", "Bangle", "Anklet", "Other"];

interface SetupRow {
  productType: string;
  category: string;
  designType: string;
  metal: string;
  purityKarat: string;
  vendorCommission: number;
}

interface CommissionRates {
  Gold: number;
  Silver: number;
  Platinum: number;
  Gemstone: number;
  Diamonds: number;
  Imitation: number;
}

const DEFAULT_COMMISSIONS: CommissionRates = {
  Gold: 0,
  Silver: 0,
  Platinum: 0,
  Gemstone: 0,
  Diamonds: 0,
  Imitation: 0,
};

interface CategoryOption {
  _id: string;
  name: string;
}

interface VendorCommissionSettingsProps {
  mode?: 'settings' | 'setup';
  onComplete?: () => void;
}

export function VendorCommissionSettings({
  mode = 'settings',
  onComplete,
}: VendorCommissionSettingsProps) {
  const { toast } = useToast();
  const isSetup = mode === 'setup';
  const [userRole, setUserRole] = useState<string>("admin");
  const [commissions, setCommissions] = useState<CommissionRates>(DEFAULT_COMMISSIONS);
  const [lastSaved, setLastSaved] = useState<CommissionRates>(DEFAULT_COMMISSIONS);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [lastSavedProductTypes, setLastSavedProductTypes] = useState<string[]>([]);
  const [lastSavedCategories, setLastSavedCategories] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [flatCategoryOptions, setFlatCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [designTypeOptions, setDesignTypeOptions] = useState<{ value: string; label: string }[]>(
    () => DEFAULT_DESIGN_TYPES.map((name) => ({ value: name, label: name }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [setupRows, setSetupRows] = useState<SetupRow[]>([
    { productType: "", category: "", designType: "", metal: "", purityKarat: "", vendorCommission: 0 },
  ]);
  const hasInitializedVendorRows = useRef(false);

  const isVendor = userRole === "vendor";

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("adminUser") : null;
      if (raw) {
        const u = JSON.parse(raw);
        setUserRole(u?.role || "admin");
      }
    } catch (_) {}
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const flattenCategories = useCallback((list: CategoryOption[] | any[], prefix = ""): { value: string; label: string }[] => {
    let out: { value: string; label: string }[] = [];
    for (const c of list) {
      const name = (c.name || c.slug || String(c._id || "")).trim();
      if (name) out.push({ value: name, label: prefix ? `${prefix} > ${name}` : name });
      if (Array.isArray(c.children) && c.children.length) out = out.concat(flattenCategories(c.children, prefix ? `${prefix} > ${name}` : name));
    }
    return out;
  }, []);

  const loadInitialData = useCallback(async () => {
    const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
    setLoading(true);
    try {
      const [commRes, catRes, designRes] = await Promise.all([
        fetch("/api/vendor/commission-settings", { cache: "no-store", headers }),
        fetch("/api/admin/categories", { cache: "no-store", headers }),
        fetch("/api/admin/design-types", { cache: "no-store", headers }),
      ]);

      if (!commRes.ok) throw new Error("Unable to load commission settings");
      const commData = await commRes.json();
      const loadedCommissions = commData.commissions || DEFAULT_COMMISSIONS;
      const loadedProductTypes = Array.isArray(commData.productTypes) ? commData.productTypes : [];
      const loadedCategories = Array.isArray(commData.categories) ? commData.categories : [];
      const loadedCommissionRows = Array.isArray(commData.commissionRows) ? commData.commissionRows : [];
      setCommissions(loadedCommissions);
      setLastSaved(loadedCommissions);
      setSelectedProductTypes(loadedProductTypes);
      setSelectedCategories(loadedCategories);
      setLastSavedProductTypes(loadedProductTypes);
      setLastSavedCategories(loadedCategories);

      if (loadedCommissionRows.length > 0) {
        const rows: SetupRow[] = loadedCommissionRows.map((r: any) => ({
          productType: String(r?.productType ?? "").trim(),
          category: String(r?.category ?? "").trim(),
          designType: String(r?.designType ?? "").trim(),
          metal: String(r?.metal ?? "").trim(),
          purityKarat: String(r?.purityKarat ?? "").trim(),
          vendorCommission: typeof r?.vendorCommission === "number" ? r.vendorCommission : 0,
        }));
        setSetupRows(rows);
        hasInitializedVendorRows.current = true;
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        const options = Array.isArray(catData.categories) ? catData.categories : [];
        setCategoryOptions(options);
        setFlatCategoryOptions(flattenCategories(options));
      }

      if (designRes.ok) {
        try {
          const designData = await designRes.json();
          const list = Array.isArray(designData.designTypes) ? designData.designTypes : [];
          const options = list.length > 0
            ? list.map((item: any) => ({ value: String(item.name || item._id || "").trim(), label: String(item.name || item._id || "").trim() })).filter((o: { value: string }) => o.value)
            : DEFAULT_DESIGN_TYPES.map((name) => ({ value: name, label: name }));
          setDesignTypeOptions(options);
        } catch {
          setDesignTypeOptions(DEFAULT_DESIGN_TYPES.map((name) => ({ value: name, label: name })));
        }
      } else {
        setDesignTypeOptions(DEFAULT_DESIGN_TYPES.map((name) => ({ value: name, label: name })));
      }
    } catch (error) {
      console.error("Commission settings load failed:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, getAuthHeaders, flattenCategories]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!loading && isVendor && !isSetup && selectedProductTypes.length > 0 && !hasInitializedVendorRows.current) {
      hasInitializedVendorRows.current = true;
      const initialRows: SetupRow[] = selectedProductTypes.map((pt) => ({
        productType: pt,
        category: selectedCategories[0] || "",
        designType: "",
        metal: "",
        purityKarat: "",
        vendorCommission: commissions[pt as keyof CommissionRates] ?? 0,
      }));
      if (initialRows.length > 0) setSetupRows(initialRows);
    }
  }, [loading, isVendor, isSetup, selectedProductTypes, selectedCategories, commissions]);

  const addSetupRow = () => {
    setSetupRows((prev) => [
      ...prev,
      { productType: "", category: "", designType: "", metal: "", purityKarat: "", vendorCommission: 0 },
    ]);
  };

  const updateSetupRow = (index: number, field: keyof SetupRow, value: string | number) => {
    setSetupRows((prev) => {
      const next = [...prev];
      if (index >= 0 && index < next.length) next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeSetupRow = (index: number) => {
    setSetupRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) next.push({ productType: "", category: "", designType: "", metal: "", purityKarat: "", vendorCommission: 0 });
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const filled = setupRows.filter(
        (r) =>
          (r.productType?.trim() ?? "") !== "" &&
          (r.category?.trim() ?? "") !== "" &&
          typeof r.vendorCommission === "number" &&
          r.vendorCommission >= 0
      );
      if (filled.length === 0) {
        toast({
          title: "Validation",
          description: "Add at least one row with Product type, Category and Vendor commission %.",
          variant: "destructive",
        });
        return;
      }
      const productTypeCommissions: Record<string, number> = {};
      const productTypes: string[] = [];
      const categories: string[] = [];
      for (const row of filled) {
        const pt = row.productType.trim();
        if (pt && !productTypes.includes(pt)) productTypes.push(pt);
        const cat = row.category.trim();
        if (cat && !categories.includes(cat)) categories.push(cat);
        if (pt) productTypeCommissions[pt] = row.vendorCommission;
      }
      const commissionsPayload = {
        Gold: productTypeCommissions.Gold ?? 0,
        Silver: productTypeCommissions.Silver ?? 0,
        Platinum: productTypeCommissions.Platinum ?? 0,
        Gemstone: productTypeCommissions.Gemstone ?? 0,
        Diamonds: productTypeCommissions.Diamonds ?? 0,
        Imitation: productTypeCommissions.Imitation ?? 0,
      };

      const commissionRowsPayload = filled.map((r) => ({
        productType: r.productType.trim(),
        category: r.category.trim(),
        designType: r.designType.trim(),
        metal: r.metal.trim(),
        purityKarat: r.purityKarat.trim(),
        vendorCommission: r.vendorCommission,
      }));

      setSaving(true);
      try {
        const response = await fetch("/api/vendor/commission-settings", {
          method: "PUT",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            commissions: commissionsPayload,
            productTypes,
            categories,
            commissionRows: commissionRowsPayload,
            markSetupComplete: isSetup,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.error || "Failed to save commission settings");
        }
        toast({
          title: isSetup ? "Setup complete" : "Settings saved",
          description: isSetup ? "Commission setup saved. You can access the dashboard now." : "Commission rates updated successfully.",
          variant: "success",
        });
        if (isSetup && onComplete) onComplete();
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 w-full">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-none">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">Configuration</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {isSetup ? "Commission Setup" : "Pricing & Commission Settings"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {isSetup
            ? "Add one or more product types with category, design, metal, purity and vendor commission. Complete this to access the dashboard."
            : "Manage your commission by product type, category, design, metal, purity. Add or edit rows and save."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-none">
        <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden w-full">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/20">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Product & Commission
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Add one or more rows. Each row defines a product type, category, design, metal, purity and your commission %.
            </p>
          </div>
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900/20">
                  <TableHead className="whitespace-nowrap">Product Type</TableHead>
                  <TableHead className="whitespace-nowrap">Category</TableHead>
                  <TableHead className="whitespace-nowrap">Design Type</TableHead>
                  <TableHead className="whitespace-nowrap">Metal (Gold/Silver)</TableHead>
                  <TableHead className="whitespace-nowrap">Purity / Karat</TableHead>
                  <TableHead className="whitespace-nowrap">Vendor Commission (%)</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {setupRows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="p-2">
                      <select
                        value={row.productType || ""}
                        onChange={(e) => updateSetupRow(index, "productType", e.target.value)}
                        className="h-9 min-w-[100px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Product Type</option>
                        {PRODUCT_TYPES_SETUP.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="p-2">
                      <select
                        value={row.category || ""}
                        onChange={(e) => updateSetupRow(index, "category", e.target.value)}
                        className="h-9 min-w-[120px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Category</option>
                        {flatCategoryOptions.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="p-2">
                      <select
                        value={row.designType || ""}
                        onChange={(e) => updateSetupRow(index, "designType", e.target.value)}
                        className="h-9 min-w-[110px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Design Type</option>
                        {designTypeOptions.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="p-2">
                      <select
                        value={row.metal || ""}
                        onChange={(e) => updateSetupRow(index, "metal", e.target.value)}
                        className="h-9 min-w-[100px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Metal</option>
                        {METAL_OPTIONS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="p-2">
                      <select
                        value={row.purityKarat || ""}
                        onChange={(e) => updateSetupRow(index, "purityKarat", e.target.value)}
                        className="h-9 min-w-[90px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Purity</option>
                        {PURITY_KARAT_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        className="h-9 w-24"
                        value={row.vendorCommission || ""}
                        onChange={(e) => updateSetupRow(index, "vendorCommission", parseFloat(e.target.value) || 0)}
                        placeholder="%"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeSetupRow(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={addSetupRow} className="border-slate-300">
              <Plus className="w-4 h-4 mr-2" />
              Add row
            </Button>
            <Button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isSetup ? (
                "Save and continue"
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
