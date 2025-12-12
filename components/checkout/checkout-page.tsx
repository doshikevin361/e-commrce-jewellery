'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, MapPin, CreditCard, Check, AlertCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { PageLoader } from '@/components/common/page-loader';

declare global {
  interface Window {
    Razorpay: any;
  }
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

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('customerToken');
      const email = localStorage.getItem('customerEmail');
      if (!token) {
        router.push('/login?redirect=/checkout');
      } else {
        setIsAuthenticated(true);
        setCustomerEmail(email || '');
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

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
      document.body.removeChild(script);
    };
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.displayPrice * item.quantity, 0);
  const shippingCharges = subtotal > 5000 ? 0 : 100;
  const tax = Math.round(subtotal * 0.03); // 3% GST
  const total = subtotal + shippingCharges + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
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
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    if (!razorpayLoaded) {
      setError('Payment gateway is loading. Please wait...');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create Razorpay order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

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
      };

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Jewellery Store',
        description: 'Order Payment',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
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
              // Clear cart
              await clearCart();
              // Redirect to success page
              router.push(`/order-success?orderId=${verifyData.orderId}`);
            } else {
              setError(verifyData.error || 'Payment verification failed');
              setIsProcessing(false);
            }
          } catch (err: any) {
            console.error('Payment verification error:', err);
            setError('Payment verification failed. Please contact support.');
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
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  if (loading || !isAuthenticated) {
    return <PageLoader message='Loading checkout...' />;
  }

  if (cartItems.length === 0) {
    return <PageLoader message='Redirecting...' />;
  }

  return (
    <div className='mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F3B29] mb-6 sm:mb-8'>Checkout</h1>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8'>
        {/* Shipping Address Form */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white border-2 border-[#E6D3C2] rounded-xl p-4 sm:p-6'>
            <div className='flex items-center gap-2 mb-6'>
              <MapPin className='text-[#C8A15B]' size={24} />
              <h2 className='text-xl font-bold text-[#1F3B29]'>Shipping Address</h2>
            </div>

            {error && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700'>
                <AlertCircle size={20} />
                <p className='text-sm'>{error}</p>
              </div>
            )}

            <div className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-[#1F3B29] mb-2'>
                    Full Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='fullName'
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A15B]'
                    placeholder='John Doe'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-[#1F3B29] mb-2'>
                    Phone Number <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A15B]'
                    placeholder='9876543210'
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-[#1F3B29] mb-2'>
                  Address Line 1 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='addressLine1'
                  value={shippingAddress.addressLine1}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A15B]'
                  placeholder='House No., Building Name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-[#1F3B29] mb-2'>Address Line 2</label>
                <input
                  type='text'
                  name='addressLine2'
                  value={shippingAddress.addressLine2}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A15B]'
                  placeholder='Road Name, Area, Colony'
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-[#1F3B29] mb-2'>
                    City <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='city'
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A15B]'
                    placeholder='Mumbai'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-[#1F3B29] mb-2'>
                    State <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='state'
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A15B]'
                    placeholder='Maharashtra'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-[#1F3B29] mb-2'>
                    Postal Code <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='postalCode'
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 border border-[#E6D3C2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A15B]'
                    placeholder='400001'
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-[#1F3B29] mb-2'>Country</label>
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
          </div>

          {/* Payment Method */}
          <div className='bg-white border-2 border-[#E6D3C2] rounded-xl p-4 sm:p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <CreditCard className='text-[#C8A15B]' size={24} />
              <h2 className='text-xl font-bold text-[#1F3B29]'>Payment Method</h2>
            </div>
            <div className='flex items-center gap-3 p-4 border-2 border-[#C8A15B] rounded-lg bg-[#F5EEE5]'>
              <Check className='text-[#1F3B29]' size={20} />
              <div>
                <p className='font-semibold text-[#1F3B29]'>Razorpay</p>
                <p className='text-sm text-[#4F3A2E]'>Pay securely via UPI, Cards, Netbanking & more</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className='lg:col-span-1'>
          <div className='bg-white border-2 border-[#E6D3C2] rounded-xl p-4 sm:p-6 sticky top-24'>
            <h2 className='text-xl font-bold text-[#1F3B29] mb-4'>Order Summary</h2>

            <div className='space-y-3 mb-4 max-h-60 overflow-y-auto'>
              {cartItems.map(item => (
                <div key={item._id} className='flex gap-3'>
                  <div className='relative w-16 h-16 rounded-lg overflow-hidden bg-[#F5EEE5] flex-shrink-0'>
                    <Image src={item.image} alt={item.title} fill sizes='64px' className='object-cover' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-[#1F3B29] truncate'>{item.title}</p>
                    <p className='text-xs text-[#4F3A2E]'>Qty: {item.quantity}</p>
                    <p className='text-sm font-bold text-[#1F3B29]'>₹{(item.displayPrice * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className='space-y-3 pt-4 border-t border-[#E6D3C2]'>
              <div className='flex justify-between text-sm text-[#4F3A2E]'>
                <span>Subtotal</span>
                <span className='font-semibold'>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-sm text-[#4F3A2E]'>
                <span>Shipping</span>
                <span className='font-semibold'>{shippingCharges === 0 ? 'Free' : `₹${shippingCharges}`}</span>
              </div>
              <div className='flex justify-between text-sm text-[#4F3A2E]'>
                <span>Tax (GST 3%)</span>
                <span className='font-semibold'>₹{tax.toLocaleString()}</span>
              </div>
              <div className='border-t border-[#E6D3C2] pt-3 flex justify-between text-lg font-bold text-[#1F3B29]'>
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing || !razorpayLoaded}
              className='w-full mt-6 rounded-full bg-[#1F3B29] px-6 py-3 text-white font-semibold hover:bg-[#2a4d3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
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

            <p className='text-xs text-center text-[#4F3A2E] mt-4'>
              Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
