'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatIndianDate } from '@/app/utils/helper';
import { Spinner } from '@/components/ui/spinner';
import { Eye, Search, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AdminPagination } from '@/components/ui/admin-pagination';

interface Order {
  _id: string;
  orderId: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'razorpay' | 'cod';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: any[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export function OrderList() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending' | 'paid' | 'failed' | 'refunded'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, paymentStatusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, paymentStatusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('orderStatus', statusFilter);
      if (paymentStatusFilter !== 'all') params.append('paymentStatus', paymentStatusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      
      if (res.ok) {
        console.log('[OrderList] Orders received:', {
          count: data.orders?.length || 0,
          total: data.total || 0,
          pagination: data.pagination,
        });
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } else {
        console.error('[OrderList] Error fetching orders:', {
          status: res.status,
          error: data.error,
          details: data.details,
        });
        toast({
          title: 'Error',
          description: data.error || data.details || 'Failed to load orders',
          variant: 'destructive',
        });
        setOrders([]);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
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

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Package className='w-8 h-8 text-[#1F3B29]' />
          <h1 className='text-3xl font-bold text-[#1F3B29]'>Orders</h1>
        </div>
      </div>

      <Card className='p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex-1' />
          <Select value={itemsPerPage.toString()} onValueChange={v => setItemsPerPage(Number(v))}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='10'>10 per page</SelectItem>
              <SelectItem value='25'>25 per page</SelectItem>
              <SelectItem value='50'>50 per page</SelectItem>
              <SelectItem value='100'>100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-col sm:flex-row gap-4 mb-6'>
          <div className='flex-1 relative max-w-[400px]'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              placeholder='Search by order ID, customer name, or email...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='pl-10'
            />
          </div>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
            <SelectTrigger className='w-full sm:w-[200px]'>
              <SelectValue placeholder='Order Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Order Status</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='confirmed'>Confirmed</SelectItem>
              <SelectItem value='processing'>Processing</SelectItem>
              <SelectItem value='shipped'>Shipped</SelectItem>
              <SelectItem value='delivered'>Delivered</SelectItem>
              <SelectItem value='cancelled'>Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentStatusFilter} onValueChange={v => setPaymentStatusFilter(v as any)}>
            <SelectTrigger className='w-full sm:w-[200px]'>
              <SelectValue placeholder='Payment Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Payment Status</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='paid'>Paid</SelectItem>
              <SelectItem value='failed'>Failed</SelectItem>
              <SelectItem value='refunded'>Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>No orders found</div>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map(order => (
                  <TableRow key={order._id}>
                    <TableCell className='font-medium'>{order.orderId}</TableCell>
                    <TableCell>{formatIndianDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <div>
                        <div className='font-medium'>{order.customerName}</div>
                        <div className='text-xs text-gray-500'>{order.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.items.length} item{order.items.length > 1 ? 's' : ''}</TableCell>
                    <TableCell className='font-semibold'>₹{order.total.toLocaleString()}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell>{getOrderStatusBadge(order.orderStatus)}</TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleViewOrder(order._id)}>
                        <Eye className='w-4 h-4 mr-2' />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {orders.length > 0 && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={orders.length}
          />
        )}
      </Card>
    </div>
  );
}
