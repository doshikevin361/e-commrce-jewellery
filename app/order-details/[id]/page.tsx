'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Loader2,
  Download,
  CheckCircle,
  Copy,
  XCircle,
  MessageCircle,
  Star,
  ChevronDown,
  RefreshCw,
  User
} from 'lucide-react';
import { toast } from 'react-toastify';

interface OrderItem {
  product: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCharges: number;
  tax: number;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [showOffers, setShowOffers] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      toast.error('Please login to view order details');
      router.push('/');
      return;
    }
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, router]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        toast.error('Please login to view order details');
        router.push('/');
        return;
      }

      const response = await fetch(`/api/customer/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch order:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch order details');
      }

      const data = await response.json();
      if (data.order) {
        setOrder(data.order);
      } else {
        throw new Error('Order data not found in response');
      }
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast.error(error.message || 'Failed to load order details');
      setTimeout(() => router.push('/my-orders'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderId);
      toast.success('Order ID copied to clipboard!');
    }
  };

  const handleCancelItem = (itemName: string) => {
    toast.info(`Cancel item functionality for ${itemName} coming soon!`);
  };

  const handleCancelOrder = () => {
    toast.info('Cancel order functionality coming soon!');
  };

  const handleReorder = () => {
    toast.info('Reorder functionality coming soon!');
  };

  const handleDownloadInvoice = () => {
    toast.info('Invoice download coming soon!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5EEE5] to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1F3B29] mx-auto mb-4" />
          <p className="text-[#1F3B29] font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5EEE5] to-white">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <Link
            href="/my-orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F3B29] text-white rounded-lg hover:bg-[#1F3B29]/90 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusHistory = [
    { label: 'Order Confirmed', date: order.createdAt, completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.orderStatus.toLowerCase()) },
    { label: 'Processing', date: order.createdAt, completed: ['processing', 'shipped', 'delivered'].includes(order.orderStatus.toLowerCase()) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5EEE5] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/my-orders" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Details</h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-600">Order #{order.orderId}</p>
                <button
                  onClick={copyOrderId}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copy Order ID"
                >
                  <Copy size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={item.productImage || '/placeholder-product.png'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {item.productName}
                      </h3>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        ₹{item.subtotal.toLocaleString()}{' '}
                        <span className="text-sm text-gray-500 font-normal">
                          (₹{item.price.toLocaleString()} × {item.quantity})
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Quantity: {item.quantity}
                      </p>
                      <button
                        onClick={() => handleCancelItem(item.productName)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <XCircle size={16} />
                        Cancel Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
              <div className="space-y-6">
                {statusHistory.map((status, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          status.completed
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <CheckCircle size={20} />
                      </div>
                      {index < statusHistory.length - 1 && (
                        <div className="absolute top-10 left-5 w-0.5 h-12 bg-green-500" />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="font-semibold text-gray-900">{status.label}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(status.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Actions</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleCancelOrder}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  <XCircle size={18} />
                  Cancel Order
                </button>
                <button
                  onClick={() => router.push('/contact')}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <MessageCircle size={18} />
                  Need Help?
                </button>
              </div>
            </div>

            {/* Chat and Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => toast.info('Chat functionality coming soon!')}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-[#1F3B29] transition-colors"
              >
                <div className="flex items-center justify-center gap-2 text-gray-700 font-medium">
                  <MessageCircle size={20} />
                  Chat with us
                </div>
              </button>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-gray-700 font-medium mb-3 text-center">Rate your experience</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-600">Great</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-colors"
                    >
                      <Star
                        size={24}
                        className={rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#1F3B29] text-white px-6 py-4 flex items-center gap-2">
                <Package size={20} />
                <h2 className="text-lg font-bold">Delivery details</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-500 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.shippingAddress.addressLine1}
                      {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="text-gray-500 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                    <p className="text-sm text-gray-600">{order.customerEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#1F3B29] text-white px-6 py-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h2 className="text-lg font-bold">Price details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold">₹{order.shippingCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span className="font-semibold">₹{order.tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total amount</span>
                  <span className="text-lg font-bold text-gray-900">₹{order.total.toLocaleString()}</span>
                </div>

                <div className="pt-4 space-y-3 border-t border-gray-200">
                  <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Payment method</span>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2 5h20v4H2V5zm0 6h20v8H2v-8zm2 2v4h16v-4H4z"/>
                      </svg>
                      <span className="text-sm font-bold text-gray-900 uppercase">{order.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Payment Status</span>
                    <span className={`text-sm font-bold uppercase ${
                      order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleReorder}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <RefreshCw size={18} />
                  Reorder All Items
                </button>

                <button
                  onClick={handleDownloadInvoice}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1F3B29] text-white rounded-lg hover:bg-[#1F3B29]/90 transition-colors font-medium"
                >
                  <Download size={18} />
                  Download Invoice
                </button>

                <button
                  onClick={() => setShowOffers(!showOffers)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#C8A15B]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.91-.97-7-5.44-7-9V8.3l7-3.11 7 3.11V11c0 3.56-3.09 8.03-7 9z"/>
                    </svg>
                    <span className="font-medium text-gray-900">Offers earned</span>
                  </div>
                  <ChevronDown size={20} className={`text-gray-400 transition-transform ${showOffers ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
