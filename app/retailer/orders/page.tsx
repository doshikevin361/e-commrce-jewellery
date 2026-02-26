'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ChevronLeft, ChevronRight, Loader2, Store } from 'lucide-react';
import { toast } from 'react-toastify';

type Order = {
  _id: string;
  orderId: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  items: Array<{ productName: string; quantity: number; price: number; subtotal: number }>;
  shippingAddress?: { fullName: string; city: string; state: string };
  createdAt: string;
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function RetailerOrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [sellingOrderId, setSellingOrderId] = useState<string | null>(null);

  const handleSellToPortal = async (orderId: string) => {
    setSellingOrderId(orderId);
    try {
      const res = await fetch(`/api/retailer/orders/${encodeURIComponent(orderId)}/sell-to-portal`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'All products added to your portal listing.');
      } else {
        toast.error(data.error || 'Failed to add products to portal');
      }
    } catch {
      toast.error('Failed to add products to portal');
    } finally {
      setSellingOrderId(null);
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/retailer/orders?page=${page}&limit=20`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      if (data.pagination) setPagination(data.pagination);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const success = searchParams.get('success');
    if (success) {
      toast.success(`Order ${success} placed successfully.`);
      fetchOrders();
    }
  }, [searchParams, fetchOrders]);

  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—');

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

        {orders.length === 0 ? (
          <Card className="bg-white border-0 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You have not placed any orders yet.</p>
            <Link href="/retailer/products">
              <Button><Package className="w-4 h-4 mr-2" /> Browse Products</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order._id} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">Order #{order.orderId}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                          {order.orderStatus}
                        </span>
                        <span className="text-xs text-gray-500">Payment: {order.paymentStatus}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                      {order.shippingAddress && (
                        <p className="text-sm text-gray-600 mt-1">
                          {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-gray-500">{order.items?.length || 0} item(s)</p>
                    </div>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <ul className="mt-4 pt-4 border-t text-sm text-gray-600 space-y-1">
                      {order.items.slice(0, 3).map((item, i) => (
                        <li key={i}>{item.productName} × {item.quantity} — {formatCurrency(item.subtotal)}</li>
                      ))}
                      {order.items.length > 3 && <li className="text-gray-500">+{order.items.length - 3} more</li>}
                    </ul>
                  )}
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSellToPortal(order.orderId)}
                      disabled={sellingOrderId === order.orderId}
                    >
                      {sellingOrderId === order.orderId ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Store className="w-4 h-4 mr-2" />
                      )}
                      Sell to Portal
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.pages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}>
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
  );
}

export default function RetailerOrdersPage() {
  return (
    <RetailerLayout>
      <Suspense
        fallback={
          <div className="p-6 flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        }>
        <RetailerOrdersContent />
      </Suspense>
    </RetailerLayout>
  );
}
