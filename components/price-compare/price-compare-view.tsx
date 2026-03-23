'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Percent, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type VendorEntry = { vendorId: string; vendorCode: string; commissionPercent: number; isOwn?: boolean; vendorName?: string };
type RetailerEntry = { retailerId: string; retailerCode: string; commissionPercent: number; isOwn?: boolean; retailerName?: string };

type CommissionCompareViewProps = {
  context: 'admin' | 'retailer';
};

function getAuthHeaders(context: 'admin' | 'retailer'): HeadersInit {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (context === 'retailer') {
    const token = localStorage.getItem('retailerToken');
    if (token) h['Authorization'] = `Bearer ${token}`;
  } else {
    const token = localStorage.getItem('adminToken');
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

export function PriceCompareView({ context }: CommissionCompareViewProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<string>('all');
  const [viewType, setViewType] = useState<'vendor' | 'retailer' | 'admin' | null>(null);
  const [shopFilter, setShopFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [vendorRows, setVendorRows] = useState<Array<{ productType: string; category: string; designType: string; metal: string; purityKarat: string; vendors: VendorEntry[] }>>([]);
  const [vendorCommissionRows, setVendorCommissionRows] = useState<Array<{ productType: string; category: string; designType: string; metal: string; purityKarat: string; vendors: VendorEntry[] }>>([]);
  const [retailerCommissionRows, setRetailerCommissionRows] = useState<Array<{ productType: string; category: string; designType: string; metal: string; purityKarat: string; retailers: RetailerEntry[] }>>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
      if (productTypeFilter && productTypeFilter !== 'all') params.set('product_type', productTypeFilter);
      if (context === 'admin' && shopFilter.trim()) params.set('shop', shopFilter.trim());
      const res = await fetch(`/api/commission-compare?${params.toString()}`, {
        credentials: 'include',
        headers: getAuthHeaders(context),
      });
      if (res.status === 401) {
        toast({ title: 'Session expired', description: 'Please log in again', variant: 'destructive' });
        return;
      }
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setViewType(data.viewType ?? null);
      setCategories(Array.isArray(data.categories) ? data.categories : []);
      setProductTypes(Array.isArray(data.productTypes) ? data.productTypes : []);
      if (data.viewType === 'vendor') {
        setVendorRows(Array.isArray(data.rows) ? data.rows : []);
        setVendorCommissionRows([]);
        setRetailerCommissionRows([]);
      } else if (data.viewType === 'retailer') {
        setVendorRows([]);
        setVendorCommissionRows(Array.isArray(data.vendorCommissionRows) ? data.vendorCommissionRows : []);
        setRetailerCommissionRows(Array.isArray(data.retailerCommissionRows) ? data.retailerCommissionRows : []);
      } else if (data.viewType === 'admin') {
        setVendorRows([]);
        setVendorCommissionRows(Array.isArray(data.vendorCommissionRows) ? data.vendorCommissionRows : []);
        setRetailerCommissionRows(Array.isArray(data.retailerCommissionRows) ? data.retailerCommissionRows : []);
      } else {
        setVendorRows([]);
        setVendorCommissionRows([]);
        setRetailerCommissionRows([]);
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load commission comparison', variant: 'destructive' });
      setVendorRows([]);
      setVendorCommissionRows([]);
      setRetailerCommissionRows([]);
    } finally {
      setLoading(false);
    }
  }, [context, categoryFilter, productTypeFilter, shopFilter, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderCombo = (productType: string, category: string, designType: string, metal: string, purityKarat: string) => (
    <span className="text-slate-600 dark:text-slate-400 text-sm">
      {[productType, category, designType, metal, purityKarat].filter(Boolean).join(' · ') || '—'}
    </span>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Percent className="w-7 h-7" />
          Commission Compare
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          {viewType === 'vendor' && 'Compare other vendors’ commission by category/combination. Set your commission competitively in Commission Settings.'}
          {viewType === 'retailer' && 'View vendor commission and all retailers’ commission category-wise. Use this to set your retailer commission in Retailer Commission.'}
          {!viewType && 'Compare commission rates by category and combination.'}
        </p>
      </div>

      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</span>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] bg-white dark:bg-slate-700">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c.toLowerCase()}>{c || '(Uncategorized)'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Product type</span>
            <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
              <SelectTrigger className="w-[160px] bg-white dark:bg-slate-700">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {productTypes.map(t => (
                  <SelectItem key={t} value={t.toLowerCase()}>{t || '—'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {context === 'admin' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Shop</span>
              <Input
                value={shopFilter}
                onChange={(e) => setShopFilter(e.target.value)}
                placeholder="Search shop name..."
                className="w-[220px] bg-white dark:bg-slate-700"
              />
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading...</div>
        ) : viewType === 'vendor' ? (
          vendorRows.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No commission data. Set filters or ask vendors to set commission in Commission Settings.
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Other vendors’ commission by combination. Your row is highlighted. ID = unique code (e.g. V-XXXXXX), not seller name.</p>
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                        <TableHead className="font-semibold text-slate-900 dark:text-white">Type · Category · Design · Metal · Purity</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-white">ID</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-white">Commission %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    {vendorRows.map((row, idx) =>
                      row.vendors.map((v, i) => (
                        <TableRow
                          key={`v-${idx}-${i}`}
                          className={v.isOwn ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500' : ''}
                        >
                          {i === 0 ? (
                            <TableCell rowSpan={row.vendors.length} className="align-top py-2">
                              {renderCombo(row.productType, row.category, row.designType, row.metal, row.purityKarat)}
                            </TableCell>
                          ) : null}
                          <TableCell className="py-2">
                            <span className="flex items-center gap-2">
                              <code className="text-sm bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{v.vendorCode}</code>
                              {v.isOwn && <Badge className="bg-green-600 text-white">You</Badge>}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900 dark:text-white py-2">{v.commissionPercent}%</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )
        ) : viewType === 'retailer' ? (
          <div className="space-y-8">
            {vendorCommissionRows.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Vendor commission (category-wise)</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                        <TableHead className="font-semibold text-slate-900 dark:text-white">Type · Category · Design · Metal · Purity</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-white">ID</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-white">Commission %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorCommissionRows.map((row, idx) =>
                        row.vendors.map((v, i) => (
                          <TableRow key={`vc-${idx}-${i}`}>
                            {i === 0 ? (
                              <TableCell rowSpan={row.vendors.length} className="align-top py-2">
                                {renderCombo(row.productType, row.category, row.designType, row.metal, row.purityKarat)}
                              </TableCell>
                            ) : null}
                            <TableCell className="py-2"><code className="text-sm bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{v.vendorCode}</code></TableCell>
                            <TableCell className="font-semibold py-2">{v.commissionPercent}%</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            {retailerCommissionRows.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Retailer commission (all retailers, category-wise)</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Your row is highlighted. ID = unique code (e.g. R-XXXXXX), not seller name.</p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                        <TableHead className="font-semibold text-slate-900 dark:text-white">Type · Category · Design · Metal · Purity</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-white">ID</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-white">Commission %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retailerCommissionRows.map((row, idx) =>
                        row.retailers.map((r, i) => (
                          <TableRow
                            key={`rc-${idx}-${i}`}
                            className={r.isOwn ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500' : ''}
                          >
                            {i === 0 ? (
                              <TableCell rowSpan={row.retailers.length} className="align-top py-2">
                                {renderCombo(row.productType, row.category, row.designType, row.metal, row.purityKarat)}
                              </TableCell>
                            ) : null}
                            <TableCell className="py-2">
                              <span className="flex items-center gap-2">
                                <code className="text-sm bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{r.retailerCode}</code>
                                {r.isOwn && <Badge className="bg-green-600 text-white">You</Badge>}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold py-2">{r.commissionPercent}%</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            {vendorCommissionRows.length === 0 && retailerCommissionRows.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                No commission data. Adjust filters or set commission in Retailer Commission / Vendor Commission Settings.
              </div>
            )}
          </div>
        ) : viewType === 'admin' ? (
          <div className="space-y-8">
            {vendorCommissionRows.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Vendor commission (with shop name)</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                        <TableHead className="font-semibold text-slate-900 dark:text-white">Type · Category · Design · Metal · Purity</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-white">Shop Name</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-white">ID</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-white">Commission %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorCommissionRows.map((row, idx) =>
                        row.vendors.map((v, i) => (
                          <TableRow key={`avc-${idx}-${i}`}>
                            {i === 0 ? (
                              <TableCell rowSpan={row.vendors.length} className="align-top py-2">
                                {renderCombo(row.productType, row.category, row.designType, row.metal, row.purityKarat)}
                              </TableCell>
                            ) : null}
                            <TableCell className="py-2 font-medium">{v.vendorName || '—'}</TableCell>
                            <TableCell className="py-2"><code className="text-sm bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{v.vendorCode}</code></TableCell>
                            <TableCell className="font-semibold py-2">{v.commissionPercent}%</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            {retailerCommissionRows.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Retailer commission (with shop name)</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                        <TableHead className="font-semibold text-slate-900 dark:text-white">Type · Category · Design · Metal · Purity</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-white">Shop Name</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-white">ID</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-white">Commission %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retailerCommissionRows.map((row, idx) =>
                        row.retailers.map((r, i) => (
                          <TableRow key={`arc-${idx}-${i}`}>
                            {i === 0 ? (
                              <TableCell rowSpan={row.retailers.length} className="align-top py-2">
                                {renderCombo(row.productType, row.category, row.designType, row.metal, row.purityKarat)}
                              </TableCell>
                            ) : null}
                            <TableCell className="py-2 font-medium">{r.retailerName || '—'}</TableCell>
                            <TableCell className="py-2"><code className="text-sm bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{r.retailerCode}</code></TableCell>
                            <TableCell className="font-semibold py-2">{r.commissionPercent}%</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            {vendorCommissionRows.length === 0 && retailerCommissionRows.length === 0 && (
              <div className="py-12 text-center text-slate-500">No commission data for selected filters/shop.</div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">Unable to load commission data. Please log in as vendor or retailer.</div>
        )}
      </Card>
    </div>
  );
}
