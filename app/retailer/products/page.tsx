'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Package, Filter, X, Tag, Loader2, ShoppingCart, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface RetailerProduct {
  _id: string;
  name: string;
  sku?: string;
  categoryId?: string;
  categoryName?: string;
  product_type?: string;
  retailerPrice: number;
  originalPrice: number;
  retailerDiscountPercent: number;
  stock: number;
  status: string;
  mainImage?: string;
  urlSlug?: string;
}

interface CategoryOption {
  _id: string;
  name: string;
  slug?: string;
}

interface FilterOption {
  _id: string;
  name: string;
}

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

function dispatchCartUpdate() {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('retailer-cart-update'));
}

export default function RetailerProductsPage() {
  const [products, setProducts] = useState<RetailerProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [designTypeFilter, setDesignTypeFilter] = useState('');
  const [metalColourFilter, setMetalColourFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [karatFilter, setKaratFilter] = useState('');
  const [filterOptions, setFilterOptions] = useState<{
    designTypes: FilterOption[];
    metalColors: FilterOption[];
    genders: string[];
    karats: FilterOption[];
  }>({ designTypes: [], metalColors: [], genders: [], karats: [] });
  const [exportingPdf, setExportingPdf] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/retailer/categories', { credentials: 'include', headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter);
      if (designTypeFilter && designTypeFilter !== 'all') params.set('designType', designTypeFilter);
      if (metalColourFilter && metalColourFilter !== 'all') params.set('metalColour', metalColourFilter);
      if (genderFilter && genderFilter !== 'all') params.set('gender', genderFilter);
      if (karatFilter && karatFilter !== 'all') params.set('karat', karatFilter);
      params.set('page', String(pagination.page));
      params.set('limit', String(pagination.limit));
      const res = await fetch(`/api/retailer/products?${params.toString()}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        window.location.href = '/retailer/login';
        return;
      }
      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
      setPagination(
        data.pagination
          ? {
              page: data.pagination.page ?? 1,
              limit: data.pagination.limit ?? 24,
              total: data.pagination.total ?? 0,
              pages: data.pagination.pages ?? 1,
            }
          : { page: 1, limit: 24, total: 0, pages: 1 }
      );
      if (Array.isArray(data.productTypes)) setProductTypes(data.productTypes);
      if (data.filterOptions) {
        setFilterOptions({
          designTypes: Array.isArray(data.filterOptions.designTypes) ? data.filterOptions.designTypes : [],
          metalColors: Array.isArray(data.filterOptions.metalColors) ? data.filterOptions.metalColors : [],
          genders: Array.isArray(data.filterOptions.genders) ? data.filterOptions.genders : [],
          karats: Array.isArray(data.filterOptions.karats) ? data.filterOptions.karats : [],
        });
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, typeFilter, designTypeFilter, metalColourFilter, genderFilter, karatFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPagination((p) => ({ ...p, page: 1 }));
  };
  const hasFilters =
    search ||
    (categoryFilter && categoryFilter !== 'all') ||
    (typeFilter && typeFilter !== 'all') ||
    (designTypeFilter && designTypeFilter !== 'all') ||
    (metalColourFilter && metalColourFilter !== 'all') ||
    (genderFilter && genderFilter !== 'all') ||
    (karatFilter && karatFilter !== 'all');
  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setCategoryFilter('');
    setTypeFilter('');
    setDesignTypeFilter('');
    setMetalColourFilter('');
    setGenderFilter('');
    setKaratFilter('');
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  const addToCart = async (productId: string) => {
    setAddingId(productId);
    try {
      const res = await fetch('/api/retailer/cart', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.alreadyInCart) {
          toast.info('Already in cart');
        } else {
          toast.success('Added to cart');
        }
        dispatchCartUpdate();
      } else {
        toast.error(data.error || 'Failed to add to cart');
      }
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingId(null);
    }
  };

  const goToPage = (page: number) => {
    setPagination((p) => ({ ...p, page: Math.max(1, Math.min(p.pages, page)) }));
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter);
      if (designTypeFilter && designTypeFilter !== 'all') params.set('designType', designTypeFilter);
      if (metalColourFilter && metalColourFilter !== 'all') params.set('metalColour', metalColourFilter);
      if (genderFilter && genderFilter !== 'all') params.set('gender', genderFilter);
      if (karatFilter && karatFilter !== 'all') params.set('karat', karatFilter);
      params.set('page', '1');
      params.set('limit', '5000');
      const res = await fetch(`/api/retailer/products?${params.toString()}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        toast.error('Failed to load products for PDF');
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data.products) ? data.products : [];
      if (list.length === 0) {
        toast.info('No products to export');
        return;
      }
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const margin = 8;
      const rowH = 10;
      const cols = { name: 50, sku: 22, category: 28, type: 22, price: 24, stock: 14, status: 14 };
      const headers = ['Name', 'SKU', 'Category', 'Type', 'Price', 'Stock', 'Status'];
      let y = margin + 6;
      doc.setFontSize(14);
      doc.text('B2B Catalog - Product List', margin, y);
      y += 6;
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}  |  Total: ${list.length} products`, margin, y);
      y += 8;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.15);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      let x = margin;
      Object.keys(cols).forEach((k, i) => {
        const w = cols[k as keyof typeof cols];
        doc.rect(x, y, w, rowH);
        doc.text(headers[i], x + 1, y + 5);
        x += w;
      });
      y += rowH;
      doc.setFont('helvetica', 'normal');
      const formatPrice = (n: number) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');
      for (let i = 0; i < list.length; i++) {
        if (y > 198) {
          doc.addPage('a4', 'landscape');
          y = margin;
        }
        const p = list[i];
        x = margin;
        const row = [
          (p.name || '—').slice(0, 38),
          (p.sku || '—').slice(0, 14),
          (p.categoryName || p.categoryId || '—').slice(0, 18),
          (p.product_type || '—').slice(0, 12),
          formatPrice(p.retailerPrice ?? 0),
          String(p.stock ?? '—'),
          (p.status || '—').slice(0, 6),
        ];
        Object.keys(cols).forEach((_, idx) => {
          const w = cols[Object.keys(cols)[idx] as keyof typeof cols];
          doc.rect(x, y, w, rowH);
          doc.setFontSize(6);
          doc.text(String(row[idx] ?? '—'), x + 1, y + 5);
          x += w;
        });
        y += rowH;
      }
      doc.save(`b2b-products_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`PDF downloaded: ${list.length} products`);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Failed to generate PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <RetailerLayout>
      <div className="space-y-6 p-0 bg-slate-50 min-h-full min-w-0 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pt-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">B2B Catalog</h1>
            <p className="text-slate-600 mt-1 text-sm">Browse products and add to cart to place B2B orders. Prices shown are your retailer price (after commission).</p>
          </div>
          {!loading && (
            <div className="flex items-center gap-3">
              {pagination.total > 0 && (
                <span className="text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{pagination.total}</span>
                  <span> product{pagination.total !== 1 ? 's' : ''}</span>
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={exportingPdf || pagination.total === 0}
                onClick={handleExportPdf}
              >
                {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                Download PDF
              </Button>
            </div>
          )}
        </div>

        <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-xl min-w-0 mx-6">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              Filters
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <div className="relative flex-1 min-w-[220px] max-w-sm flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or SKU..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                    className="pl-9 h-9 bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                  />
                </div>
                <Button type="button" size="sm" onClick={applySearch} className="h-9 shrink-0">
                  Search
                </Button>
              </div>
              <Select value={categoryFilter || 'all'} onValueChange={(v) => { setCategoryFilter(v === 'all' ? '' : v); setPagination((p) => ({ ...p, page: 1 })); }}>
                <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200">
                  <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter || 'all'} onValueChange={(v) => { setTypeFilter(v === 'all' ? '' : v); setPagination((p) => ({ ...p, page: 1 })); }}>
                <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200">
                  <Package className="w-4 h-4 text-slate-400 shrink-0" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {productTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={designTypeFilter || 'all'} onValueChange={(v) => { setDesignTypeFilter(v === 'all' ? '' : v); setPagination((p) => ({ ...p, page: 1 })); }}>
                <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200">
                  <SelectValue placeholder="Design Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All design types</SelectItem>
                  {filterOptions.designTypes.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={metalColourFilter || 'all'} onValueChange={(v) => { setMetalColourFilter(v === 'all' ? '' : v); setPagination((p) => ({ ...p, page: 1 })); }}>
                <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200">
                  <SelectValue placeholder="Metal Colour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All metal colours</SelectItem>
                  {filterOptions.metalColors.map((m) => (
                    <SelectItem key={m._id} value={m._id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={genderFilter || 'all'} onValueChange={(v) => { setGenderFilter(v === 'all' ? '' : v); setPagination((p) => ({ ...p, page: 1 })); }}>
                <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genders</SelectItem>
                  {filterOptions.genders.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={karatFilter || 'all'} onValueChange={(v) => { setKaratFilter(v === 'all' ? '' : v); setPagination((p) => ({ ...p, page: 1 })); }}>
                <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200">
                  <SelectValue placeholder="Karat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All karats</SelectItem>
                  {filterOptions.karats.map((k) => (
                    <SelectItem key={k._id} value={k._id}>
                      {k.name}
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

          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin text-slate-400 mb-4" />
                <p className="text-sm font-medium">Loading products...</p>
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
                    : 'There are no products available at the moment.'}
                </p>
                {hasFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((p) => (
                    <Card key={p._id} className="overflow-hidden border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all">
                      <div className="aspect-square relative bg-slate-100">
                        {p.mainImage ? (
                          <Image
                            src={p.mainImage}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="w-16 h-16 text-slate-300" />
                          </div>
                        )}
                        {p.retailerDiscountPercent > 0 && (
                          <span className="absolute top-2 left-2 rounded-md bg-emerald-600 text-white text-xs font-semibold px-2 py-1">
                            {p.retailerDiscountPercent}% B2B off
                          </span>
                        )}
                        {p.stock <= 0 && (
                          <span className="absolute top-2 right-2 rounded-md bg-red-500 text-white text-xs font-semibold px-2 py-1">
                            Out of stock
                          </span>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <p className="font-semibold text-slate-900 line-clamp-2 min-h-[2.5rem]" title={p.name}>
                          {p.name}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {p.product_type && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {p.product_type}
                            </span>
                          )}
                          {p.categoryName && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {p.categoryName}
                            </span>
                          )}
                        </div>
                        {p.sku && (
                          <code className="text-xs text-slate-400 mt-1 block font-mono">{p.sku}</code>
                        )}
                        <div className="mt-3 flex flex-wrap items-baseline gap-2">
                          <span className="font-bold text-slate-900">{formatPrice(p.retailerPrice)}</span>
                          {p.retailerDiscountPercent > 0 && p.originalPrice > p.retailerPrice && (
                            <span className="text-sm text-slate-400 line-through">
                              {formatPrice(p.originalPrice)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Stock: {p.stock}</p>
                        <Button
                          type="button"
                          size="sm"
                          className="w-full mt-3"
                          disabled={p.stock <= 0 || addingId === p._id}
                          onClick={() => addToCart(p._id)}
                        >
                          {addingId === p._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to cart
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => goToPage(pagination.page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-600 px-4">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => goToPage(pagination.page + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="px-6 pb-6">
          <Button variant="outline" asChild>
            <Link href="/retailer/cart" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              View cart
            </Link>
          </Button>
        </div>
      </div>
    </RetailerLayout>
  );
}
