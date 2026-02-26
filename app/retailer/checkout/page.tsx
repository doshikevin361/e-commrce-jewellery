'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, CreditCard, Plus, Edit2, Trash2, Home, Briefcase, MapPinned, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Address = {
  _id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType?: 'home' | 'work' | 'other';
  isDefault?: boolean;
};

type ShippingAddress = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type CartItem = {
  productId: string;
  _id?: string;
  name: string;
  image?: string;
  quantity: number;
  displayPrice: number;
  subtotal: number;
};

const emptyAddress: ShippingAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

function getAddressIcon(type?: string) {
  switch (type) {
    case 'home': return <Home size={16} />;
    case 'work': return <Briefcase size={16} />;
    default: return <MapPinned size={16} />;
  }
}

export default function RetailerCheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(null);
  const [useSameAsShipping, setUseSameAsShipping] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(emptyAddress);
  const [billingAddress, setBillingAddress] = useState<ShippingAddress>(emptyAddress);
  const [newAddress, setNewAddress] = useState<Address>({ ...emptyAddress, addressType: 'home', isDefault: false });
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch('/api/retailer/addresses', { credentials: 'include', headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      const list = data.addresses || [];
      setAddresses(list);
      const defaultAddr = list.find((a: Address) => a.isDefault);
      if (defaultAddr) {
        setSelectedShippingId(defaultAddr._id!);
        setShippingAddress({
          fullName: defaultAddr.fullName,
          phone: defaultAddr.phone,
          addressLine1: defaultAddr.addressLine1,
          addressLine2: defaultAddr.addressLine2 || '',
          city: defaultAddr.city,
          state: defaultAddr.state,
          postalCode: defaultAddr.postalCode,
          country: defaultAddr.country,
        });
      }
    } catch {}
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/retailer/cart', { credentials: 'include', headers: getAuthHeaders() });
      if (!res.ok) return setCartItems([]);
      const data = await res.json();
      const list = Array.isArray(data.items) ? data.items : [];
      setCartItems(list.map((i: any) => ({
        productId: i.productId || i._id,
        _id: i._id,
        name: i.name,
        image: i.image,
        quantity: i.quantity,
        displayPrice: i.displayPrice,
        subtotal: i.subtotal,
      })));
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); fetchAddresses(); }, [fetchCart, fetchAddresses]);

  useEffect(() => {
    if (paymentMethod !== 'razorpay') return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, [paymentMethod]);

  useEffect(() => {
    if (useSameAsShipping) {
      setBillingAddress(shippingAddress);
      setSelectedBillingId(selectedShippingId);
    }
  }, [useSameAsShipping, shippingAddress, selectedShippingId]);

  const subtotal = cartItems.reduce((s, i) => s + i.subtotal, 0);
  const shippingCharges = 0;
  const tax = 0;
  const total = subtotal + shippingCharges + tax;
  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const setShippingFromAddress = (addr: Address) => {
    setShippingAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
  };

  const setBillingFromAddress = (addr: Address) => {
    setBillingAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
  };

  const handleShippingSelect = (addressId: string) => {
    const addr = addresses.find((a) => a._id === addressId);
    if (addr) {
      setSelectedShippingId(addressId);
      setShippingFromAddress(addr);
      if (useSameAsShipping) setBillingFromAddress(addr);
    }
  };

  const handleBillingSelect = (addressId: string) => {
    const addr = addresses.find((a) => a._id === addressId);
    if (addr) {
      setSelectedBillingId(addressId);
      setBillingFromAddress(addr);
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddress.fullName?.trim() || !newAddress.phone?.trim() || !newAddress.addressLine1?.trim() || !newAddress.city?.trim() || !newAddress.state?.trim() || !newAddress.postalCode?.trim()) {
      toast.error('Fill all required fields');
      return;
    }
    try {
      const url = '/api/retailer/addresses';
      const method = editingAddress ? 'PUT' : 'POST';
      const body = editingAddress ? { ...newAddress, addressId: editingAddress._id } : newAddress;
      const res = await fetch(url, { method, credentials: 'include', headers: getAuthHeaders(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to save address');
        return;
      }
      toast.success(editingAddress ? 'Address updated' : 'Address saved');
      setShowAddressForm(false);
      setEditingAddress(null);
      setNewAddress({ ...emptyAddress, addressType: 'home', isDefault: false });
      await fetchAddresses();
      if (data.address?._id) handleShippingSelect(data.address._id);
    } catch {
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      const res = await fetch(`/api/retailer/addresses?addressId=${addressId}`, { method: 'DELETE', credentials: 'include', headers: getAuthHeaders() });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete');
        return;
      }
      toast.success('Address deleted');
      if (selectedShippingId === addressId) setSelectedShippingId(null);
      if (selectedBillingId === addressId) setSelectedBillingId(null);
      await fetchAddresses();
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const validateForm = (): boolean => {
    setError('');
    if (!shippingAddress.fullName?.trim()) { setError('Enter shipping full name'); return false; }
    if (!shippingAddress.phone?.trim() || !/^\d{10}$/.test(shippingAddress.phone)) { setError('Enter valid 10-digit shipping phone'); return false; }
    if (!shippingAddress.addressLine1?.trim()) { setError('Enter shipping address'); return false; }
    if (!shippingAddress.city?.trim()) { setError('Enter shipping city'); return false; }
    if (!shippingAddress.state?.trim()) { setError('Enter shipping state'); return false; }
    if (!shippingAddress.postalCode?.trim() || !/^\d{6}$/.test(shippingAddress.postalCode)) { setError('Enter valid 6-digit postal code'); return false; }
    if (!useSameAsShipping) {
      if (!billingAddress.fullName?.trim()) { setError('Enter billing full name'); return false; }
      if (!billingAddress.phone?.trim() || !/^\d{10}$/.test(billingAddress.phone)) { setError('Enter valid billing phone'); return false; }
      if (!billingAddress.addressLine1?.trim()) { setError('Enter billing address'); return false; }
      if (!billingAddress.city?.trim()) { setError('Enter billing city'); return false; }
      if (!billingAddress.state?.trim()) { setError('Enter billing state'); return false; }
      if (!billingAddress.postalCode?.trim() || !/^\d{6}$/.test(billingAddress.postalCode)) { setError('Enter valid billing postal code'); return false; }
    }
    return true;
  };

  const placeOrderCOD = async () => {
    if (!validateForm()) return;
    setPlacing(true);
    try {
      const res = await fetch('/api/retailer/orders', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          shippingAddress,
          billingAddress: useSameAsShipping ? shippingAddress : billingAddress,
          orderNotes: orderNotes.trim() || undefined,
          items: cartItems.map((i) => ({ productId: i.productId, price: i.displayPrice, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to place order');
        return;
      }
      toast.success('Order placed successfully!');
      router.push(`/retailer/orders?success=${data.orderId}`);
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const placeOrderRazorpay = async () => {
    if (!validateForm()) return;
    if (!razorpayLoaded) {
      toast.error('Payment gateway loading. Please wait.');
      return;
    }
    setPlacing(true);
    setError('');
    try {
      toast.loading('Creating payment order...', { id: 'pay' });
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `b2b_${Date.now()}`,
          notes: { customer_name: shippingAddress.fullName },
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        toast.dismiss('pay');
        toast.error(orderData.details || orderData.error || 'Failed to create payment order');
        setPlacing(false);
        return;
      }
      toast.success('Opening payment...', { id: 'pay' });

      const fullOrderData = {
        customerEmail: '',
        customerName: shippingAddress.fullName,
        items: cartItems.map((item) => ({
          product: item.productId,
          productId: item.productId,
          productName: item.name,
          productImage: item.image || '',
          quantity: item.quantity,
          price: item.displayPrice,
          subtotal: item.subtotal,
        })),
        subtotal,
        shippingCharges,
        tax,
        discountAmount: 0,
        total,
        shippingAddress,
        billingAddress: useSameAsShipping ? shippingAddress : billingAddress,
        orderNotes: orderNotes.trim() || undefined,
      };

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'B2B Order',
        description: `Order - ${formatCurrency(total)}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            toast.loading('Verifying payment...', { id: 'pay' });
            const verifyRes = await fetch('/api/retailer/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: fullOrderData,
              }),
            });
            const verifyData = await verifyRes.json();
            toast.dismiss('pay');
            if (verifyRes.ok && verifyData.success) {
              toast.success('Payment successful! Order placed.');
              router.push(`/retailer/orders?success=${verifyData.orderId}`);
            } else {
              toast.error(verifyData.error || 'Payment verification failed');
            }
          } catch (e) {
            toast.dismiss('pay');
            toast.error('Verification failed');
          } finally {
            setPlacing(false);
          }
        },
        prefill: { name: shippingAddress.fullName, contact: shippingAddress.phone },
        theme: { color: '#16a34a' },
        modal: { ondismiss: () => { toast.dismiss('pay'); setPlacing(false); } },
      };
      const rp = new window.Razorpay(options);
      rp.on('payment.failed', () => {
        toast.error('Payment failed');
        setPlacing(false);
      });
      rp.open();
    } catch (e) {
      toast.dismiss('pay');
      toast.error('Failed to start payment');
      setPlacing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (paymentMethod === 'cod') placeOrderCOD();
    else placeOrderRazorpay();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleBillingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingAddress((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <RetailerLayout>
        <div className="p-6 flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </RetailerLayout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <RetailerLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>
          <Card className="p-8 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty. Add products first.</p>
            <Button onClick={() => router.push('/retailer/products')}>Browse Products</Button>
          </Card>
        </div>
      </RetailerLayout>
    );
  }

  return (
    <RetailerLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => { setEditingAddress(null); setNewAddress({ ...emptyAddress, addressType: 'home', isDefault: false }); setShowAddressForm(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add New
                </Button>
              </div>

              {addresses.length > 0 && !showAddressForm && (
                <div className="space-y-2 mb-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`p-4 border-2 rounded-lg cursor-pointer flex items-start justify-between ${selectedShippingId === addr._id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => handleShippingSelect(addr._id!)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {getAddressIcon(addr.addressType)}
                        <div>
                          <p className="font-medium text-gray-900">{addr.fullName}</p>
                          <p className="text-sm text-gray-600">{addr.phone}</p>
                          <p className="text-sm text-gray-600">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                          <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                        </div>
                        {addr.isDefault && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Default</span>}
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="p-2 text-gray-500 hover:bg-gray-100 rounded" onClick={() => { setEditingAddress(addr); setNewAddress({ ...addr }); setShowAddressForm(true); }}><Edit2 size={14} /></button>
                        <button type="button" className="p-2 text-red-500 hover:bg-red-50 rounded" onClick={() => handleDeleteAddress(addr._id!)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddressForm ? (
                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                    <button type="button" className="p-2 hover:bg-gray-100 rounded" onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}><X size={18} /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Full Name *</label><Input name="fullName" value={newAddress.fullName} onChange={handleInputChange} placeholder="Full name" /></div>
                    <div><label className="block text-sm font-medium mb-1">Phone *</label><Input name="phone" value={newAddress.phone} onChange={handleInputChange} placeholder="10-digit phone" maxLength={10} /></div>
                    <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Address Line 1 *</label><Input name="addressLine1" value={newAddress.addressLine1} onChange={handleInputChange} placeholder="Address" /></div>
                    <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Address Line 2</label><Input name="addressLine2" value={newAddress.addressLine2} onChange={handleInputChange} placeholder="Optional" /></div>
                    <div><label className="block text-sm font-medium mb-1">City *</label><Input name="city" value={newAddress.city} onChange={handleInputChange} placeholder="City" /></div>
                    <div><label className="block text-sm font-medium mb-1">State *</label><Input name="state" value={newAddress.state} onChange={handleInputChange} placeholder="State" /></div>
                    <div><label className="block text-sm font-medium mb-1">Postal Code *</label><Input name="postalCode" value={newAddress.postalCode} onChange={handleInputChange} placeholder="6 digits" maxLength={6} /></div>
                    <div><label className="block text-sm font-medium mb-1">Country</label><Input name="country" value={newAddress.country} onChange={handleInputChange} /></div>
                    <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Type</label><select name="addressType" value={newAddress.addressType} onChange={handleInputChange} className="w-full rounded-md border border-input px-3 py-2 text-sm"><option value="home">Home</option><option value="work">Work</option><option value="other">Other</option></select></div>
                    <div className="sm:col-span-2 flex items-center gap-2"><input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress((p) => ({ ...p, isDefault: e.target.checked }))} /><span className="text-sm">Set as default</span></div>
                  </div>
                  <div className="flex gap-2"><Button onClick={handleSaveAddress}>Save Address</Button><Button variant="outline" onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}>Cancel</Button></div>
                </div>
              ) : addresses.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Full Name *</label><Input name="fullName" value={shippingAddress.fullName} onChange={handleShippingInputChange} placeholder="Full name" /></div>
                  <div><label className="block text-sm font-medium mb-1">Phone *</label><Input name="phone" value={shippingAddress.phone} onChange={handleShippingInputChange} placeholder="Phone" maxLength={10} /></div>
                  <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Address Line 1 *</label><Input name="addressLine1" value={shippingAddress.addressLine1} onChange={handleShippingInputChange} placeholder="Address" /></div>
                  <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Address Line 2</label><Input name="addressLine2" value={shippingAddress.addressLine2} onChange={handleShippingInputChange} placeholder="Optional" /></div>
                  <div><label className="block text-sm font-medium mb-1">City *</label><Input name="city" value={shippingAddress.city} onChange={handleShippingInputChange} /></div>
                  <div><label className="block text-sm font-medium mb-1">State *</label><Input name="state" value={shippingAddress.state} onChange={handleShippingInputChange} /></div>
                  <div><label className="block text-sm font-medium mb-1">Postal Code *</label><Input name="postalCode" value={shippingAddress.postalCode} onChange={handleShippingInputChange} maxLength={6} /></div>
                  <div><label className="block text-sm font-medium mb-1">Country</label><Input name="country" value={shippingAddress.country} onChange={handleShippingInputChange} /></div>
                </div>
              )}
            </Card>

            {/* Billing Address */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Billing Address</h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input type="checkbox" checked={useSameAsShipping} onChange={(e) => setUseSameAsShipping(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                <span className="text-sm text-gray-700">Same as shipping address</span>
              </label>
              {!useSameAsShipping && (
                <>
                  {addresses.length > 0 && !showBillingForm && (
                    <div className="space-y-2 mb-4">
                      {addresses.map((addr) => (
                        <div key={addr._id} className={`p-4 border-2 rounded-lg cursor-pointer ${selectedBillingId === addr._id ? 'border-green-600 bg-green-50' : 'border-gray-200'}`} onClick={() => handleBillingSelect(addr._id!)}>
                          <p className="font-medium">{addr.fullName}</p>
                          <p className="text-sm text-gray-600">{addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {(showBillingForm || addresses.length === 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                      <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Full Name *</label><Input name="fullName" value={billingAddress.fullName} onChange={handleBillingInputChange} /></div>
                      <div><label className="block text-sm font-medium mb-1">Phone *</label><Input name="phone" value={billingAddress.phone} onChange={handleBillingInputChange} maxLength={10} /></div>
                      <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Address *</label><Input name="addressLine1" value={billingAddress.addressLine1} onChange={handleBillingInputChange} /></div>
                      <div><label className="block text-sm font-medium mb-1">City *</label><Input name="city" value={billingAddress.city} onChange={handleBillingInputChange} /></div>
                      <div><label className="block text-sm font-medium mb-1">State *</label><Input name="state" value={billingAddress.state} onChange={handleBillingInputChange} /></div>
                      <div><label className="block text-sm font-medium mb-1">Postal Code *</label><Input name="postalCode" value={billingAddress.postalCode} onChange={handleBillingInputChange} maxLength={6} /></div>
                      {showBillingForm && <div className="sm:col-span-2"><Button variant="outline" size="sm" onClick={() => setShowBillingForm(false)}>Select from saved</Button></div>}
                      {addresses.length === 0 && !showBillingForm && <div className="sm:col-span-2"><Button variant="outline" size="sm" onClick={() => setShowBillingForm(true)}>Enter different billing</Button></div>}
                    </div>
                  )}
                  {!showBillingForm && addresses.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setShowBillingForm(true)}>Enter new billing address</Button>
                  )}
                </>
              )}
            </Card>

            <Card className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (optional)</label>
              <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Notes for this order" className="w-full min-h-[80px] rounded-md border border-input px-3 py-2 text-sm" />
            </Card>
          </div>

          {/* Order Summary + Payment */}
          <Card className="p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <ul className="space-y-2 text-sm mb-4">
              {cartItems.map((i) => (
                <li key={i.productId} className="flex justify-between">
                  <span className="text-gray-700 truncate max-w-[160px]">{i.name} × {i.quantity}</span>
                  <span className="font-medium">{formatCurrency(i.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shippingCharges === 0 ? 'Free' : formatCurrency(shippingCharges)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Payment Method</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4" />
                  <span>Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-4 h-4" />
                  <span>Razorpay (Card / UPI / Net Banking)</span>
                </label>
              </div>
            </div>

            <Button className="w-full mt-6" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay & Place Order'}
            </Button>
          </Card>
        </div>
      </div>
    </RetailerLayout>
  );
}
