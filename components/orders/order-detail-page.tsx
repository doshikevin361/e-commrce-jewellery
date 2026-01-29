'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Save, ArrowLeft, Package, User, CreditCard, Truck, FileText, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { formatIndianDate } from '@/app/utils/helper';
import { Spinner } from '@/components/ui/spinner';

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
  const [orderStatus, setOrderStatus] = useState<Order['orderStatus']>('pending');
  const [orderNotes, setOrderNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [saving, setSaving] = useState(false);

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
        setOrderNotes(data.order.orderNotes || '');
        setTrackingNumber(data.order.trackingNumber || '');
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
          orderNotes,
          trackingNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Order updated successfully',
          variant: 'success',
        });
        // Update local order state
        if (data.order) {
          setOrder(data.order);
        }
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

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      paid: { variant: 'default', label: 'Paid' },
      pending: { variant: 'outline', label: 'Pending' },
      failed: { variant: 'destructive', label: 'Failed' },
      refunded: { variant: 'secondary', label: 'Refunded' },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getOrderStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      delivered: { variant: 'default', label: 'Delivered' },
      confirmed: { variant: 'default', label: 'Confirmed' },
      processing: { variant: 'secondary', label: 'Processing' },
      shipped: { variant: 'secondary', label: 'Shipped' },
      pending: { variant: 'outline', label: 'Pending' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' onClick={() => router.push('/admin/orders')} className='-ml-2'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back
          </Button>
          <Package className='w-8 h-8 text-[#1F3B29]' />
          <div>
            <h1 className='text-3xl font-bold text-[#1F3B29]'>Order Details</h1>
            <p className='text-sm text-gray-500 mt-1'>Order ID: {order.orderId}</p>
          </div>
        </div>
        {getOrderStatusBadge(orderStatus || 'pending')}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Order Summary */}
          <Card className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <div className='text-sm text-gray-500'>Order Date</div>
                <div className='font-semibold'>{formatIndianDate(order.createdAt)}</div>
              </div>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <div className='text-sm text-gray-500'>Payment Method</div>
                <div className='font-semibold'>{order.paymentMethod?.toUpperCase() || 'N/A'}</div>
              </div>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <div className='text-sm text-gray-500'>Payment Status</div>
                <div>{getPaymentStatusBadge(order.paymentStatus || 'pending')}</div>
              </div>
            </div>
          </Card>

          {/* Customer Information */}
          <Card className='p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <User className='w-5 h-5 text-[#1F3B29]' />
              <h3 className='text-lg font-semibold text-[#1F3B29]'>Customer Information</h3>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label className='text-sm font-semibold text-gray-500'>Name</Label>
                <p className='mt-1 text-sm'>{order.customerName}</p>
              </div>
              <div>
                <Label className='text-sm font-semibold text-gray-500'>Email</Label>
                <p className='mt-1 text-sm'>{order.customerEmail}</p>
              </div>
              {order.customer?.phone && (
                <div>
                  <Label className='text-sm font-semibold text-gray-500'>Phone</Label>
                  <p className='mt-1 text-sm'>{order.customer.phone}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className='p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <Truck className='w-5 h-5 text-[#1F3B29]' />
              <h3 className='text-lg font-semibold text-[#1F3B29]'>Shipping Address</h3>
            </div>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-sm font-medium'>{order.shippingAddress.fullName}</p>
              <p className='text-sm text-gray-600'>{order.shippingAddress.phone}</p>
              <p className='text-sm text-gray-600 mt-2'>
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              </p>
              <p className='text-sm text-gray-600'>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className='text-sm text-gray-600'>{order.shippingAddress.country}</p>
            </div>
          </Card>

          {/* Order Items */}
          <Card className='p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <Package className='w-5 h-5 text-[#1F3B29]' />
              <h3 className='text-lg font-semibold text-[#1F3B29]'>Order Items</h3>
            </div>
            <div className='space-y-4'>
              {order.items.map((item, index) => (
                <div key={index} className='flex items-center gap-4 p-4 border rounded-lg'>
                  <div className='relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200'>
                    <Image
                      src={item.productImage || '/placeholder.jpg'}
                      alt={item.productName}
                      fill
                      className='object-cover'
                      sizes='80px'
                    />
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-semibold'>{item.productName}</h4>
                    <p className='text-sm text-gray-500'>Quantity: {item.quantity}</p>
                    <p className='text-sm text-gray-500'>Price: ₹{item.price.toLocaleString()}</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold'>₹{item.subtotal.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment Information */}
          {order.paymentMethod === 'razorpay' && (order.razorpayOrderId || order.razorpayPaymentId) && (
            <Card className='p-6'>
              <div className='flex items-center gap-2 mb-4'>
                <CreditCard className='w-5 h-5 text-[#1F3B29]' />
                <h3 className='text-lg font-semibold text-[#1F3B29]'>Razorpay Information</h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg'>
                {order.razorpayOrderId && (
                  <div>
                    <Label className='text-sm font-semibold text-gray-500'>Razorpay Order ID</Label>
                    <p className='mt-1 text-sm font-mono'>{order.razorpayOrderId}</p>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div>
                    <Label className='text-sm font-semibold text-gray-500'>Razorpay Payment ID</Label>
                    <p className='mt-1 text-sm font-mono'>{order.razorpayPaymentId}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Order Summary & Admin Controls */}
        <div className='space-y-6'>
          {/* Order Summary */}
          <Card className='p-6'>
            <h3 className='text-lg font-semibold text-[#1F3B29] mb-4'>Order Summary</h3>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Subtotal</span>
                <span className='font-semibold'>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Shipping</span>
                <span className='font-semibold'>₹{order.shippingCharges.toLocaleString()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Tax</span>
                <span className='font-semibold'>₹{order.tax.toLocaleString()}</span>
              </div>
              <div className='flex justify-between pt-2 border-t border-gray-300'>
                <span className='text-lg font-bold text-[#1F3B29]'>Total</span>
                <span className='text-lg font-bold text-[#1F3B29]'>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Admin Controls */}
          <Card className='p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <FileText className='w-5 h-5 text-[#1F3B29]' />
              <h3 className='text-lg font-semibold text-[#1F3B29]'>Update Order</h3>
            </div>

            <div className='space-y-4'>
              <div>
                <Label htmlFor='orderStatus' className='text-sm font-semibold'>
                  Order Status
                </Label>
                <Select value={orderStatus} onValueChange={value => setOrderStatus(value as Order['orderStatus'])}>
                  <SelectTrigger id='orderStatus' className='mt-1'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='confirmed'>Confirmed</SelectItem>
                    <SelectItem value='processing'>Processing</SelectItem>
                    <SelectItem value='shipped'>Shipped</SelectItem>
                    <SelectItem value='delivered'>Delivered</SelectItem>
                    <SelectItem value='cancelled'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='trackingNumber' className='text-sm font-semibold'>
                  Tracking Number
                </Label>
                <input
                  id='trackingNumber'
                  type='text'
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  placeholder='Enter tracking number'
                  className='mt-1 w-full px-3 py-2 border rounded-md text-sm'
                />
              </div>

              <div>
                <Label htmlFor='orderNotes' className='text-sm font-semibold'>
                  Admin Notes
                </Label>
                <Textarea
                  id='orderNotes'
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder='Add internal notes about this order...'
                  className='mt-1'
                  rows={4}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className='w-full'>
                {saving ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='w-4 h-4 mr-2' />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
