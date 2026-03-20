'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Download, Package, ArrowLeft, Loader2, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
          Authorization: `Bearer ${token}`,
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
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate invoice');
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition');
      const match = disposition?.match(/filename="?([^";]+)"?/);
      const filename = match ? match[1] : `invoice-${orderId}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
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
      day: 'numeric',
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      searchQuery === '' ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus.length === 0 || filterStatus.includes(order.orderStatus.toLowerCase());

    const matchesTime =
      filterTime.length === 0 ||
      (() => {
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
      setFilterStatus(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
    } else {
      setFilterTime(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
    }
  };

  const activeFilterCount = filterStatus.length + filterTime.length;

  const renderOrderFilters = () => (
    <>
      <div className='mb-6'>
        <h3 className='mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900'>
          <div className='h-4 w-1 rounded bg-[#1F3B29]' />
          Order Status
        </h3>
        <div className='space-y-2'>
          {['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(status => {
            const count = orders.filter(o => o.orderStatus.toLowerCase() === status.toLowerCase()).length;
            const isSelected = filterStatus.includes(status.toLowerCase());
            return (
              <label
                key={status}
                className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all ${
                  isSelected ? 'border-2 border-[#1F3B29] bg-[#1F3B29]/10' : 'border-2 border-transparent bg-gray-50 hover:bg-gray-100'
                }`}>
                <input
                  type='checkbox'
                  checked={isSelected}
                  onChange={() => toggleFilter('status', status.toLowerCase())}
                  className='h-5 w-5 cursor-pointer rounded border-gray-300 text-[#1F3B29] focus:ring-[#1F3B29]'
                />
                <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-[#1F3B29]' : 'text-gray-700'}`}>{status}</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    isSelected ? 'bg-[#1F3B29] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className='mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900'>
          <div className='h-4 w-1 rounded bg-[#1F3B29]' />
          Order Time
        </h3>
        <div className='space-y-2'>
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all ${
              filterTime.includes('last30days')
                ? 'border-2 border-[#1F3B29] bg-[#1F3B29]/10'
                : 'border-2 border-transparent bg-gray-50 hover:bg-gray-100'
            }`}>
            <input
              type='checkbox'
              checked={filterTime.includes('last30days')}
              onChange={() => toggleFilter('time', 'last30days')}
              className='h-5 w-5 cursor-pointer rounded border-gray-300 text-[#1F3B29] focus:ring-[#1F3B29]'
            />
            <span className={`flex-1 text-sm font-medium ${filterTime.includes('last30days') ? 'text-[#1F3B29]' : 'text-gray-700'}`}>
              Last 30 days
            </span>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                filterTime.includes('last30days') ? 'bg-[#1F3B29] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              {
                orders.filter(o => {
                  const diffDays = Math.floor((new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  return diffDays <= 30;
                }).length
              }
            </span>
          </label>
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all ${
              filterTime.includes('2025')
                ? 'border-2 border-[#1F3B29] bg-[#1F3B29]/10'
                : 'border-2 border-transparent bg-gray-50 hover:bg-gray-100'
            }`}>
            <input
              type='checkbox'
              checked={filterTime.includes('2025')}
              onChange={() => toggleFilter('time', '2025')}
              className='h-5 w-5 cursor-pointer rounded border-gray-300 text-[#1F3B29] focus:ring-[#1F3B29]'
            />
            <span className={`flex-1 text-sm font-medium ${filterTime.includes('2025') ? 'text-[#1F3B29]' : 'text-gray-700'}`}>2025</span>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                filterTime.includes('2025') ? 'bg-[#1F3B29] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              {orders.filter(o => new Date(o.createdAt).getFullYear() === 2025).length}
            </span>
          </label>
        </div>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-[#F5EEE5] to-white'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 animate-spin text-[#1F3B29] mx-auto mb-4' />
          <p className='text-[#1F3B29] font-medium'>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full bg-white'>
      {/* Header */}
      <div className='bg-white px-3 py-5 text-black sm:px-4 sm:py-6 md:px-6'>
        <div className='mx-auto max-w-7xl'>
          <Link
            href='/'
            className='mb-3 inline-flex items-center gap-2 text-sm text-black/80 transition-colors hover:text-[#1F3B29] sm:mb-4 sm:text-base'>
            <ArrowLeft size={20} className='shrink-0' />
            <span>Back to Home</span>
          </Link>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>My Orders</h1>
          <p className='mt-1.5 text-sm text-black/80 sm:mt-2 sm:text-base'>Track and manage all your orders in one place</p>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-3 py-6 sm:px-4 md:px-6 md:py-8'>
        {/* Search + mobile filters */}
        <div className='mb-5 flex flex-col gap-3 sm:mb-6 md:flex-row md:items-stretch md:gap-4'>
          <div className='relative min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-100 p-3 shadow-sm sm:p-4'>
            <Search className='absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-6' />
            <input
              type='search'
              placeholder='Search by product, order ID…'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='h-11 w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1F3B29] sm:h-10 sm:pl-11 sm:text-base'
            />
          </div>
          <Button
            type='button'
            variant='outline'
            onClick={() => setShowMobileFilters(true)}
            className='h-11 w-full shrink-0 border-[#E6D3C2] text-[#1F3B29] hover:bg-[#F5EEE5] sm:w-auto sm:min-w-44 lg:hidden'>
            <Filter className='size-4' />
            Filters
            {activeFilterCount > 0 && (
              <span className='ml-1 rounded-full bg-[#C8A15B] px-2 py-0.5 text-xs text-white'>{activeFilterCount}</span>
            )}
          </Button>
        </div>

        <div className='flex flex-col gap-6 lg:flex-row lg:gap-8'>
          {/* Filters Sidebar (desktop) — Flip Card */}
          <div className='hidden shrink-0 lg:block lg:w-72'>
            <div className='relative min-h-88 h-[min(600px,calc(100vh-8rem))]' style={{ perspective: '1000px' }}>
              <div
                className={`relative w-full h-full transition-transform duration-700`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFilterFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}>
                {/* Front of Card */}
                <div
                  className='absolute inset-0 rounded-2xl bg-linear-to-br from-[#1F3B29] to-[#2d4a3a] p-6 text-white shadow-2xl'
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                  <div className='flex flex-col h-full'>
                    <div className='flex items-center gap-3 mb-6'>
                      <div className='p-2 bg-white/20 rounded-lg'>
                        <Package className='text-white' size={24} />
                      </div>
                      <h2 className='font-bold text-xl'>Filters</h2>
                    </div>

                    <div className='flex-1 flex flex-col justify-center'>
                      <p className='text-white/80 text-sm mb-4 text-center'>Click to view filter options</p>
                      <div className='flex items-center justify-center'>
                        <div className='w-16 h-16 border-2 border-white/30 rounded-full flex items-center justify-center'>
                          <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsFilterFlipped(true)}
                      className='mt-4 w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30'>
                      View Filters
                    </button>
                  </div>
                </div>

                {/* Back of Card - Filters */}
                <div
                  className='absolute inset-0 bg-gray-100 rounded-2xl shadow-2xl p-6 overflow-hidden'
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}>
                  <div className='flex flex-col h-full overflow-hidden'>
                    <div className='mb-4 flex shrink-0 items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-[#1F3B29]/10 rounded-lg'>
                          <Package className='text-[#1F3B29]' size={24} />
                        </div>
                        <h2 className='font-bold text-lg text-gray-900'>Filters</h2>
                      </div>
                    </div>

                    <div
                      className='filter-scroll flex-1 overflow-y-auto pr-2'
                      style={{
                        WebkitOverflowScrolling: 'touch',
                      }}>
                      {renderOrderFilters()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className='flex-1'>
            <div className='mb-4'>
              <p className='text-sm text-gray-600 sm:text-base'>
                Showing <span className='font-semibold text-[#1F3B29]'>{filteredOrders.length}</span> of{' '}
                <span className='font-semibold text-[#1F3B29]'>{orders.length}</span> orders
              </p>
            </div>

            {filteredOrders.length === 0 ? (
              <div className='rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12'>
                <Package className='mx-auto mb-4 h-14 w-14 text-gray-300 sm:h-16 sm:w-16' />
                <h3 className='mb-2 text-lg font-semibold text-gray-900 sm:text-xl'>No orders found</h3>
                <p className='mb-6 text-sm text-gray-600 sm:text-base'>
                  {searchQuery || filterStatus.length > 0 || filterTime.length > 0
                    ? 'Try adjusting your filters or search query'
                    : "You haven't placed any orders yet"}
                </p>
                <Link
                  href='/products'
                  className='inline-flex min-h-11 w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-[#1F3B29] px-6 py-3 font-medium text-white transition-colors hover:bg-[#1F3B29]/90 sm:w-auto'>
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className='space-y-4'>
                {filteredOrders.map(order => (
                  <div
                    key={order._id}
                    className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'>
                    {order.items.map((item, index) => (
                      <div key={index} className={`p-3 sm:p-4 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className='flex flex-col gap-4 sm:flex-row'>
                          {/* Product Image */}
                          <div className='relative mx-auto h-40 w-full max-w-[200px] shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:mx-0 sm:h-32 sm:w-32 sm:max-w-none'>
                            <Image
                              src={item.productImage || '/placeholder-product.png'}
                              alt={item.productName}
                              fill
                              className='object-cover'
                            />
                            {item.quantity > 1 && (
                              <div className='absolute top-2 right-2 bg-[#1F3B29] text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center'>
                                Qty: {item.quantity}
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className='flex-1 min-w-0'>
                            <div className='mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                              <div className='min-w-0 flex-1'>
                                <h3 className='mb-1 text-base font-semibold text-gray-900 sm:text-lg'>{item.productName}</h3>
                                <p className='text-sm text-gray-500'>
                                  Color: <span className='text-gray-700'>N/A</span>
                                </p>
                                <Link
                                  href={`/order-details/${order._id}`}
                                  className='mt-1 inline-block text-sm font-medium text-[#C8A15B] transition-colors hover:text-[#1F3B29]'>
                                  Order {order.orderId}
                                </Link>
                              </div>
                              <div className='shrink-0 text-left sm:text-right'>
                                <p className='text-xl font-bold text-[#1F3B29] sm:text-2xl'>₹{item.subtotal.toLocaleString()}</p>
                              </div>
                            </div>

                            {/* Status and Date */}
                            <div className='flex flex-wrap items-center gap-3 mb-4'>
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  order.orderStatus,
                                )}`}>
                                <div className='w-1.5 h-1.5 rounded-full bg-current animate-pulse' />
                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                              </span>
                              <span className='text-sm text-gray-500 flex items-center gap-1'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                  />
                                </svg>
                                Ordered on {formatDate(order.createdAt)}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            {index === order.items.length - 1 && (
                              <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3'>
                                <Link
                                  href={`/order-details/${order._id}`}
                                  className='inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#1F3B29] px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#1F3B29]/90 sm:w-auto sm:min-w-0'>
                                  View Details
                                </Link>
                                <button
                                  type='button'
                                  onClick={() => handleReorder(order._id)}
                                  className='min-h-11 w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 sm:w-auto sm:min-w-0'>
                                  Reorder
                                </button>
                                {['confirmed', 'processing', 'shipped', 'delivered'].includes(order.orderStatus.toLowerCase()) && (
                                  <button
                                    type='button'
                                    onClick={() => handleInvoice(order._id)}
                                    className='flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#C8A15B] px-4 py-2.5 text-sm font-medium text-[#C8A15B] transition-colors hover:bg-[#C8A15B] hover:text-white sm:w-auto sm:min-w-0'>
                                    <Download size={16} className='shrink-0' />
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

      <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <SheetContent side='left' className='flex w-full max-w-sm flex-col gap-0 overflow-hidden p-0 sm:max-w-md [&>button]:text-[#1F3B29]'>
          <SheetHeader className='border-b border-gray-200 px-4 py-4 text-left'>
            <SheetTitle className='text-lg text-[#1F3B29]'>Filter orders</SheetTitle>
            <p className='text-sm font-normal text-gray-500'>By status and order time</p>
          </SheetHeader>
          <div className='filter-scroll flex-1 overflow-y-auto px-4 py-4' style={{ WebkitOverflowScrolling: 'touch' }}>
            {renderOrderFilters()}
          </div>
          <div className='border-t border-gray-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]'>
            <Button
              type='button'
              className='h-11 w-full bg-[#1F3B29] text-white hover:bg-[#1F3B29]/90'
              onClick={() => setShowMobileFilters(false)}>
              Done
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
