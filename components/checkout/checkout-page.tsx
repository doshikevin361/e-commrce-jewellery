'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, MapPin, CreditCard, Check, AlertCircle, Plus, Edit2, Trash2, Home, Briefcase, MapPinned, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { PageLoader } from '@/components/common/page-loader';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Address {
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
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export function CheckoutPage() {
  const router = useRouter();
  const { cartItems, fetchCart, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string | null>(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string | null>(null);
  const [useSameAsShipping, setUseSameAsShipping] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showBillingForm, setShowBillingForm] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [newAddress, setNewAddress] = useState<Address>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'home',
    isDefault: false,
  });

  // Check authentication and fetch addresses
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('customerToken');
      const email = localStorage.getItem('customerEmail');
      if (!token) {
        router.push('/login?redirect=/checkout');
      } else {
        setIsAuthenticated(true);
        setCustomerEmail(email || '');
        await fetchAddresses();
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  // Fetch saved addresses
  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('/api/customer/addresses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);

        // Set default address as selected
        const defaultAddress = data.addresses?.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedShippingAddressId(defaultAddress._id);
          setShippingAddress({
            fullName: defaultAddress.fullName,
            phone: defaultAddress.phone,
            addressLine1: defaultAddress.addressLine1,
            addressLine2: defaultAddress.addressLine2 || '',
            city: defaultAddress.city,
            state: defaultAddress.state,
            postalCode: defaultAddress.postalCode,
            country: defaultAddress.country,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      if (cartItems.length === 0) {
        router.push('/cart');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Update billing address when useSameAsShipping changes
  useEffect(() => {
    if (useSameAsShipping) {
      setBillingAddress(shippingAddress);
      setSelectedBillingAddressId(selectedShippingAddressId);
    }
  }, [useSameAsShipping, shippingAddress, selectedShippingAddressId]);

  // Handle address selection
  const handleShippingAddressSelect = (addressId: string) => {
    const address = addresses.find(addr => addr._id === addressId);
    if (address) {
      setSelectedShippingAddressId(addressId);
      setShippingAddress({
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      });
      if (useSameAsShipping) {
        setBillingAddress({
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || '',
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        });
      }
    }
  };

  const handleBillingAddressSelect = (addressId: string) => {
    const address = addresses.find(addr => addr._id === addressId);
    if (address) {
      setSelectedBillingAddressId(addressId);
      setBillingAddress({
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      });
    }
  };

  // Save new address
  const handleSaveAddress = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      const url = editingAddress ? '/api/customer/addresses' : '/api/customer/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingAddress ? { ...newAddress, addressId: editingAddress._id } : newAddress),
      });

      if (response.ok) {
        toast.success(editingAddress ? 'Address updated' : 'Address saved');
        setShowAddressForm(false);
        setEditingAddress(null);
        setNewAddress({
          fullName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          addressType: 'home',
          isDefault: false,
        });
        await fetchAddresses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save address');
      }
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const token = localStorage.getItem('customerToken');
      const response = await fetch(`/api/customer/addresses?addressId=${addressId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Address deleted');
        if (selectedShippingAddressId === addressId) {
          setSelectedShippingAddressId(null);
        }
        if (selectedBillingAddressId === addressId) {
          setSelectedBillingAddressId(null);
        }
        await fetchAddresses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete address');
      }
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  // Edit address
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress({ ...address });
    setShowAddressForm(true);
  };

  // Add new address
  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setNewAddress({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      addressType: 'home',
      isDefault: false,
    });
    setShowAddressForm(true);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.displayPrice * item.quantity, 0);
  const shippingCharges = subtotal > 5000 ? 0 : 100;
  const tax = Math.round(subtotal * 0.03); // 3% GST
  const total = subtotal + shippingCharges + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (showAddressForm) {
      setNewAddress(prev => ({ ...prev, [name]: value }));
    } else if (showBillingForm && !useSameAsShipping) {
      setBillingAddress(prev => ({ ...prev, [name]: value }));
    } else {
      setShippingAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    if (!shippingAddress.fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!shippingAddress.phone.trim() || !/^\d{10}$/.test(shippingAddress.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!shippingAddress.addressLine1.trim()) {
      setError('Please enter your address');
      return false;
    }
    if (!shippingAddress.city.trim()) {
      setError('Please enter your city');
      return false;
    }
    if (!shippingAddress.state.trim()) {
      setError('Please enter your state');
      return false;
    }
    if (!shippingAddress.postalCode.trim() || !/^\d{6}$/.test(shippingAddress.postalCode)) {
      setError('Please enter a valid 6-digit postal code');
      return false;
    }

    if (!useSameAsShipping) {
      if (!billingAddress.fullName.trim()) {
        setError('Please enter billing full name');
        return false;
      }
      if (!billingAddress.phone.trim() || !/^\d{10}$/.test(billingAddress.phone)) {
        setError('Please enter a valid billing phone number');
        return false;
      }
      if (!billingAddress.addressLine1.trim()) {
        setError('Please enter billing address');
        return false;
      }
      if (!billingAddress.city.trim()) {
        setError('Please enter billing city');
        return false;
      }
      if (!billingAddress.state.trim()) {
        setError('Please enter billing state');
        return false;
      }
      if (!billingAddress.postalCode.trim() || !/^\d{6}$/.test(billingAddress.postalCode)) {
        setError('Please enter a valid billing postal code');
        return false;
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!razorpayLoaded) {
      toast.error('Payment gateway is loading. Please wait...');
      setError('Payment gateway is loading. Please wait...');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      toast.loading('Creating payment order...', { id: 'payment-order' });

      // Create Razorpay order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            customer_email: customerEmail,
            customer_name: shippingAddress.fullName,
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        const errorMsg = orderData.details || orderData.error || 'Failed to create payment order';
        toast.error(errorMsg, { id: 'payment-order' });
        throw new Error(errorMsg);
      }

      toast.success('Payment gateway ready', { id: 'payment-order' });

      // Prepare order data for after payment
      const fullOrderData = {
        customerEmail: customerEmail,
        customerName: shippingAddress.fullName,
        items: cartItems.map(item => ({
          product: item._id,
          productName: item.title,
          productImage: item.image,
          quantity: item.quantity,
          price: item.displayPrice,
          subtotal: item.displayPrice * item.quantity,
        })),
        subtotal,
        shippingCharges,
        tax,
        total,
        shippingAddress,
        billingAddress: useSameAsShipping ? shippingAddress : billingAddress,
      };

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Jewellery Store',
        description: `Order Payment - ₹${total.toLocaleString()}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            toast.loading('Verifying payment...', { id: 'payment-verify' });

            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: fullOrderData,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              toast.success('Payment successful! Order placed.', { id: 'payment-verify' });

              // Clear cart from database and local state
              try {
                await clearCart();
                console.log('[Checkout] Cart cleared after successful payment');
              } catch (cartError) {
                console.error('[Checkout] Error clearing cart:', cartError);
              }

              setTimeout(() => {
                router.push(`/order-success?orderId=${verifyData.orderId}`);
              }, 500);
            } else {
              const errorMsg = verifyData.error || verifyData.details || 'Payment verification failed';
              toast.error(errorMsg, { id: 'payment-verify' });
              setError(errorMsg);
              setIsProcessing(false);
            }
          } catch (err: any) {
            console.error('Payment verification error:', err);
            const errorMsg = err.message || 'Payment verification failed. Please contact support.';
            toast.error(errorMsg, { id: 'payment-verify' });
            setError(errorMsg);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: customerEmail,
          contact: shippingAddress.phone,
        },
        notes: {
          address: `${shippingAddress.addressLine1}, ${shippingAddress.city}`,
        },
        theme: {
          color: '#1F3B29',
        },
        modal: {
          ondismiss: function () {
            toast.dismiss('payment-order');
            toast.dismiss('payment-verify');
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response);
        const errorMsg = response.error?.description || 'Payment failed. Please try again.';
        toast.error(errorMsg);
        setError(errorMsg);
        setIsProcessing(false);
      });

      razorpay.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMsg = err.message || 'Failed to process payment. Please try again.';
      toast.error(errorMsg);
      setError(errorMsg);
      setIsProcessing(false);
    }
  };

  const getAddressIcon = (type?: string) => {
    switch (type) {
      case 'home':
        return <Home size={16} />;
      case 'work':
        return <Briefcase size={16} />;
      default:
        return <MapPinned size={16} />;
    }
  };

  if (loading || !isAuthenticated) {
    return <PageLoader message='Loading checkout...' />;
  }

  if (cartItems.length === 0) {
    return <PageLoader message='Redirecting...' />;
  }

  return (
    <div className='mx-auto w-full max-w-[1440px] px-4  py-6 sm:py-8 md:py-10'>
      <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-web mb-6 sm:mb-8'>Checkout</h1>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8'>
        {/* Left Column - Addresses and Payment */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Shipping Address Section */}
          <div className='bg-white border rounded-xl p-4 sm:p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-2'>
                <MapPin className='text-web' size={24} />
                <h2 className='text-xl font-bold text-web'>Shipping Address</h2>
              </div>
              <button
                onClick={handleAddNewAddress}
                className='flex items-center gap-2 px-4 py-2 bg-web text-white rounded-lg hover:bg-web transition-colors text-sm font-medium'>
                <Plus size={16} />
                Add New
              </button>
            </div>

            {error && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700'>
                <AlertCircle size={20} />
                <p className='text-sm'>{error}</p>
              </div>
            )}

            {/* Saved Addresses */}
            {addresses.length > 0 && !showAddressForm && (
              <div className='space-y-3 mb-4'>
                {addresses.map(address => (
                  <div
                    key={address._id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedShippingAddressId === address._id ? 'border-web bg-gray-100' : 'border-[#E6D3C2] hover:border-web'
                    }`}
                    onClick={() => handleShippingAddressSelect(address._id!)}>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          {getAddressIcon(address.addressType)}
                          <span className='font-semibold text-web'>{address.fullName}</span>
                          {address.isDefault && <span className='text-xs bg-web text-white px-2 py-0.5 rounded'>Default</span>}
                        </div>
                        <p className='text-sm text-black'>{address.phone}</p>
                        <p className='text-sm text-black mt-1'>
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                        </p>
                        <p className='text-sm text-black'>
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                      </div>
                      <div className='flex gap-2 ml-4' onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditAddress(address)}
                          className='p-2 text-web hover:bg-gray-100 rounded transition-colors'>
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address._id!)}
                          className='p-2 text-red-500 hover:bg-red-50 rounded transition-colors'>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Address Form */}
            {showAddressForm ? (
              <div className='space-y-4 border-t pt-4'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-semibold text-web'>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                  <button
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                    className='p-2 hover:bg-gray-100 rounded'>
                    <X size={20} />
                  </button>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-web mb-2'>
                      Full Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='fullName'
                      value={newAddress.fullName}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                      placeholder='John Doe'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-web mb-2'>
                      Phone Number <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='tel'
                      name='phone'
                      value={newAddress.phone}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                      placeholder='9876543210'
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-web mb-2'>
                    Address Line 1 <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='addressLine1'
                    value={newAddress.addressLine1}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                    placeholder='House No., Building Name'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-web mb-2'>Address Line 2</label>
                  <input
                    type='text'
                    name='addressLine2'
                    value={newAddress.addressLine2}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                    placeholder='Road Name, Area, Colony'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-web mb-2'>
                      City <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='city'
                      value={newAddress.city}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                      placeholder='Mumbai'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-web mb-2'>
                      State <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='state'
                      value={newAddress.state}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                      placeholder='Maharashtra'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-web mb-2'>
                      Postal Code <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='postalCode'
                      value={newAddress.postalCode}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                      placeholder='400001'
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-web mb-2'>Address Type</label>
                    <select
                      name='addressType'
                      value={newAddress.addressType}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'>
                      <option value='home'>Home</option>
                      <option value='work'>Work</option>
                      <option value='other'>Other</option>
                    </select>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='setDefault'
                    checked={newAddress.isDefault}
                    onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    className='w-4 h-4 text-web border-[#E6D3C2] rounded focus:ring-web'
                  />
                  <label htmlFor='setDefault' className='text-sm text-black'>
                    Set as default address
                  </label>
                </div>

                <div className='flex gap-3 pt-2'>
                  <button
                    onClick={handleSaveAddress}
                    className='flex-1 px-4 py-2 bg-web text-white rounded-lg hover:bg-[#2a4d3a] transition-colors font-medium'>
                    Save Address
                  </button>
                  <button
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                    className='px-4 py-2 border border-[#E6D3C2] text-web rounded-lg hover:bg-gray-50 transition-colors'>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Manual Address Entry (if no saved addresses) */
              addresses.length === 0 && (
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-web mb-2'>
                        Full Name <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='fullName'
                        value={shippingAddress.fullName}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                        placeholder='John Doe'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-web mb-2'>
                        Phone Number <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='tel'
                        name='phone'
                        value={shippingAddress.phone}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                        placeholder='9876543210'
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-web mb-2'>
                      Address Line 1 <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='addressLine1'
                      value={shippingAddress.addressLine1}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                      placeholder='House No., Building Name'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-web mb-2'>Address Line 2</label>
                    <input
                      type='text'
                      name='addressLine2'
                      value={shippingAddress.addressLine2}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                      placeholder='Road Name, Area, Colony'
                    />
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-web mb-2'>
                        City <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='city'
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                        placeholder='Mumbai'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-web mb-2'>
                        State <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='state'
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                        placeholder='Maharashtra'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-web mb-2'>
                        Postal Code <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='postalCode'
                        value={shippingAddress.postalCode}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                        placeholder='400001'
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-web mb-2'>Country</label>
                      <input
                        type='text'
                        name='country'
                        value={shippingAddress.country}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg bg-gray-50'
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Billing Address Section */}
          <div className='bg-white border rounded-xl p-4 sm:p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-2'>
                <CreditCard className='text-web' size={24} />
                <h2 className='text-xl font-bold text-web'>Billing Address</h2>
              </div>
            </div>

            <div className='mb-4'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={useSameAsShipping}
                  onChange={e => setUseSameAsShipping(e.target.checked)}
                  className='w-4 h-4 text-web border-[#E6D3C2] rounded focus:ring-web'
                />
                <span className='text-sm text-black'>Use same as shipping address</span>
              </label>
            </div>

            {!useSameAsShipping && (
              <div className='space-y-4 border-t pt-4'>
                {/* Saved Billing Addresses */}
                {addresses.length > 0 && !showBillingForm && (
                  <div className='space-y-3 mb-4'>
                    {addresses.map(address => (
                      <div
                        key={address._id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedBillingAddressId === address._id ? 'border-web bg-gray-100' : 'border hover:border-web'
                        }`}
                        onClick={() => handleBillingAddressSelect(address._id!)}>
                        <div className='flex items-center gap-2 mb-2'>
                          {getAddressIcon(address.addressType)}
                          <span className='font-semibold text-web'>{address.fullName}</span>
                        </div>
                        <p className='text-sm text-black'>{address.phone}</p>
                        <p className='text-sm text-black mt-1'>
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                        </p>
                        <p className='text-sm text-black'>
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual Billing Address Entry */}
                {(!showBillingForm && addresses.length === 0) || showBillingForm ? (
                  <div className='space-y-4'>
                    {showBillingForm && (
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='font-semibold text-web'>Enter Billing Address</h3>
                        <button onClick={() => setShowBillingForm(false)} className='p-2 hover:bg-gray-100 rounded'>
                          <X size={20} />
                        </button>
                      </div>
                    )}

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-web mb-2'>
                          Full Name <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='text'
                          name='fullName'
                          value={billingAddress.fullName}
                          onChange={handleInputChange}
                          className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                          placeholder='John Doe'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-web mb-2'>
                          Phone Number <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='tel'
                          name='phone'
                          value={billingAddress.phone}
                          onChange={handleInputChange}
                          className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                          placeholder='9876543210'
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-web mb-2'>
                        Address Line 1 <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='addressLine1'
                        value={billingAddress.addressLine1}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                        placeholder='House No., Building Name'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-web mb-2'>Address Line 2</label>
                      <input
                        type='text'
                        name='addressLine2'
                        value={billingAddress.addressLine2}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                        placeholder='Road Name, Area, Colony'
                      />
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-web mb-2'>
                          City <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='text'
                          name='city'
                          value={billingAddress.city}
                          onChange={handleInputChange}
                          className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                          placeholder='Mumbai'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-web mb-2'>
                          State <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='text'
                          name='state'
                          value={billingAddress.state}
                          onChange={handleInputChange}
                          className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                          placeholder='Maharashtra'
                        />
                      </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-web mb-2'>
                          Postal Code <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='text'
                          name='postalCode'
                          value={billingAddress.postalCode}
                          onChange={handleInputChange}
                          className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-web'
                          placeholder='400001'
                          maxLength={6}
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-web mb-2'>Country</label>
                        <input
                          type='text'
                          name='country'
                          value={billingAddress.country}
                          onChange={handleInputChange}
                          className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg bg-gray-50'
                          readOnly
                        />
                      </div>
                    </div>

                    {showBillingForm && (
                      <button
                        onClick={() => setShowBillingForm(false)}
                        className='w-full px-4 py-2 border border-[#E6D3C2] text-web rounded-lg hover:bg-gray-50 transition-colors'>
                        Done
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowBillingForm(true)}
                    className='w-full px-4 py-2 border-2 border-dashed border-[#E6D3C2] text-web rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2'>
                    <Plus size={16} />
                    Enter Different Billing Address
                  </button>
                )}
              </div>
            )}

            {useSameAsShipping && (
              <div className='p-4 bg-gray-100 rounded-lg border border-[#E6D3C2]'>
                <p className='text-sm text-black'>Billing address will be the same as shipping address</p>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className='bg-white border rounded-xl p-4 sm:p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <CreditCard className='text-web' size={24} />
              <h2 className='text-xl font-bold text-web'>Payment Method</h2>
            </div>
            <div className='flex items-center gap-3 p-4 border-2 border-web rounded-lg bg-gray-100'>
              <Check className='text-web' size={20} />
              <div>
                <p className='font-semibold text-web'>Razorpay</p>
                <p className='text-sm text-black'>Pay securely via UPI, Cards, Netbanking & more</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className='lg:col-span-1'>
          <div className='bg-white border-2 border rounded-xl p-4 sm:p-6 sticky top-24'>
            <h2 className='text-xl font-bold text-web mb-4'>Order Summary</h2>

            <div className='space-y-3 mb-4 max-h-60 overflow-y-auto'>
              {cartItems.map(item => (
                <div key={item._id} className='flex gap-3'>
                  <div className='relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0'>
                    <Image src={item.image} alt={item.title} fill sizes='64px' className='object-cover' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-web truncate'>{item.title}</p>
                    <p className='text-xs text-black'>Qty: {item.quantity}</p>
                    <p className='text-sm font-bold text-web'>₹{(item.displayPrice * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className='space-y-3 pt-4 border-t border-[#E6D3C2]'>
              <div className='flex justify-between text-sm text-black'>
                <span>Subtotal</span>
                <span className='font-semibold'>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-sm text-black'>
                <span>Shipping</span>
                <span className='font-semibold'>{shippingCharges === 0 ? 'Free' : `₹${shippingCharges}`}</span>
              </div>
              <div className='flex justify-between text-sm text-black'>
                <span>Tax (GST 3%)</span>
                <span className='font-semibold'>₹{tax.toLocaleString()}</span>
              </div>
              <div className='border-t border-[#E6D3C2] pt-3 flex justify-between text-lg font-bold text-web'>
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing || !razorpayLoaded}
              className='w-full mt-6 rounded-full bg-web px-6 py-3 text-white font-semibold hover:bg-web/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
              {isProcessing ? (
                <>
                  <Loader2 size={20} className='animate-spin' />
                  Processing...
                </>
              ) : !razorpayLoaded ? (
                <>
                  <Loader2 size={20} className='animate-spin' />
                  Loading Payment Gateway...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Pay ₹{total.toLocaleString()}
                </>
              )}
            </button>

            <p className='text-xs text-center text-black mt-4'>Your payment information is secure and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}
