'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-toastify';

type CartItem = {
  _id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  displayPrice: number;
  subtotal: number;
  stock: number;
};

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

export default function RetailerCartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/retailer/cart', { credentials: 'include', headers: getAuthHeaders() });
      if (!res.ok) return setItems([]);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const updateQty = async (productId: string, delta: number) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    const newQty = Math.max(1, Math.min(item.stock, item.quantity + delta));
    if (newQty === item.quantity) return;
    setUpdating((p) => new Set(p).add(productId));
    try {
      const res = await fetch('/api/retailer/cart', {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity: newQty }),
      });
      if (res.ok) {
        await fetchCart();
        dispatchCartUpdate();
        toast.success('Quantity updated');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setUpdating((p) => {
        const n = new Set(p);
        n.delete(productId);
        return n;
      });
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const res = await fetch(`/api/retailer/cart?productId=${productId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await fetchCart();
        dispatchCartUpdate();
        toast.success('Item removed from cart');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to remove');
      }
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!confirm('Remove all items from cart?')) return;
    try {
      const res = await fetch('/api/retailer/cart?clearAll=true', {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setItems([]);
        dispatchCartUpdate();
        toast.success('Cart cleared');
      } else {
        toast.error('Failed to clear cart');
      }
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
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

  if (items.length === 0) {
    return (
      <RetailerLayout>
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Cart</h1>
          <Card className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">Your cart is empty.</p>
            <p className="text-sm text-gray-500 mb-6">Add products from the catalog to place an order.</p>
            <Link href="/retailer/products">
              <Button size="lg">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </Card>
        </div>
      </RetailerLayout>
    );
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <RetailerLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cart</h1>
            <p className="text-sm text-gray-500 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearCart} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-1" /> Clear cart
            </Button>
            <Link href="/retailer/products">
              <Button variant="outline" size="sm"><ArrowRight className="w-4 h-4 mr-1" /> Continue Shopping</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.productId} className="p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-24 h-24 bg-gray-100 rounded overflow-hidden shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">—</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{formatCurrency(item.displayPrice)} each</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border rounded-md">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, -1)}
                        disabled={item.quantity <= 1 || updating.has(item.productId)}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 min-w-[2rem] text-center text-sm font-medium">
                        {updating.has(item.productId) ? <Loader2 className="w-4 h-4 animate-spin inline" /> : item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, 1)}
                        disabled={item.quantity >= item.stock || updating.has(item.productId)}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-red-600 text-sm hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <p className="text-sm text-gray-500 mb-3">{items.length} {items.length === 1 ? 'product' : 'products'} ({itemCount} {itemCount === 1 ? 'item' : 'items'})</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>
            <Link href="/retailer/checkout" className="block mt-4">
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
            </Link>
            <Link href="/retailer/products" className="block mt-2">
              <Button variant="outline" className="w-full" size="sm">Continue Shopping</Button>
            </Link>
          </Card>
        </div>
      </div>
    </RetailerLayout>
  );
}
