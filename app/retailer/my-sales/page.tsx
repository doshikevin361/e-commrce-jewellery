'use client';

import { useEffect, useState, useCallback } from 'react';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Loader2, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

type SaleOrder = {
  _id: string;
  orderId: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber?: string;
  customerName: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
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

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function RetailerMySalesPage() {
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/retailer/sales?page=${page}&limit=20`, {
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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStartEdit = (order: SaleOrder) => {
    setEditingOrderId(order.orderId);
    setTrackingNumber(order.trackingNumber || '');
    setOrderStatus(order.orderStatus);
  };

  const handleSaveTracking = async () => {
    if (!editingOrderId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/retailer/orders/${encodeURIComponent(editingOrderId)}/tracking`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...(orderStatus ? { orderStatus } : {}),
          ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === editingOrderId
              ? { ...o, orderStatus: data.order?.orderStatus ?? o.orderStatus, trackingNumber: data.order?.trackingNumber ?? trackingNumber }
              : o
          )
        );
        setEditingOrderId(null);
        setTrackingNumber('');
        toast.success('Order updated');
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—');

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
        <h1 className="text-2xl font-bold text-gray-900">My Sales</h1>
        <p className="text-sm text-gray-600">Orders from customers who bought your products on the website. Update status and tracking here.</p>

        {orders.length === 0 ? (
          <Card className="bg-white border-0 p-12 text-center">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No sales orders yet.</p>
            <p className="text-sm text-gray-500 mt-2">When customers buy your products from Partner Stores, they will appear here.</p>
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
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                          {order.orderStatus}
                        </span>
                        <span className="text-xs text-gray-500">Payment: {order.paymentStatus}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                      <p className="text-sm text-gray-600 mt-1">Customer: {order.customerName}</p>
                      {order.shippingAddress && (
                        <p className="text-sm text-gray-600 mt-1">
                          {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                      )}
                      {order.trackingNumber && (
                        <p className="text-sm text-indigo-600 mt-1">Tracking: {order.trackingNumber}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => handleStartEdit(order)}>
                        Update status / Tracking
                      </Button>
                    </div>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <ul className="mt-4 pt-4 border-t text-sm text-gray-600 space-y-1">
                      {order.items.slice(0, 5).map((item, i) => (
                        <li key={i}>{item.productName} × {item.quantity} — {formatCurrency(item.price * item.quantity)}</li>
                      ))}
                      {order.items.length > 5 && <li className="text-gray-500">+{order.items.length - 5} more</li>}
                    </ul>
                  )}

                  {editingOrderId === order.orderId && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap items-end gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <select
                          value={orderStatus}
                          onChange={(e) => setOrderStatus(e.target.value)}
                          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tracking number</label>
                        <Input
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="e.g. 1234567890"
                          className="w-48"
                        />
                      </div>
                      <Button size="sm" onClick={handleSaveTracking} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingOrderId(null)}>Cancel</Button>
                    </div>
                  )}
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
    </RetailerLayout>
  );
}
