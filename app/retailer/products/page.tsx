'use client';

import { useEffect, useState, useCallback } from 'react';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Package, ChevronLeft, ChevronRight, Filter, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-toastify';

type Category = { _id: string; name: string; slug: string };

type Product = {
  _id: string;
  name: string;
  shortDescription?: string;
  sku?: string;
  categoryName?: string;
  categoryId?: string;
  subcategory?: string;
  brand?: string;
  mainImage?: string;
  galleryImages?: string[];
  product_type?: string;
  stock?: number;
  displayPrice?: number;
  originalPrice?: number;
  sellingPrice?: number;
  regularPrice?: number;
  mrp?: number;
  hasDiscount?: boolean;
  discountPercent?: number;
  retailerDiscountPercent?: number;
  retailerPrice?: number;
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  return headers;
}

export default function RetailerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes] = useState<string[]>([
    'Gold',
    'Silver',
    'Platinum',
    'Diamonds',
    'Gemstone',
    'Imitation',
  ]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 24,
    pages: 1,
  });
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const addToCart = async (productId: string) => {
    setAddingToCart(productId);
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
          toast.info('Already in cart. Update quantity in Cart.');
        } else {
          toast.success('Added to cart');
        }
        window.dispatchEvent(new CustomEvent('retailer-cart-update'));
      } else {
        toast.error(data.error || 'Failed to add to cart');
      }
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/retailer/categories', {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
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
      params.set('page', String(page));
      params.set('limit', '24');
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/retailer/products?${params.toString()}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        setProducts([]);
        return;
      }
      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
      if (data.pagination) setPagination(data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, typeFilter, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const hasFilters = categoryFilter !== 'all' || typeFilter !== 'all' || search.trim() !== '';

  return (
    <RetailerLayout>
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
        </div>

        {/* Filters */}
        <Card className="bg-white border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              Filters
            </div>
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-1 min-w-[200px] max-w-sm items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
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
            <Select value={typeFilter} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Product type" />
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
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCategoryFilter('all');
                  setTypeFilter('all');
                  setSearch('');
                  setSearchInput('');
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </Card>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-white overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="bg-white border-0 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No products found. Try changing filters or search.</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => (
                <Card
                  key={p._id}
                  className="bg-white overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square relative bg-gray-100">
                    {p.mainImage ? (
                      <Image
                        src={p.mainImage}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-16 h-16" />
                      </div>
                    )}
                    {p.hasDiscount && p.discountPercent && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded">
                        {p.discountPercent}% off
                      </span>
                    )}
                    {p.retailerDiscountPercent != null && p.retailerDiscountPercent > 0 && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-medium px-2 py-0.5 rounded">
                        B2B {p.retailerDiscountPercent}% off
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {p.categoryName || '—'} {p.product_type ? ` · ${p.product_type}` : ''}
                    </p>
                    <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2">{p.name}</h3>
                    {p.sku && (
                      <p className="text-xs text-gray-400 mt-0.5">SKU: {p.sku}</p>
                    )}
                    <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                      <span className="text-lg font-bold text-gray-900">
                        {p.displayPrice != null
                          ? `₹${Number(p.displayPrice).toLocaleString('en-IN')}`
                          : p.retailerPrice != null
                            ? `₹${Number(p.retailerPrice).toLocaleString('en-IN')}`
                            : p.sellingPrice != null
                              ? `₹${Number(p.sellingPrice).toLocaleString('en-IN')}`
                              : '—'}
                      </span>
                      {(p.retailerDiscountPercent != null && p.retailerDiscountPercent > 0 && p.originalPrice != null) && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{Number(p.originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                      {p.retailerDiscountPercent == null && p.originalPrice != null && p.hasDiscount && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{Number(p.originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Stock: {p.stock != null ? p.stock : '—'}
                    </p>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => addToCart(p._id)}
                      disabled={addingToCart === p._id || (p.stock != null && p.stock < 1)}
                    >
                      {addingToCart === p._id ? (
                        <span className="flex items-center justify-center gap-2"><span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" /> Adding...</span>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600 px-2">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} products)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
                  disabled={page >= pagination.pages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </RetailerLayout>
  );
}
