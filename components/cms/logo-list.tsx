'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTableBody } from '@/components/ui/data-table-body';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';

interface Logo {
  _id: string;
  name: string;
  imageUrl: string;
  altText: string;
  isActive: boolean;
  width: number;
  height: number;
  createdAt?: string;
  updatedAt?: string;
}

export function LogoList() {
  const router = useRouter();
  const { toast } = useToast();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogos();
  }, [searchTerm]);

  const fetchLogos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/cms/logos?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogos(data.logos || []);
      } else {
        setLogos([]);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch logos:', error);
      setLogos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeletingId(deleteId);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/cms/logos/${deleteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Logo deleted successfully',
          variant: 'success',
        });
        fetchLogos();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete logo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the logo',
        variant: 'destructive',
        });
    } finally {
      setDeleteId(null);
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (logoId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      setTogglingStatusId(logoId);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/cms/logos/${logoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Logo ${newStatus ? 'activated' : 'deactivated'} successfully`,
          variant: 'success',
        });
        fetchLogos();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update logo status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setTogglingStatusId(null);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Logo Management</h1>
        <Button onClick={() => router.push('/admin/cms/logos/add')} className='gap-2 bg-[#22c55e]'>
          <Plus className='h-4 w-4' />
          Add Logo
        </Button>
      </div>

      <Card className='shadow-md border border-gray-200 overflow-hidden'>
        <div className='flex flex-row gap-2 flex-wrap px-5 py-4'>
          <Input
            placeholder='Search logos...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='border-gray-300 focus:ring-green-500 max-w-[300px]'
          />
        </div>

        <div className='overflow-x-auto px-5'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50 border-b border-gray-200 hover:bg-gray-50'>
                <TableHead className='font-semibold text-gray-700 py-4'>Preview</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Name</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Alt Text</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Dimensions</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4 text-center'>Status</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <DataTableBody
              loading={loading}
              data={logos}
              columns={6}
              loadingText='Loading logos...'
              emptyText='No logos found. Add your first logo to get started.'>
              {logos.map(logo => (
                <TableRow key={logo._id} className='border-b border-gray-200 hover:bg-green-50 transition-colors duration-150'>
                  <TableCell className='py-4'>
                    {logo.imageUrl ? (
                      <img
                        src={logo.imageUrl}
                        alt={logo.altText}
                        className='h-12 object-contain'
                        style={{ maxWidth: '120px' }}
                      />
                    ) : (
                      <span className='text-gray-400 text-sm'>No image</span>
                    )}
                  </TableCell>
                  <TableCell className='font-semibold text-gray-900 py-4'>{logo.name}</TableCell>
                  <TableCell className='text-sm text-gray-600 py-4'>{logo.altText}</TableCell>
                  <TableCell className='text-sm text-gray-600 py-4'>
                    {logo.width}×{logo.height}px
                  </TableCell>
                  <TableCell className='py-4 text-center'>
                    {togglingStatusId === logo._id ? (
                      <Spinner className='h-4 w-4 mx-auto' />
                    ) : (
                      <Switch
                        size='md'
                        checked={logo.isActive}
                        onCheckedChange={() => handleToggleStatus(logo._id, logo.isActive)}
                        disabled={togglingStatusId === logo._id}
                      />
                    )}
                  </TableCell>
                  <TableCell className='py-4'>
                    <div className='flex justify-end gap-6'>
                      <button
                        onClick={() => router.push(`/admin/cms/logos/edit/${logo._id}`)}
                        title='Edit logo'
                        disabled={togglingStatusId === logo._id || deletingId === logo._id}
                        className='text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                        <Pencil className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => setDeleteId(logo._id)}
                        disabled={togglingStatusId === logo._id || deletingId === logo._id}
                        className='text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed'
                        title='Delete logo'>
                        {deletingId === logo._id ? <Spinner className='h-5 w-5' /> : <Trash2 className='h-5 w-5' />}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </DataTableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the logo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-destructive' disabled={!!deletingId}>
              {deletingId ? <Spinner className='h-4 w-4 mr-2' /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
