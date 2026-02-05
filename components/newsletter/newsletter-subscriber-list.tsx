'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Download, Trash2, Mail } from 'lucide-react';
import { formatIndianDate } from '@/app/utils/helper';
import { Spinner } from '@/components/ui/spinner';
import { AdminPagination } from '@/components/ui/admin-pagination';
import { DataTableBody } from '@/components/ui/data-table-body';

interface NewsletterSubscriber {
  _id: string;
  email: string;
  status: 'active' | 'inactive';
  subscribedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export function NewsletterSubscriberList() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchSubscribers();
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(subscribers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubscribers = subscribers.slice(startIndex, endIndex);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/newsletter-subscribers?${params}`);
      const data = await response.json();
      setSubscribers(Array.isArray(data.subscribers) ? data.subscribers : []);
    } catch (error) {
      console.error('[v0] Failed to fetch newsletter subscribers:', error);
      toast({ title: 'Error', description: 'Failed to load newsletter subscribers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeletingId(deleteId);
      const response = await fetch('/api/admin/newsletter-subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Subscriber deleted successfully', variant: 'success' });
        fetchSubscribers();
      } else {
        toast({ title: 'Error', description: 'Failed to delete subscriber', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete subscriber', variant: 'destructive' });
    } finally {
      setDeleteId(null);
      setDeletingId(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Status', 'Subscribed At'];
    const rows = subscribers.map(sub => [
      sub.email,
      sub.status,
      sub.subscribedAt ? formatIndianDate(sub.subscribedAt) : '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Newsletter Subscribers</h1>
          <p className='text-sm text-gray-500 mt-1'>Manage newsletter email subscriptions</p>
        </div>
        <div className='flex items-center gap-3'>
          <Button onClick={exportToCSV} variant='outline' className='gap-2'>
            <Download className='h-4 w-4' />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className='p-6'>
        <div className='flex flex-col md:flex-row gap-4 mb-6'>
          <div className='flex-1'>
            <Input
              placeholder='Search by email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='max-w-sm'
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>
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

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50 border-b border-gray-200 hover:bg-gray-50'>
                <TableHead className='font-semibold text-gray-700 py-4'>Email</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Status</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Subscribed At</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <DataTableBody
              loading={loading}
              data={paginatedSubscribers}
              columns={4}
              loadingText='Loading subscribers...'
              emptyText='No subscribers found'>
              {paginatedSubscribers.map(subscriber => (
                <TableRow key={subscriber._id}>
                  <TableCell className='font-medium'>
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-gray-400' />
                      {subscriber.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={subscriber.status === 'active' ? 'default' : 'secondary'}>
                      {subscriber.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {subscriber.subscribedAt ? formatIndianDate(subscriber.subscribedAt) : '-'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setDeleteId(subscriber._id)}
                        className='text-destructive hover:text-destructive'>
                        {deletingId === subscriber._id ? (
                          <Spinner className='h-4 w-4' />
                        ) : (
                          <Trash2 className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </DataTableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className='mt-6'>
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subscriber? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
