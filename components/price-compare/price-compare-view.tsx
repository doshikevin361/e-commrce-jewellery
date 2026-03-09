'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type CompareRow = {
  productId: string;
  sellerType: 'vendor' | 'retailer';
  sellerId: string;
  sellerName: string;
  productName: string;
  category: string;
  productType: string;
  price: number;
  isOwn: boolean;
};

type PriceCompareViewProps = {
  /** 'admin' uses admin token (cookie/header), 'retailer' uses retailer token */
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

export function PriceCompareView({ context }: PriceCompareViewProps) {
  const { toast } = useToast();
  const [products, setProducts] = useState<CompareRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<string>('all');
  const [sellerTypeFilter, setSellerTypeFilter] = useState<string>('all'); // all | vendor | retailer

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
      if (productTypeFilter && productTypeFilter !== 'all') params.set('product_type', productTypeFilter);
      if (sellerTypeFilter && sellerTypeFilter !== 'all') params.set('seller_type', sellerTypeFilter);
      const res = await fetch(`/api/price-compare?${params.toString()}`, {
        credentials: 'include',
        headers: getAuthHeaders(context),
      });
      if (res.status === 401) {
        toast({ title: 'Session expired', description: 'Please log in again', variant: 'destructive' });
        return;
      }
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
      setCategories(Array.isArray(data.categories) ? data.categories : []);
      setProductTypes(Array.isArray(data.productTypes) ? data.productTypes : []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load comparison data', variant: 'destructive' });
      setProducts([]);
      setCategories([]);
      setProductTypes([]);
    } finally {
      setLoading(false);
    }
  }, [context, categoryFilter, productTypeFilter, sellerTypeFilter, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatPrice = (n: number) =>
    typeof n === 'number' ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : '—';

  const filtered = products;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-7 h-7" />
          Price Compare
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Compare other vendors’ and retailers’ product rates category-wise. Check rates so you don’t overprice; use this to set your commission and stay competitive.
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
                  <SelectItem key={c} value={c}>{c || '(Uncategorized)'}</SelectItem>
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
                  <SelectItem key={t} value={t}>{t || '—'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Seller</span>
            <Select value={sellerTypeFilter} onValueChange={setSellerTypeFilter}>
              <SelectTrigger className="w-[140px] bg-white dark:bg-slate-700">
                <SelectValue placeholder="All sellers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (Vendor + Retailer)</SelectItem>
                <SelectItem value="vendor">Vendor only</SelectItem>
                <SelectItem value="retailer">Retailer only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No products to compare. Try changing Category, Product type or Seller filters, or ensure vendors/retailers have active products in that category.
          </div>
        ) : (
          <>
            {filtered.some(r => r.isOwn) && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Your own products are highlighted in green. Compare with others to keep your rates and commission competitive.
              </p>
            )}
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <TableHead className="font-semibold text-slate-900 dark:text-white">Category</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-white">Product</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-white">Type</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-white">Seller</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-white">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row, idx) => (
                  <TableRow
                    key={`${row.sellerType}-${row.productId}-${idx}`}
                    className={row.isOwn ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500' : ''}
                  >
                    <TableCell className="text-slate-700 dark:text-slate-300">{row.category || '—'}</TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-white">{row.productName || '—'}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{row.productType || '—'}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <Badge variant={row.sellerType === 'vendor' ? 'secondary' : 'outline'}>
                          {row.sellerType === 'vendor' ? 'Vendor' : 'Retailer'}
                        </Badge>
                        {row.sellerName}
                        {row.isOwn && (
                          <Badge className="bg-green-600 text-white">You</Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">{formatPrice(row.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
