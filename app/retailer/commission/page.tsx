'use client';

import { useCallback, useEffect, useState } from 'react';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const PRODUCT_TYPES = ['Gold', 'Silver', 'Platinum', 'Diamonds', 'Gemstone', 'Imitation'];
const METAL_OPTIONS = ['Gold', 'Silver', 'Platinum'];

type CommissionRow = {
  productType: string;
  category: string;
  designType: string;
  metal: string;
  purityKarat: string;
  retailerCommission: number;
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export default function RetailerCommissionPage() {
  const [commissionRows, setCommissionRows] = useState<CommissionRow[]>([]);
  const [lastSaved, setLastSaved] = useState<CommissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [designTypeOptions, setDesignTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [purityOptions, setPurityOptions] = useState<{ value: string; label: string }[]>([]);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/retailer/commission-settings', { credentials: 'include', headers: getAuthHeaders() });
      if (res.status === 401) {
        window.location.href = '/retailer/login';
        return;
      }
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      const rows = Array.isArray(data.commissionRows) ? data.commissionRows : [];
      setCommissionRows(rows.length ? rows : [{ productType: '', category: '', designType: '', metal: '', purityKarat: '', retailerCommission: 0 }]);
      setLastSaved(rows.length ? rows : []);
    } catch {
      toast.error('Failed to load commission settings');
      setCommissionRows([{ productType: '', category: '', designType: '', metal: '', purityKarat: '', retailerCommission: 0 }]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, designRes, purityRes] = await Promise.all([
          fetch('/api/retailer/categories', { credentials: 'include', headers: getAuthHeaders() }),
          fetch('/api/retailer/design-types', { credentials: 'include', headers: getAuthHeaders() }),
          fetch('/api/retailer/purities', { credentials: 'include', headers: getAuthHeaders() }),
        ]);
        if (catRes.ok) {
          const d = await catRes.json();
          const list = Array.isArray(d.categories) ? d.categories : [];
          setCategoryOptions(list.map((c: { name: string; _id: string }) => ({ value: c.name || '', label: c.name || '' })));
        }
        if (designRes.ok) {
          const d = await designRes.json();
          const list = Array.isArray(d.designTypes) ? d.designTypes : [];
          setDesignTypeOptions(list.map((item: { name: string }) => ({ value: item.name || '', label: item.name || '' })));
        }
        if (purityRes.ok) {
          const d = await purityRes.json();
          const list = Array.isArray(d.purities) ? d.purities : [];
          setPurityOptions(list.map((item: { name: string }) => ({ value: item.name || '', label: item.name || '' })));
        }
      } catch (_) {}
    };
    fetchOptions();
  }, []);

  const updateRow = (index: number, field: keyof CommissionRow, value: string | number) => {
    setCommissionRows((prev) => {
      const rows = [...prev];
      if (rows.length <= index) rows.push({ productType: '', category: '', designType: '', metal: '', purityKarat: '', retailerCommission: 0 });
      rows[index] = { ...rows[index], [field]: value };
      return rows;
    });
  };

  const addRow = () => {
    setCommissionRows((prev) => [...prev, { productType: '', category: '', designType: '', metal: '', purityKarat: '', retailerCommission: 0 }]);
  };

  const removeRow = (index: number) => {
    setCommissionRows((prev) => (prev.length <= 1 ? [{ productType: '', category: '', designType: '', metal: '', purityKarat: '', retailerCommission: 0 }] : prev.filter((_, i) => i !== index)));
  };

  const hasChanges = JSON.stringify(commissionRows) !== JSON.stringify(lastSaved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/retailer/commission-settings', {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ commissionRows }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      setLastSaved(commissionRows);
      toast.success('Commission settings saved. This rate will be added on top of your selling price when customers see your products on the website.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCommissionRows(lastSaved.length ? lastSaved : [{ productType: '', category: '', designType: '', metal: '', purityKarat: '', retailerCommission: 0 }]);
  };

  const rowsToShow = commissionRows.length === 0 ? [{ productType: '', category: '', designType: '', metal: '', purityKarat: '', retailerCommission: 0 }] : commissionRows;

  return (
    <RetailerLayout>
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">Settings</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Retailer Commission</h1>
          <p className="text-slate-600 mt-1">
            Same combination logic as admin. When your products are shown on the website to customers, the price they see = your selling price + this commission %.
          </p>
        </div>

        {loading ? (
          <Card className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60">
                <h2 className="text-lg font-semibold text-slate-900">Commission by combination</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Set your commission % per combination (Product Type, Category, Design Type, Metal, Purity). This percentage is added on top of your selling price when the product is displayed to customers on the website.
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="whitespace-nowrap">Product Type</TableHead>
                      <TableHead className="whitespace-nowrap">Category</TableHead>
                      <TableHead className="whitespace-nowrap">Design Type</TableHead>
                      <TableHead className="whitespace-nowrap">Metal</TableHead>
                      <TableHead className="whitespace-nowrap">Purity</TableHead>
                      <TableHead className="whitespace-nowrap">Retailer Commission (%)</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowsToShow.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="p-2">
                          <select
                            value={row.productType}
                            onChange={(e) => updateRow(index, 'productType', e.target.value)}
                            className="h-9 min-w-[100px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">Select</option>
                            {PRODUCT_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="p-2">
                          <select
                            value={row.category}
                            onChange={(e) => updateRow(index, 'category', e.target.value)}
                            className="h-9 min-w-[120px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">Select</option>
                            {categoryOptions.map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="p-2">
                          <select
                            value={row.designType}
                            onChange={(e) => updateRow(index, 'designType', e.target.value)}
                            className="h-9 min-w-[110px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">Select</option>
                            {designTypeOptions.map((d) => (
                              <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="p-2">
                          <select
                            value={row.metal}
                            onChange={(e) => updateRow(index, 'metal', e.target.value)}
                            className="h-9 min-w-[100px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">Select</option>
                            {METAL_OPTIONS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="p-2">
                          <select
                            value={row.purityKarat}
                            onChange={(e) => updateRow(index, 'purityKarat', e.target.value)}
                            className="h-9 min-w-[90px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">Select</option>
                            {purityOptions.map((p) => (
                              <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            className="h-9 w-24"
                            value={row.retailerCommission === 0 ? '' : row.retailerCommission}
                            onChange={(e) => updateRow(index, 'retailerCommission', parseFloat(e.target.value) || 0)}
                            placeholder="%"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-600 hover:bg-red-50"
                            onClick={() => removeRow(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add row
                </Button>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">{hasChanges ? 'Unsaved changes' : 'Saved'}</span>
                  <Button type="button" variant="outline" size="sm" disabled={!hasChanges || saving} onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save changes
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        )}
      </div>
    </RetailerLayout>
  );
}
