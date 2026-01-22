'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { DataTableBody } from '@/components/ui/data-table-body';
import { Spinner } from '@/components/ui/spinner';

interface ScrollVideoPanel {
  _id: string;
  videoUrl: string;
  hashtag: string;
  productSlug?: string;
  productId?: string;
  displayOrder: number;
}

export function ScrollVideoPanelsList() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<ScrollVideoPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cms/scroll-video-panels');
      if (response.ok) {
        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch scroll video panels:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [items]
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setBusyId(deleteId);
      const response = await fetch(`/api/admin/cms/scroll-video-panels/${deleteId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Panel deleted successfully',
          variant: 'success',
        });
        fetchItems();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete panel',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the panel',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
      setBusyId(null);
    }
  };

  const handleReorder = async (updatedPairs: { id: string; displayOrder: number }[]) => {
    try {
      const response = await fetch('/api/admin/cms/scroll-video-panels/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedPairs }),
      });
      if (!response.ok) {
        throw new Error('Reorder failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reorder panels',
        variant: 'destructive',
      });
      fetchItems();
    }
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = sortedItems.findIndex(item => item._id === id);
    if (currentIndex === -1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= sortedItems.length) return;

    const current = sortedItems[currentIndex];
    const swapWith = sortedItems[swapIndex];

    const updated = items.map(item => {
      if (item._id === current._id) {
        return { ...item, displayOrder: swapWith.displayOrder };
      }
      if (item._id === swapWith._id) {
        return { ...item, displayOrder: current.displayOrder };
      }
      return item;
    });

    setItems(updated);
    handleReorder([
      { id: current._id, displayOrder: swapWith.displayOrder },
      { id: swapWith._id, displayOrder: current.displayOrder },
    ]);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Scroll Video Panels</h1>
        <Button onClick={() => router.push('/admin/cms/scroll-video-panels/add')} className='gap-2 bg-[#22c55e]'>
          <Plus className='h-4 w-4' />
          Add Panel
        </Button>
      </div>

      <Card className='shadow-md border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto px-5'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50 border-b border-gray-200 hover:bg-gray-50'>
                <TableHead className='font-semibold text-gray-700 py-4'>Video</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Hashtag</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Product</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Order</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <DataTableBody
              loading={loading}
              data={sortedItems}
              columns={5}
              loadingText='Loading panels...'
              emptyText='No panels found'>
              {sortedItems.map((item, index) => (
                <TableRow key={item._id} className='border-b border-gray-200 hover:bg-green-50 transition-colors duration-150'>
                  <TableCell className='py-4'>
                    {item.videoUrl ? (
                      <video
                        src={item.videoUrl}
                        className='w-20 h-20 object-cover rounded'
                        muted
                        playsInline
                        preload='metadata'
                      />
                    ) : (
                      <span className='text-gray-400 text-sm'>No video</span>
                    )}
                  </TableCell>
                  <TableCell className='font-semibold text-gray-900 py-4'>{item.hashtag}</TableCell>
                  <TableCell className='py-4 text-sm text-gray-600'>
                    {item.productSlug || item.productId || '—'}
                  </TableCell>
                  <TableCell className='text-sm text-gray-600 py-4'>
                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => moveItem(item._id, 'up')}
                        disabled={index === 0}
                        className='p-1 rounded hover:bg-gray-100 disabled:opacity-40'
                        title='Move up'>
                        <ArrowUp className='h-4 w-4' />
                      </button>
                      <button
                        type='button'
                        onClick={() => moveItem(item._id, 'down')}
                        disabled={index === sortedItems.length - 1}
                        className='p-1 rounded hover:bg-gray-100 disabled:opacity-40'
                        title='Move down'>
                        <ArrowDown className='h-4 w-4' />
                      </button>
                      <span>{item.displayOrder}</span>
                    </div>
                  </TableCell>
                  <TableCell className='py-4'>
                    <div className='flex justify-end gap-6'>
                      <button
                        onClick={() => router.push(`/admin/cms/scroll-video-panels/edit/${item._id}`)}
                        title='Edit panel'
                        disabled={busyId === item._id}
                        className='text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                        <Pencil className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => setDeleteId(item._id)}
                        disabled={busyId === item._id}
                        className='text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed'
                        title='Delete panel'>
                        {busyId === item._id ? <Spinner className='h-5 w-5' /> : <Trash2 className='h-5 w-5' />}
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
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the panel.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!busyId}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-destructive' disabled={!!busyId}>
              {busyId ? <Spinner className='h-4 w-4 mr-2' /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

