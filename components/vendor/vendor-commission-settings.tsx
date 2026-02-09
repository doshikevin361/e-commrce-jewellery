"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Gold: 0,
  Silver: 0,
  Platinum: 0,
  Gemstone: 0,
  Diamonds: 0,
  Imitation: 0,
};

const PRODUCT_TYPE_OPTIONS = [
  { label: "Gold", value: "Gold" },
  { label: "Silver", value: "Silver" },
  { label: "Platinum", value: "Platinum" },
  { label: "Gemstone", value: "Gemstone" },
  { label: "Diamonds", value: "Diamonds" },
  { label: "Imitation", value: "Imitation" },
];

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
  const [commissions, setCommissions] = useState<CommissionRates>(DEFAULT_COMMISSIONS);
  const [lastSaved, setLastSaved] = useState<CommissionRates>(DEFAULT_COMMISSIONS);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [lastSavedProductTypes, setLastSavedProductTypes] = useState<string[]>([]);
  const [lastSavedCategories, setLastSavedCategories] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const hasMatchingSelections = useCallback((current: string[], saved: string[]) => {
    if (current.length !== saved.length) return false;
    const currentSet = new Set(current);
    return saved.every((value) => currentSet.has(value));
  }, []);

  const hasChanges = useMemo(
    () =>
      Object.keys(commissions).some(
        (key) =>
          commissions[key as keyof CommissionRates] !==
          lastSaved[key as keyof CommissionRates]
      ) ||
      !hasMatchingSelections(selectedProductTypes, lastSavedProductTypes) ||
      !hasMatchingSelections(selectedCategories, lastSavedCategories),
    [
      commissions,
      lastSaved,
      selectedProductTypes,
      selectedCategories,
      lastSavedProductTypes,
      lastSavedCategories,
      hasMatchingSelections,
    ]
  );

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
      const loadedProductTypes = Array.isArray(data.productTypes) ? data.productTypes : [];
      const loadedCategories = Array.isArray(data.categories) ? data.categories : [];
      setCommissions(loadedCommissions);
      setLastSaved(loadedCommissions);
      setSelectedProductTypes(loadedProductTypes);
      setSelectedCategories(loadedCategories);
      setLastSavedProductTypes(loadedProductTypes);
      setLastSavedCategories(loadedCategories);
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

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/categories", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load categories");
      }
      const data = await response.json();
      const options = Array.isArray(data.categories) ? data.categories : [];
      setCategoryOptions(options);
    } catch (error) {
      console.error("[v0] Category fetch failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load categories",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const updateCommission = (productType: keyof CommissionRates, value: number) => {
    setCommissions((prev) => ({
      ...prev,
      [productType]: value,
    }));
  };

  const toggleSelection = (
    value: string,
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
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
        body: JSON.stringify({
          commissions,
          productTypes: selectedProductTypes,
          categories: selectedCategories,
          strict: isSetup,
          markSetupComplete: isSetup,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Failed to update commission settings");
      }

      setLastSaved(commissions);
      setLastSavedProductTypes(selectedProductTypes);
      setLastSavedCategories(selectedCategories);

      toast({
        title: isSetup ? "Setup complete" : "Settings saved",
        description: "Commission rates updated successfully",
        variant: "success",
      });

      if (isSetup && onComplete) {
        onComplete();
      }
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
    setSelectedProductTypes(lastSavedProductTypes);
    setSelectedCategories(lastSavedCategories);
  };

  const buildSelectionSummary = (
    selectedValues: string[],
    labelLookup: Record<string, string>,
    placeholder: string
  ) => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    const labels = selectedValues.map((value) => labelLookup[value] || value);
    if (labels.length <= 2) {
      return labels.join(", ");
    }
    const [first, second, ...rest] = labels;
    return `${first}, ${second} +${rest.length}`;
  };

  const productTypeLabelLookup = PRODUCT_TYPE_OPTIONS.reduce<Record<string, string>>(
    (acc, option) => {
      acc[option.value] = option.label;
      return acc;
    },
    {}
  );

  const categoryLabelLookup = categoryOptions.reduce<Record<string, string>>(
    (acc, option) => {
      acc[option._id] = option.name;
      return acc;
    },
    {}
  );

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
    <div className="space-y-6 w-full">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Configuration
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {isSetup ? "Commission Setup" : "Commission Settings"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {isSetup
            ? "Complete your commission setup to access the vendor dashboard."
            : "Set commission rates for each product type. These rates will be automatically applied when you add products."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-primary/20">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Product Scope
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select the product types and categories you plan to sell.
            </p>
          </div>
          <div className="px-6 py-6 space-y-8">
            <FieldRow
              label="Product Types"
              description="Choose one or more product types"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-12 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-primary dark:text-slate-200"
                  >
                    {buildSelectionSummary(
                      selectedProductTypes,
                      productTypeLabelLookup,
                      "Select product types"
                    )}
                    <span className="text-xs text-slate-500">
                      {selectedProductTypes.length > 0 ? selectedProductTypes.length : ""}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72">
                  <DropdownMenuLabel>Product Types</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {PRODUCT_TYPE_OPTIONS.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={selectedProductTypes.includes(option.value)}
                      onCheckedChange={() =>
                        toggleSelection(option.value, setSelectedProductTypes)
                      }
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </FieldRow>

            <FieldRow
              label="Categories"
              description="Select the categories you will list products under"
            >
              {categoryOptions.length === 0 ? (
                <p className="text-sm text-slate-500">No categories available.</p>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-12 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-primary dark:text-slate-200"
                    >
                      {buildSelectionSummary(
                        selectedCategories,
                        categoryLabelLookup,
                        "Select categories"
                      )}
                      <span className="text-xs text-slate-500">
                        {selectedCategories.length > 0 ? selectedCategories.length : ""}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 max-h-64 overflow-y-auto">
                    <DropdownMenuLabel>Categories</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categoryOptions.map((category) => (
                      <DropdownMenuCheckboxItem
                        key={category._id}
                        checked={selectedCategories.includes(category._id)}
                        onCheckedChange={() =>
                          toggleSelection(category._id, setSelectedCategories)
                        }
                      >
                        {category.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </FieldRow>
          </div>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-primary/20">
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

          <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-100 bg-slate-50/95 px-6 py-5 backdrop-blur dark:border-slate-800 dark:bg-primary/80 md:flex-row md:items-center md:justify-between">
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
                  isSetup ? "Save and continue" : "Save changes"
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
