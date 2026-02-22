'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  Download, 
  Package, 
  ArrowLeft,
  Loader2 
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

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterTime, setFilterTime] = useState<string[]>([]);
  const [isFilterFlipped, setIsFilterFlipped] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      toast.error('Please login to view your orders');
      router.push('/');
      return;
    }
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('/api/customer/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderId: string) => {
    toast.info('Reorder functionality coming soon!');
  };

  const handleInvoice = async (orderId: string) => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        toast.error('Please login to download invoice');
        return;
      }

      toast.info('Generating invoice...', { autoClose: 2000 });
      
      const response = await fetch(`/api/customer/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate invoice');
      }

      // Get the image blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Invoice downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      toast.error(error.message || 'Failed to download invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus.length === 0 || 
      filterStatus.includes(order.orderStatus.toLowerCase());
    
    const matchesTime = filterTime.length === 0 || (() => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (filterTime.includes('last30days') && diffDays <= 30) return true;
      if (filterTime.includes('2025') && orderDate.getFullYear() === 2025) return true;
      return false;
    })();

    return matchesSearch && matchesStatus && matchesTime;
  });

  const toggleFilter = (type: 'status' | 'time', value: string) => {
    if (type === 'status') {
      setFilterStatus(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    } else {
      setFilterTime(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5EEE5] to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1F3B29] mx-auto mb-4" />
          <p className="text-[#1F3B29] font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white text-black py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-black/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-black/80 mt-2">Track and manage all your orders in one place</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8">
        {/* Search */}
        <div className="bg-gray-100 te rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by product name, order ID, or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3B29] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Flip Card Style */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="relative h-[600px]" style={{ perspective: '1000px' }}>
              <div 
                className={`relative w-full h-full transition-transform duration-700`}
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: isFilterFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front of Card */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-[#1F3B29] to-[#2d4a3a] rounded-2xl shadow-2xl p-6 text-white"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Package className="text-white" size={24} />
                      </div>
                      <h2 className="font-bold text-xl">Filters</h2>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-white/80 text-sm mb-4 text-center">Click to view filter options</p>
                      <div className="flex items-center justify-center">
                        <div className="w-16 h-16 border-2 border-white/30 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setIsFilterFlipped(true)}
                      className="mt-4 w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30"
                    >
                      View Filters
                    </button>
                  </div>
                </div>

                {/* Back of Card - Filters */}
                <div 
                  className="absolute inset-0 bg-gray-100 rounded-2xl shadow-2xl p-6 overflow-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#1F3B29]/10 rounded-lg">
                          <Package className="text-[#1F3B29]" size={24} />
                        </div>
                        <h2 className="font-bold text-lg text-gray-900">Filters</h2>
                      </div>
                    </div>

                    <div 
                      className="flex-1 overflow-y-auto pr-2 filter-scroll"
                      style={{ 
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      {/* Order Status Filter */}
                      <div className="mb-6">
                        <h3 className="font-bold text-sm mb-4 text-gray-900 uppercase tracking-wider flex items-center gap-2">
                          <div className="w-1 h-4 bg-[#1F3B29] rounded"></div>
                          Order Status
                        </h3>
                        <div className="space-y-2">
                          {['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(status => {
                            const count = orders.filter(o => o.orderStatus.toLowerCase() === status.toLowerCase()).length;
                            const isSelected = filterStatus.includes(status.toLowerCase());
                            return (
                              <label 
                                key={status} 
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'bg-[#1F3B29]/10 border-2 border-[#1F3B29]' 
                                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleFilter('status', status.toLowerCase())}
                                  className="w-5 h-5 rounded border-gray-300 text-[#1F3B29] focus:ring-[#1F3B29] cursor-pointer"
                                />
                                <span className={`text-sm font-medium flex-1 ${
                                  isSelected ? 'text-[#1F3B29]' : 'text-gray-700'
                                }`}>
                                  {status}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                  isSelected 
                                    ? 'bg-[#1F3B29] text-white' 
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {count}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Order Time Filter */}
                      <div>
                        <h3 className="font-bold text-sm mb-4 text-gray-900 uppercase tracking-wider flex items-center gap-2">
                          <div className="w-1 h-4 bg-[#1F3B29] rounded"></div>
                          Order Time
                        </h3>
                        <div className="space-y-2">
                          <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            filterTime.includes('last30days')
                              ? 'bg-[#1F3B29]/10 border-2 border-[#1F3B29]'
                              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                          }`}>
                            <input
                              type="checkbox"
                              checked={filterTime.includes('last30days')}
                              onChange={() => toggleFilter('time', 'last30days')}
                              className="w-5 h-5 rounded border-gray-300 text-[#1F3B29] focus:ring-[#1F3B29] cursor-pointer"
                            />
                            <span className={`text-sm font-medium flex-1 ${
                              filterTime.includes('last30days') ? 'text-[#1F3B29]' : 'text-gray-700'
                            }`}>
                              Last 30 days
                            </span>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              filterTime.includes('last30days')
                                ? 'bg-[#1F3B29] text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {orders.filter(o => {
                                const diffDays = Math.floor((new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                                return diffDays <= 30;
                              }).length}
                            </span>
                          </label>
                          <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            filterTime.includes('2025')
                              ? 'bg-[#1F3B29]/10 border-2 border-[#1F3B29]'
                              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                          }`}>
                            <input
                              type="checkbox"
                              checked={filterTime.includes('2025')}
                              onChange={() => toggleFilter('time', '2025')}
                              className="w-5 h-5 rounded border-gray-300 text-[#1F3B29] focus:ring-[#1F3B29] cursor-pointer"
                            />
                            <span className={`text-sm font-medium flex-1 ${
                              filterTime.includes('2025') ? 'text-[#1F3B29]' : 'text-gray-700'
                            }`}>
                              2025
                            </span>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              filterTime.includes('2025')
                                ? 'bg-[#1F3B29] text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {orders.filter(o => new Date(o.createdAt).getFullYear() === 2025).length}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1">
            <div className="mb-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-[#1F3B29]">{filteredOrders.length}</span> of{' '}
                <span className="font-semibold text-[#1F3B29]">{orders.length}</span> orders
              </p>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || filterStatus.length > 0 || filterTime.length > 0
                    ? 'Try adjusting your filters or search query'
                    : 'You haven\'t placed any orders yet'}
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F3B29] text-white rounded-lg hover:bg-[#1F3B29]/90 transition-colors font-medium"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Product Image */}
                          <div className="relative w-full sm:w-32 h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                            <Image
                              src={item.productImage || '/placeholder-product.png'}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                            {item.quantity > 1 && (
                              <div className="absolute top-2 right-2 bg-[#1F3B29] text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center">
                                Qty: {item.quantity}
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                  {item.productName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Color: <span className="text-gray-700">N/A</span>
                                </p>
                                <Link
                                  href={`/order-details/${order._id}`}
                                  className="text-sm text-[#C8A15B] hover:text-[#1F3B29] font-medium transition-colors"
                                >
                                  Order {order.orderId}
                                </Link>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-[#1F3B29]">
                                  ₹{item.subtotal.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Status and Date */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  order.orderStatus
                                )}`}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Ordered on {formatDate(order.createdAt)}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            {index === order.items.length - 1 && (
                              <div className="flex flex-wrap gap-3">
                                <Link
                                  href={`/order-details/${order._id}`}
                                  className="px-5 py-2 bg-[#1F3B29] text-white rounded-lg hover:bg-[#1F3B29]/90 transition-colors font-medium text-sm"
                                >
                                  View Details
                                </Link>
                                <button
                                  onClick={() => handleReorder(order._id)}
                                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                                >
                                  Reorder
                                </button>
                                {order.orderStatus.toLowerCase() === 'delivered' && (
                                  <button
                                    onClick={() => handleInvoice(order._id)}
                                    className="flex items-center gap-2 px-5 py-2 border-2 border-[#C8A15B] text-[#C8A15B] rounded-lg hover:bg-[#C8A15B] hover:text-white transition-colors font-medium text-sm"
                                  >
                                    <Download size={16} />
                                    Download Invoice
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
