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
import { Eye, Trash2, Search, Sparkles } from 'lucide-react';
import { CommonDialog } from '../dialog/dialog';
import { formatIndianDate } from '@/app/utils/helper';
import { Spinner } from '@/components/ui/spinner';
import { CustomJewelleryDetail } from './custom-jewellery-detail';

interface CustomJewelleryRequest {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  jewelleryType: string;
  metalType: string;
  budgetRange: string;
  description: string;
  images: string[];
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  internalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function CustomJewelleryList() {
  const [requests, setRequests] = useState<CustomJewelleryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewRequestId, setViewRequestId] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState<CustomJewelleryRequest | null>(null);
  const [loadingRequestDetails, setLoadingRequestDetails] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [searchTerm, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/custom-jewellery?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (error) {
      console.error('[v0] Failed to fetch custom jewellery requests:', error);
      toast({ title: 'Error', description: 'Failed to load requests', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeletingId(deleteId);
      const response = await fetch(`/api/admin/custom-jewellery/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Request deleted successfully', variant: 'default' });
        fetchRequests();
      } else {
        toast({ title: 'Error', description: 'Failed to delete request', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete request', variant: 'destructive' });
    } finally {
      setDeleteId(null);
      setDeletingId(null);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      setLoadingRequestDetails(true);
      console.log('[v0] Fetching custom jewellery request details for ID:', id);
      const response = await fetch(`/api/admin/custom-jewellery/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[v0] Failed to fetch request details:', response.status, errorData);
        toast({
          title: 'Error',
          description: errorData.error || `Failed to load request details (${response.status})`,
          variant: 'destructive',
        });
        return;
      }

      const data = await response.json();
      console.log('[v0] Request details received:', data);

      if (data.request) {
        setRequestDetails(data.request);
        setViewRequestId(id);
      } else {
        console.error('[v0] No request data in response:', data);
        toast({ title: 'Error', description: 'Invalid response from server', variant: 'destructive' });
      }
    } catch (error) {
      console.error('[v0] Error fetching request details:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load request details',
        variant: 'destructive',
      });
    } finally {
      setLoadingRequestDetails(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'outline', label: 'Pending' },
      reviewed: { variant: 'secondary', label: 'Reviewed' },
      approved: { variant: 'default', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-8 h-8 text-[#1F3B29]' />
          <h1 className='text-3xl font-bold text-[#1F3B29]'>Custom Jewellery Requests</h1>
        </div>
      </div>

      <Card className='p-6'>
        <div className='flex flex-col sm:flex-row gap-4 mb-6'>
          <div className='flex-1 relative max-w-[400px]'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              placeholder='Search by name, email, phone, or description...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-full sm:w-[200px]'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='reviewed'>Reviewed</SelectItem>
              <SelectItem value='approved'>Approved</SelectItem>
              <SelectItem value='rejected'>Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <Spinner />
          </div>
        ) : requests.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>No requests found</div>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Jewellery Type</TableHead>
                  <TableHead>Metal Type</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(request => (
                  <TableRow key={request._id}>
                    <TableCell className='font-medium'>{request.fullName}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{request.phone}</TableCell>
                    <TableCell>{request.jewelleryType}</TableCell>
                    <TableCell>{request.metalType}</TableCell>
                    <TableCell>{request.budgetRange}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{request.createdAt ? formatIndianDate(request.createdAt) : '-'}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-4'>
                        <button
                          className='cursor-pointer text-gray-600 hover:text-gray-900'
                          onClick={() => handleViewDetails(request._id)}
                          disabled={loadingRequestDetails}>
                          <Eye className='w-5 h-5' />
                        </button>
                        <button className='cursor-pointer' onClick={() => setDeleteId(request._id)} disabled={deletingId === request._id}>
                          {deletingId === request._id ? <Spinner className='w-5 h-5' /> : <Trash2 className='w-5 h-5 text-red-500' />}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* View Details Dialog */}
      {viewRequestId && requestDetails && (
        <CustomJewelleryDetail
          request={requestDetails}
          open={!!viewRequestId}
          onOpenChange={open => {
            if (!open) {
              setViewRequestId(null);
              setRequestDetails(null);
            }
          }}
          onUpdate={fetchRequests}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom jewellery request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-red-500 hover:bg-red-600'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
