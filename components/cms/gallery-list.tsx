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

interface GalleryItem {
  _id: string;
  image: string;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export function GalleryList() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cms/gallery');
      if (response.ok) {
        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch gallery items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeletingId(deleteId);
      const response = await fetch(`/api/admin/cms/gallery/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Gallery item deleted successfully',
          variant: 'success',
        });
        fetchItems();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete gallery item',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the item',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
      setDeletingId(null);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Gallery Section</h1>
        <Button onClick={() => router.push('/admin/cms/gallery/add')} className='gap-2 bg-[#22c55e]'>
          <Plus className='h-4 w-4' />
          Add Image
        </Button>
      </div>

      <Card className='shadow-md border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto px-5'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50 border-b border-gray-200 hover:bg-gray-50'>
                <TableHead className='font-semibold text-gray-700 py-4'>Image</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Order</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <DataTableBody
              loading={loading}
              data={items}
              columns={3}
              loadingText='Loading gallery items...'
              emptyText='No gallery items found'>
              {items.map(item => (
                <TableRow key={item._id} className='border-b border-gray-200 hover:bg-green-50 transition-colors duration-150'>
                  <TableCell className='py-4'>
                    {item.image ? (
                      <img src={item.image} alt='Gallery image' className='w-20 h-20 object-cover rounded' />
                    ) : (
                      <span className='text-gray-400 text-sm'>No image</span>
                    )}
                  </TableCell>
                  <TableCell className='text-sm text-gray-600 py-4'>{item.displayOrder}</TableCell>
                  <TableCell className='py-4'>
                    <div className='flex justify-end gap-6'>
                      <button
                        onClick={() => router.push(`/admin/cms/gallery/edit/${item._id}`)}
                        title='Edit item'
                        disabled={deletingId === item._id}
                        className='text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                        <Pencil className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => setDeleteId(item._id)}
                        disabled={deletingId === item._id}
                        className='text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed'
                        title='Delete item'>
                        {deletingId === item._id ? (
                          <Spinner className='h-5 w-5' />
                        ) : (
                          <Trash2 className='h-5 w-5' />
                        )}
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
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the gallery item.</AlertDialogDescription>
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

