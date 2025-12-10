'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatIndianDate } from '@/app/utils/helper';
import { DataTableBody } from '@/components/ui/data-table-body';

interface Order {
  _id: string;
  orderId: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  items: any[];
}

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'default';
      case 'cancelled':
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Orders</h1>
      </div>

      <Card className='p-6 shadow-md border border-gray-200 overflow-hidden'>
        <div className='flex flex-row gap-3 mb-4 items-center justify-between'>
          <div className='flex flex-row  gap-3'>
            <Input
              placeholder='Search by order number or customer...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='max-w-xs'
            />
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='paid'>Paid</SelectItem>
                <SelectItem value='cancelled'>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Placeholder date filters for future */}
          {/* <div className='flex gap-2'>
            <Input type='date' className='w-40' />
            <Input type='date' className='w-40' />
          </div> */}
        </div>

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50 border-b border-gray-200 hover:bg-gray-50'>
                <TableHead className='font-semibold text-gray-700 py-4'>Order ID</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Order Date</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Customer</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Items</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Total</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Payment</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Order Status</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <DataTableBody
              loading={loading}
              data={orders}
              columns={8}
              loadingText='Loading orders...'
              emptyText='No orders found'>
              {orders.map(order => (
                  <TableRow
                    key={order._id}
                    className='border-b border-gray-200 hover:bg-green-50 transition-colors duration-150'>
                    <TableCell className='font-semibold text-gray-900 py-4'>
                      {order.orderId}
                    </TableCell>
                    <TableCell className='text-gray-600 py-4'>
                      {formatIndianDate(order.createdAt)}
                    </TableCell>
                    <TableCell className='text-gray-600 py-4'>
                      <div>
                        <div className='font-medium'>{order.customerName}</div>
                        <div className='text-xs text-gray-500'>{order.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className='text-gray-600 py-4'>
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </TableCell>
                    <TableCell className='text-gray-900 font-semibold py-4'>
                      ₹{order.total.toLocaleString()}
                    </TableCell>
                    <TableCell className='py-4'>
                      <div>
                        <Badge variant={getStatusBadgeVariant(order.paymentStatus)} className='px-3 mb-1'>
                          {order.paymentStatus.toUpperCase()}
                        </Badge>
                        <div className='text-xs text-gray-500 mt-1'>{order.paymentMethod}</div>
                      </div>
                    </TableCell>
                    <TableCell className='py-4'>
                      <Badge 
                        variant={order.orderStatus === 'delivered' ? 'default' : order.orderStatus === 'cancelled' ? 'destructive' : 'secondary'} 
                        className='px-3'>
                        {order.orderStatus.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className='py-4 text-right'>
                      <Button variant='outline' size='sm' onClick={() => {}}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </DataTableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}


