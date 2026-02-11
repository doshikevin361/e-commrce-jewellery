'use client';

import { useEffect, useState, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatIndianDate } from '@/app/utils/helper';
import { Eye, Search, Filter, Download, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AdminPagination } from '@/components/ui/admin-pagination';
import { CommonDialog } from '../dialog/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  trackingNumber?: string;
  orderNotes?: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export function OrderList() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [viewOrderData, setViewOrderData] = useState<Order | null>(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on all filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || order.paymentMethod === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesPaymentMethod;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentStatusFilter, paymentMethodFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      const data = await res.json();

      if (res.ok) {
        console.log('[OrderList] Orders received:', {
          count: data.orders?.length || 0,
          total: data.total || 0,
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
      console.error('[OrderList] Failed to fetch orders:', error);
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
    setViewOrderId(orderId);
    setViewOrderData(null);
    fetchOrderDetails(orderId);
  };

  const handleEditOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoadingOrderDetails(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || 'Failed to fetch order details');
      }
      const data = await response.json();
      setViewOrderData(data.order || data);
    } catch (error) {
      console.error('[OrderList] Failed to fetch order details:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch order details',
        variant: 'destructive',
      });
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setPaymentMethodFilter('all');
  };

  const handleExport = () => {
    try {
      const csvHeaders = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Items', 'Amount', 'Payment Status', 'Payment Method', 'Order Status'];
      const csvRows = filteredOrders.map(order => [
        order.orderId,
        formatIndianDate(order.createdAt),
        order.customerName,
        order.customerEmail,
        order.items.length,
        order.total,
        order.paymentStatus,
        order.paymentMethod.toUpperCase(),
        order.orderStatus,
      ]);

      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: `Exported ${filteredOrders.length} orders to CSV`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to export:', error);
      toast({
        title: 'Error',
        description: 'Failed to export orders',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value?: number) => {
    if (typeof value !== 'number') return '-';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const response = await fetch(`/api/admin/orders/${orderToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(orders.filter(o => o._id !== orderToDelete));
        toast({
          title: 'Success',
          description: 'Order deleted successfully',
          variant: 'default',
        });
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('[OrderList] Failed to delete order:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete order',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
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

  const DetailItem = ({ label, value }: { label: string; value?: ReactNode }) => (
    <div>
      <strong>{label}:</strong>
      <p className='mt-0.5 text-slate-900 dark:text-white'>{value ?? '-'}</p>
    </div>
  );

  return (
    <>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>Orders</h1>
            <p className='text-slate-600 dark:text-slate-400 mt-1'>
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
          <div className='flex gap-3'>
            <Button
              variant='outline'
              className='gap-2 border-slate-300 dark:border-slate-600'
              onClick={handleExport}
              disabled={filteredOrders.length === 0}>
              <Download className='w-4 h-4' />
              Export CSV
            </Button>
          </div>
        </div>

        <Card className='p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2'>
                <Filter className='w-5 h-5' />
                Filters
              </h3>
              <Select value={itemsPerPage.toString()} onValueChange={v => setItemsPerPage(Number(v))}>
                <SelectTrigger className='w-[120px] bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'>
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

            <div className='flex flex-row flex-wrap gap-2'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                <Input
                  placeholder='Search by order ID, customer...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 max-w-[300px]'
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'>
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

              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className='bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'>
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

              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className='bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'>
                  <SelectValue placeholder='Payment Method' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Payment Methods</SelectItem>
                  <SelectItem value='razorpay'>Razorpay</SelectItem>
                  <SelectItem value='cod'>Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant='outline'
                size='sm'
                onClick={handleClearFilters}
                className='text-slate-600 dark:text-slate-400 !h-[36px] dark:hover:text-white'>
                Clear All
              </Button>
            </div>
          </div>

          <div>
            {loading ? (
              <div className='text-center py-8 text-slate-600 dark:text-slate-400'>Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className='text-center py-8 text-slate-600 dark:text-slate-400'>No orders found matching your filters</div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='border-b-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-700/40'>
                      <TableHead className='font-semibold text-slate-900 dark:text-white py-4 px-4'>Order ID</TableHead>
                      <TableHead className='font-semibold text-slate-900 dark:text-white py-4 px-4'>Date</TableHead>
                      <TableHead className='font-semibold text-slate-900 dark:text-white py-4 px-4'>Customer</TableHead>
                      <TableHead className='font-semibold text-slate-900 dark:text-white py-4 px-4'>Items</TableHead>
                      <TableHead className='font-semibold text-slate-900 dark:text-white py-4 px-4'>Amount</TableHead>
                      <TableHead className='font-semibold text-slate-900 dark:text-white py-4 px-4'>Payment</TableHead>
                      <TableHead className='font-semibold text-slate-900 dark:text-white py-4 px-4'>Status</TableHead>
                      <TableHead className='font-semibold text-slate-900 dark:text-white py-4 px-4 text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map(order => (
                      <TableRow
                        key={order._id}
                        className='border-b border-slate-100 dark:border-slate-700 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors duration-150'>
                        <TableCell className='font-medium py-4 px-4'>{order.orderId}</TableCell>
                        <TableCell className='py-4 px-4 text-sm text-slate-700 dark:text-slate-300'>
                          {formatIndianDate(order.createdAt)}
                        </TableCell>
                        <TableCell className='py-4 px-4'>
                          <div>
                            <div className='font-medium text-slate-900 dark:text-white'>{order.customerName}</div>
                            <div className='text-xs text-slate-500 dark:text-slate-400'>{order.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className='py-4 px-4 text-sm text-slate-700 dark:text-slate-300'>
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </TableCell>
                        <TableCell className='font-semibold py-4 px-4 text-slate-900 dark:text-white'>
                          ₹{order.total.toLocaleString()}
                        </TableCell>
                        <TableCell className='py-4 px-4'>
                          <div className='space-y-1'>
                            {getPaymentStatusBadge(order.paymentStatus)}
                          </div>
                        </TableCell>
                        <TableCell className='py-4 px-4'>{getOrderStatusBadge(order.orderStatus)}</TableCell>
                        <TableCell className='py-4 px-4 text-right'>
                          <div className='flex justify-end gap-6'>
                            <button
                              onClick={() => handleViewOrder(order._id)}
                              title='View order'
                              className='text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'>
                              <Eye className='h-5 w-5' />
                            </button>
                            <button
                              onClick={() => handleEditOrder(order._id)}
                              title='Edit order'
                              className='text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'>
                              <Edit className='h-5 w-5' />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(order._id)}
                              title='Delete order'
                              className='text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer'>
                              <Trash2 className='h-5 w-5' />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          {filteredOrders.length > 0 && (
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredOrders.length}
            />
          )}
        </Card>
      </div>

      <CommonDialog
        open={!!viewOrderId}
        onOpenChange={open => {
          if (!open) {
            setViewOrderId(null);
            setViewOrderData(null);
          }
        }}
        title='Order Details'
        description={viewOrderData?.orderId || viewOrderData?._id}
        cancelText='Close'
        loading={loadingOrderDetails}>
        {viewOrderData && (
          <div className='mt-1 space-y-6 text-sm text-gray-700'>
            <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
              <DetailItem label='Order ID' value={viewOrderData.orderId} />
              <DetailItem label='Date' value={formatIndianDate(viewOrderData.createdAt)} />
              <DetailItem label='Customer Name' value={viewOrderData.customerName} />
              <DetailItem label='Customer Email' value={viewOrderData.customerEmail} />
              <DetailItem label='Payment Method' value={viewOrderData?.paymentMethod?.toUpperCase() || 'N/A'} />
              <DetailItem
                label='Payment Status'
                value={
                  <span className='inline-block mt-1'>
                    {getPaymentStatusBadge(viewOrderData.paymentStatus)}
                  </span>
                }
              />
              <DetailItem
                label='Order Status'
                value={
                  <span className='inline-block mt-1'>
                    {getOrderStatusBadge(viewOrderData.orderStatus)}
                  </span>
                }
              />
              <DetailItem label='Total Amount' value={formatCurrency(viewOrderData.total)} />
            </div>

            {viewOrderData.razorpayOrderId && (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <DetailItem label='Razorpay Order ID' value={viewOrderData.razorpayOrderId} />
                {viewOrderData.razorpayPaymentId && (
                  <DetailItem label='Razorpay Payment ID' value={viewOrderData.razorpayPaymentId} />
                )}
              </div>
            )}

            {viewOrderData.shippingAddress && (
              <div>
                <strong>Shipping Address:</strong>
                <p className='mt-1 text-slate-900 dark:text-white'>
                  {viewOrderData.shippingAddress.fullName}<br />
                  {viewOrderData.shippingAddress.phone}<br />
                  {viewOrderData.shippingAddress.addressLine1}
                  {viewOrderData.shippingAddress.addressLine2 && <>, {viewOrderData.shippingAddress.addressLine2}</>}<br />
                  {viewOrderData.shippingAddress.city}, {viewOrderData.shippingAddress.state} {viewOrderData.shippingAddress.pincode}<br />
                  {viewOrderData.shippingAddress.country}
                </p>
              </div>
            )}

            {viewOrderData.billingAddress && (
              <div>
                <strong>Billing Address:</strong>
                <p className='mt-1 text-slate-900 dark:text-white'>
                  {viewOrderData.billingAddress.fullName}<br />
                  {viewOrderData.billingAddress.phone}<br />
                  {viewOrderData.billingAddress.addressLine1}
                  {viewOrderData.billingAddress.addressLine2 && <>, {viewOrderData.billingAddress.addressLine2}</>}<br />
                  {viewOrderData.billingAddress.city}, {viewOrderData.billingAddress.state} {viewOrderData.billingAddress.pincode}<br />
                  {viewOrderData.billingAddress.country}
                </p>
              </div>
            )}

            {viewOrderData.items && viewOrderData.items.length > 0 && (
              <div>
                <strong>Order Items:</strong>
                <div className='mt-2 space-y-3'>
                  {viewOrderData.items.map((item: any, index: number) => (
                    <div key={index} className='flex gap-3 border border-slate-200 dark:border-slate-700 rounded-lg p-3'>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-16 h-16 object-cover rounded-md border border-slate-200 dark:border-slate-600'
                        />
                      )}
                      <div className='flex-1'>
                        <div className='font-medium text-slate-900 dark:text-white'>{item.name}</div>
                        <div className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                          Quantity: {item.quantity} × ₹{item.price.toLocaleString()} = ₹{(item.quantity * item.price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CommonDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className='bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-slate-900 dark:text-white'>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className='text-slate-600 dark:text-slate-400'>
              This action cannot be undone. This will permanently delete the order from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='border-slate-200 dark:border-slate-700'>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className='bg-red-600 hover:bg-red-700 text-white'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
