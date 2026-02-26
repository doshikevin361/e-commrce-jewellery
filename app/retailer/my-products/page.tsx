'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Loader2, ChevronLeft, ChevronRight, Package, Pencil } from 'lucide-react';
import { toast } from 'react-toastify';

type RetailerProduct = {
  _id: string;
  name: string;
  mainImage: string;
  shortDescription?: string;
  shopName: string;
  sellingPrice: number;
  quantity: number;
  status: string;
  updatedAt: string;
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export default function RetailerMyProductsPage() {
  const [products, setProducts] = useState<RetailerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/retailer/my-products?page=${page}&limit=20&status=${statusFilter}`,
        { credentials: 'include', headers: getAuthHeaders() }
      );
      if (!res.ok) return;
      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
      if (data.pagination) setPagination(data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleStatusChange = async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      const res = await fetch(`/api/retailer/my-products/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts((prev) =>
          prev.map((q) => (q._id === id ? { ...q, status: newStatus } : q))
        );
        toast.success(newStatus === 'active' ? 'Product is now visible on portal' : 'Product hidden from portal');
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <RetailerLayout>
        <div className="p-6 flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </RetailerLayout>
    );
  }

  return (
    <RetailerLayout>
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Products you added via &quot;Sell to Portal&quot; from your B2B orders. Click <strong>Edit</strong> to open the full edit page (same UI as vendor/admin product edit).
        </p>

        {products.length === 0 ? (
          <Card className="bg-white border-0 p-12 text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No products on portal yet.</p>
            <p className="text-sm text-gray-500 mb-6">
              Go to My Orders and click &quot;Sell to Portal&quot; on any B2B order to add its products here.
            </p>
            <Link href="/retailer/orders">
              <Button>
                <Package className="w-4 h-4 mr-2" />
                My Orders
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {products.map((p) => (
                <Card key={p._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                    {p.mainImage ? (
                      <Image
                        src={p.mainImage}
                        alt={p.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {p.shortDescription && <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">{p.shortDescription}</p>}
                    <p className="text-sm text-gray-500 mt-1">Qty: {p.quantity} · {formatCurrency(p.sellingPrice)}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                        {p.status || 'active'}
                      </span>
                      <select
                        value={p.status || 'active'}
                        onChange={(e) => handleStatusChange(p._id, e.target.value as 'active' | 'inactive')}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        disabled={savingId === p._id}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <Button size="sm" variant="outline" asChild className="gap-1">
                        <Link href={`/retailer/my-products/${p._id}/edit`}>
                          <Pencil className="w-4 h-4" /> Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((x) => Math.max(1, x - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((x) => Math.min(pagination.pages, x + 1))}
                  disabled={page >= pagination.pages}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </RetailerLayout>
  );
}
