'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Package,
  ShoppingBag,
  ArrowRight,
  Loader2,
  FileText,
  CreditCard,
} from 'lucide-react';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

type OrderSummary = {
  _id: string;
  orderId: string;
  total: number;
  orderStatus: string;
  paymentStatus?: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function RetailerDashboardClient() {
  const [user, setUser] = useState<{
    fullName?: string;
    companyName?: string;
    email?: string;
  } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [cartRes, ordersRes] = await Promise.all([
        fetch('/api/retailer/cart', { credentials: 'include', headers: getAuthHeaders() }),
        fetch('/api/retailer/orders?page=1&limit=10', { credentials: 'include', headers: getAuthHeaders() }),
      ]);

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        const items = Array.isArray(cartData.items) ? cartData.items : [];
        setCartCount(items.reduce((s: number, i: { quantity?: number }) => s + (i.quantity || 1), 0));
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const orders = Array.isArray(ordersData.orders) ? ordersData.orders : [];
        setOrdersCount(ordersData.pagination?.total ?? orders.length);
        setRecentOrders(orders.slice(0, 5));
      }
    } catch {
      setCartCount(0);
      setOrdersCount(0);
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const u = localStorage.getItem('retailerUser');
      if (u) setUser(JSON.parse(u));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const formatDate = (d: string) => {
    if (!d) return '—';
    const date = new Date(d);
    const datePart = date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
    const timePart = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${datePart} · ${timePart}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const displayName = user?.companyName || user?.fullName || 'Retailer';
  const hasNoOrders = recentOrders.length === 0 && ordersCount === 0;

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">
            Welcome back, <span className="font-medium text-gray-900">{displayName}</span>
            {user?.email && <span className="text-gray-500"> · {user.email}</span>}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/retailer/products">
          <Card className="bg-white p-6 hover:shadow-md hover:border-gray-300 transition-all border border-gray-200 cursor-pointer h-full">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-100">
                <ShoppingBag className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Product Catalog</p>
                <p className="text-xl font-bold text-gray-900">Browse & order</p>
              </div>
            </div>
            <p className="text-sm text-amber-600 font-medium mt-4 flex items-center gap-1">
              Add to cart <ArrowRight className="w-4 h-4" />
            </p>
          </Card>
        </Link>
        <Link href="/retailer/cart">
          <Card className="bg-white p-6 hover:shadow-md hover:border-gray-300 transition-all border border-gray-200 cursor-pointer h-full">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100">
                <ShoppingCart className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cart</p>
                <p className="text-xl font-bold text-gray-900">{cartCount} items</p>
              </div>
            </div>
            <p className="text-sm text-emerald-600 font-medium mt-4 flex items-center gap-1">
              View cart <ArrowRight className="w-4 h-4" />
            </p>
          </Card>
        </Link>
        <Link href="/retailer/orders">
          <Card className="bg-white p-6 hover:shadow-md hover:border-gray-300 transition-all border border-gray-200 cursor-pointer h-full">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{ordersCount}</p>
              </div>
            </div>
            <p className="text-sm text-blue-600 font-medium mt-4 flex items-center gap-1">
              My orders <ArrowRight className="w-4 h-4" />
            </p>
          </Card>
        </Link>
      </div>

      {/* Get started (when no orders) */}
      {hasNoOrders && (
        <Card className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Get started</h2>
          <p className="text-gray-600 text-sm mb-6">
            Place your first B2B order in three steps. Browse the catalog, add items to cart, and checkout with COD or online payment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 flex-1 p-4 rounded-lg bg-gray-50 border border-gray-100">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-sm">1</span>
              <div>
                <p className="font-medium text-gray-900">Browse products</p>
                <p className="text-sm text-gray-500">Filter by category and type</p>
              </div>
              <Link href="/retailer/products" className="ml-auto">
                <Button size="sm">Go</Button>
              </Link>
            </div>
            <div className="flex items-center gap-3 flex-1 p-4 rounded-lg bg-gray-50 border border-gray-100">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">2</span>
              <div>
                <p className="font-medium text-gray-900">Add to cart</p>
                <p className="text-sm text-gray-500">B2B prices with commission</p>
              </div>
              <Link href={cartCount > 0 ? '/retailer/cart' : '/retailer/products'} className="ml-auto">
                <Button size="sm" variant="outline">{cartCount > 0 ? 'View cart' : 'Browse'}</Button>
              </Link>
            </div>
            <div className="flex items-center gap-3 flex-1 p-4 rounded-lg bg-gray-50 border border-gray-100">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">3</span>
              <div>
                <p className="font-medium text-gray-900">Checkout</p>
                <p className="text-sm text-gray-500">COD or Razorpay</p>
              </div>
              <Link href="/retailer/checkout" className="ml-auto">
                <Button size="sm" variant="outline">Checkout</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <Card className="bg-white border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/retailer/products">
            <Button size="default">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
          </Link>
          <Link href="/retailer/cart">
            <Button variant="outline" size="default">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart {cartCount > 0 && `(${cartCount})`}
            </Button>
          </Link>
          <Link href="/retailer/checkout">
            <Button variant="outline" size="default">
              <CreditCard className="w-4 h-4 mr-2" />
              Checkout
            </Button>
          </Link>
          <Link href="/retailer/orders">
            <Button variant="outline" size="default">
              <Package className="w-4 h-4 mr-2" />
              My Orders
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent orders */}
      <Card className="bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          {ordersCount > 0 && (
            <Link href="/retailer/orders">
              <Button variant="ghost" size="sm">View all ({ordersCount})</Button>
            </Link>
          )}
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No orders yet.</p>
            <p className="text-gray-400 text-xs mt-1">Browse products and place your first order.</p>
            <Link href="/retailer/products" className="inline-block mt-4">
              <Button size="sm">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500 font-medium">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4 text-right">Total</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4">
                      <Link href="/retailer/orders" className="font-medium text-gray-900 hover:underline">
                        #{order.orderId}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
