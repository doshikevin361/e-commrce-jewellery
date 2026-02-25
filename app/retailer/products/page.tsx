'use client';

import { useEffect, useState } from 'react';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Package, Filter, X, Store, Tag, Loader2 } from 'lucide-react';

interface RetailerProduct {
  _id: string;
  name: string;
  sku?: string;
  category: string;
  product_type?: string;
  vendorId?: string;
  vendorName: string;
  price?: number;
  sellingPrice?: number;
  regularPrice?: number;
  stock: number;
  status: string;
  mainImage?: string;
  urlSlug?: string;
  createdAt?: string;
}

export default function RetailerProductsPage() {
  const [products, setProducts] = useState<RetailerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);
    if (vendorFilter) params.set('vendorId', vendorFilter);
    fetch(`/api/retailer/products?${params.toString()}`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/retailer/login';
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, categoryFilter, vendorFilter]);

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
  const vendors = [...new Set(products.map((p) => ({ id: p.vendorId, name: p.vendorName })).filter((v) => v.id))];
  const vendorOptions = Array.from(new Map(vendors.map((v) => [v.id, v.name])).entries());
  const hasFilters = search || categoryFilter || vendorFilter;

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setVendorFilter('');
  };

  const formatPrice = (value?: number) =>
    typeof value === 'number'
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
      : '—';

  const getStockStyle = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-700 border-red-200';
    if (stock <= 10) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  return (
    <RetailerLayout>
      <div className="space-y-6 p-0 bg-slate-50 min-h-full min-w-0 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pt-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vendor Products</h1>
            <p className="text-slate-600 mt-1 text-sm">Browse all products from vendors available for B2B.</p>
          </div>
          {!loading && products.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-medium text-slate-700">{products.length}</span>
              <span>product{products.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-xl min-w-0">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              Filters
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                />
              </div>
              <Select value={categoryFilter || 'all'} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200">
                  <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={vendorFilter || 'all'} onValueChange={(v) => setVendorFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[200px] h-9 bg-white border-slate-200">
                  <Store className="w-4 h-4 text-slate-400 shrink-0" />
                  <SelectValue placeholder="Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All vendors</SelectItem>
                  {vendorOptions.map(([id, name]) => (
                    <SelectItem key={id} value={id!}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin text-slate-400 mb-4" />
                <p className="text-sm font-medium">Loading products...</p>
                <p className="text-xs text-slate-400 mt-1">Fetching from vendors</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">No products found</h3>
                <p className="text-sm text-slate-500 mt-1 text-center max-w-sm">
                  {hasFilters
                    ? 'Try adjusting your filters or search term.'
                    : 'There are no vendor products available at the moment.'}
                </p>
                {hasFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-full min-w-0 overflow-x-auto border-t border-slate-100">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-50/80">
                      <TableHead className="py-4 px-5 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                        Product
                      </TableHead>
                      <TableHead className="py-4 px-5 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                        SKU
                      </TableHead>
                      <TableHead className="py-4 px-5 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                        Category
                      </TableHead>
                      <TableHead className="py-4 px-5 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                        Vendor
                      </TableHead>
                      <TableHead className="py-4 px-5 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                        Price
                      </TableHead>
                      <TableHead className="py-4 px-5 font-semibold text-slate-800 text-xs uppercase tracking-wider text-center">
                        Stock
                      </TableHead>
                      <TableHead className="py-4 px-5 font-semibold text-slate-800 text-xs uppercase tracking-wider text-center">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow
                        key={p._id}
                        className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors last:border-0"
                      >
                        <TableCell className="py-4 px-5">
                          <div className="flex items-center gap-4">
                            {p.mainImage ? (
                              <img
                                src={p.mainImage}
                                alt={p.name}
                                className="w-14 h-14 rounded-xl border border-slate-200 object-cover shadow-sm"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                                <Package className="w-7 h-7 text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate max-w-[220px]" title={p.name}>
                                {p.name}
                              </p>
                              {p.product_type && (
                                <span className="inline-block mt-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {p.product_type}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-5">
                          <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded font-mono">
                            {p.sku || '—'}
                          </code>
                        </TableCell>
                        <TableCell className="py-4 px-5">
                          <span className="text-sm text-slate-600">{p.category || '—'}</span>
                        </TableCell>
                        <TableCell className="py-4 px-5">
                          <span className="flex items-center gap-1.5 text-sm text-slate-700">
                            <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {p.vendorName}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-5">
                          <span className="font-semibold text-slate-900">{formatPrice(p.sellingPrice ?? p.price)}</span>
                        </TableCell>
                        <TableCell className="py-4 px-5 text-center">
                          <span
                            className={`inline-flex items-center justify-center min-w-9 px-2 py-1 text-xs font-semibold rounded-lg border ${getStockStyle(
                              p.stock
                            )}`}
                          >
                            {p.stock}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-5 text-center">
                          <span
                            className={
                              p.status === 'active'
                                ? 'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200'
                            }
                          >
                            {p.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RetailerLayout>
  );
}
