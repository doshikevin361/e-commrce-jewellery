'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Package, User, CreditCard, MapPin } from 'lucide-react';
import { formatIndianDate } from '@/app/utils/helper';
import { Spinner } from '@/components/ui/spinner';
import { CommonDialog } from '../dialog/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  pincode?: string;
  country: string;
}

interface Order {
  _id: string;
  orderId: string;
  customer: any;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCharges: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderNotes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [updateTrackingModalOpen, setUpdateTrackingModalOpen] = useState(false);
  const [updatePaymentModalOpen, setUpdatePaymentModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [orderStatus, setOrderStatus] = useState<Order['orderStatus']>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<Order['paymentStatus']>('pending');

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();

      if (res.ok && data.order) {
        setOrder(data.order);
        setOrderStatus(data.order.orderStatus);
        setTrackingNumber(data.order.trackingNumber || '');
        setPaymentStatus(data.order.paymentStatus);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load order details',
          variant: 'destructive',
        });
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('[OrderDetailPage] Error fetching order:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive',
      });
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!orderId) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderStatus,
          trackingNumber,
          paymentStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Order updated successfully',
          variant: 'default',
        });
        // Refresh order data
        await fetchOrder();
        // Close modals
        setUpdateStatusModalOpen(false);
        setUpdateTrackingModalOpen(false);
        setUpdatePaymentModalOpen(false);
      } else {
        toast({
          title: 'Error',
          description: data.error || data.details || 'Failed to update order',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[OrderDetailPage] Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = () => {
    if (order) {
      setOrderStatus(order.orderStatus);
      setUpdateStatusModalOpen(true);
    }
  };

  const handleUpdateTracking = () => {
    if (order) {
      setTrackingNumber(order.trackingNumber || '');
      setUpdateTrackingModalOpen(true);
    }
  };

  const handleUpdatePayment = () => {
    if (order) {
      setPaymentStatus(order.paymentStatus);
      setUpdatePaymentModalOpen(true);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const config = {
      paid: { className: 'bg-green-100 text-green-800', label: 'PAID' },
      pending: { className: 'bg-yellow-100 text-yellow-800', label: 'PENDING' },
      failed: { className: 'bg-red-100 text-red-800', label: 'FAILED' },
      refunded: { className: 'bg-gray-100 text-gray-800', label: 'REFUNDED' },
    }[status] || { className: 'bg-gray-100 text-gray-800', label: status.toUpperCase() };
    
    return (
      <span className={`px-3 py-1 rounded-md text-sm font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const config = {
      delivered: { className: 'bg-green-100 text-green-800', label: 'Delivered' },
      confirmed: { className: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      processing: { className: 'bg-blue-100 text-blue-800', label: 'Processing' },
      shipped: { className: 'bg-purple-100 text-purple-800', label: 'Shipped' },
      pending: { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      cancelled: { className: 'bg-red-100 text-red-800', label: 'Cancelled' },
    }[status] || { className: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`px-3 py-1 rounded-md text-sm font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <Spinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500'>Order not found</p>
        <Button onClick={() => router.push('/admin/orders')} className='mt-4'>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6 max-w-[1400px] mx-auto'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button 
            variant='ghost' 
            size='icon' 
            onClick={() => router.push('/admin/orders')} 
            className='hover:bg-gray-100 rounded-full'
          >
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Order Details</h1>
            <p className='text-gray-500 mt-1'>Order #{order.orderId}</p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <Button 
            variant='outline' 
            onClick={handleUpdateStatus}
            className='flex items-center gap-2 border-gray-300'
          >
            <Package className='w-4 h-4' />
            Update Status
          </Button>
          <Button 
            variant='outline' 
            onClick={handleUpdateTracking}
            className='flex items-center gap-2 border-gray-300'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
            </svg>
            Update Tracking
          </Button>
          <Button 
            variant='outline' 
            onClick={handleUpdatePayment}
            className='flex items-center gap-2 border-gray-300'
          >
            <CreditCard className='w-4 h-4' />
            Update Payment
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Order Items */}
          <Card className='p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>Order Items</h2>
            <div className='space-y-4'>
              {order.items.map((item, index) => (
                <div key={index} className='flex items-start gap-4 pb-4 border-b last:border-b-0'>
                  <div className='w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0'>
                    <img
                      src={item.productImage || '/placeholder.jpg'}
                      alt={item.productName}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-gray-900 mb-1'>{item.productName}</h3>
                    <p className='text-sm text-gray-600'>Quantity: {item.quantity}</p>
                    <p className='text-sm text-gray-600'>Price: ₹{item.price.toLocaleString()}</p>
                    <span className='inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded'>
                      ORDERED
                    </span>
                  </div>
                  <div className='text-right font-bold text-gray-900'>
                    ₹{item.subtotal.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Addresses */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Shipping Address */}
            <Card className='p-6'>
              <div className='flex items-center gap-2 mb-4'>
                <MapPin className='w-5 h-5 text-gray-700' />
                <h3 className='text-lg font-bold text-gray-900'>Shipping Address</h3>
              </div>
              <div className='text-sm text-gray-700 space-y-1'>
                <p className='font-semibold'>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode || order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className='mt-2'>Phone: {order.shippingAddress.phone}</p>
                {order.shippingAddress.email && <p>Email: {order.shippingAddress.email}</p>}
              </div>
            </Card>

            {/* Billing Address */}
            <Card className='p-6'>
              <div className='flex items-center gap-2 mb-4'>
                <MapPin className='w-5 h-5 text-gray-700' />
                <h3 className='text-lg font-bold text-gray-900'>Billing Address</h3>
              </div>
              <div className='text-sm text-gray-700 space-y-1'>
                {order.billingAddress ? (
                  <>
                    <p className='font-semibold'>{order.billingAddress.fullName}</p>
                    <p>{order.billingAddress.addressLine1}</p>
                    {order.billingAddress.addressLine2 && <p>{order.billingAddress.addressLine2}</p>}
                    <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode || order.billingAddress.pincode}</p>
                    <p>{order.billingAddress.country}</p>
                    <p className='mt-2'>Phone: {order.billingAddress.phone}</p>
                    {order.billingAddress.email && <p>Email: {order.billingAddress.email}</p>}
                  </>
                ) : (
                  <>
                    <p className='font-semibold'>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode || order.shippingAddress.pincode}</p>
                    <p>{order.shippingAddress.country}</p>
                    <p className='mt-2'>Phone: {order.shippingAddress.phone}</p>
                    {order.shippingAddress.email && <p>Email: {order.shippingAddress.email}</p>}
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Order Summary */}
          <Card className='p-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-4'>Order Summary</h3>
            <div className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Subtotal</span>
                <span className='font-semibold text-gray-900'>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>Shipping</span>
                <span className='font-semibold text-gray-900'>₹{order.shippingCharges.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-lg font-bold pt-3 border-t border-gray-200'>
                <span className='text-gray-900'>Total</span>
                <span className='text-gray-900'>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Order Information */}
          <Card className='p-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-4'>Order Information</h3>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Order Status</p>
                {getOrderStatusBadge(order.orderStatus)}
              </div>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Payment Status</p>
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Payment Method</p>
                <p className='font-semibold text-gray-900'>{order.paymentMethod.toUpperCase()}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Order Date</p>
                <p className='font-semibold text-gray-900'>{formatIndianDate(order.createdAt)}</p>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className='text-sm text-gray-500 mb-1'>Tracking Number</p>
                  <p className='font-semibold text-gray-900'>{order.trackingNumber}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Customer */}
          <Card className='p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <User className='w-5 h-5 text-gray-700' />
              <h3 className='text-xl font-bold text-gray-900'>Customer</h3>
            </div>
            <div className='space-y-2'>
              <p className='font-semibold text-gray-900'>{order.customerName}</p>
              <p className='text-sm text-gray-600'>{order.customerEmail}</p>
              {order.shippingAddress.phone && (
                <p className='text-sm text-gray-600'>{order.shippingAddress.phone}</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Update Status Modal */}
      <CommonDialog
        open={updateStatusModalOpen}
        onOpenChange={setUpdateStatusModalOpen}
        title="Update Order Status"
        description={`Order #${order.orderId}`}
        onConfirm={handleSave}
        confirmText="Save Changes"
        cancelText="Cancel"
        loading={saving}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="orderStatus">Order Status</Label>
            <Select
              value={orderStatus}
              onValueChange={(value) => setOrderStatus(value as Order['orderStatus'])}
            >
              <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <SelectValue placeholder="Select order status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CommonDialog>

      {/* Update Tracking Modal */}
      <CommonDialog
        open={updateTrackingModalOpen}
        onOpenChange={setUpdateTrackingModalOpen}
        title="Update Tracking Information"
        description={`Order #${order.orderId}`}
        onConfirm={handleSave}
        confirmText="Save Changes"
        cancelText="Cancel"
        loading={saving}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Tracking Number</Label>
            <Input
              id="trackingNumber"
              type="text"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>
        </div>
      </CommonDialog>

      {/* Update Payment Modal */}
      <CommonDialog
        open={updatePaymentModalOpen}
        onOpenChange={setUpdatePaymentModalOpen}
        title="Update Payment Status"
        description={`Order #${order.orderId}`}
        onConfirm={handleSave}
        confirmText="Save Changes"
        cancelText="Cancel"
        loading={saving}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select
              value={paymentStatus}
              onValueChange={(value) => setPaymentStatus(value as Order['paymentStatus'])}
            >
              <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CommonDialog>
    </div>
  );
}
