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

interface DazzleCard {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export function DazzleList() {
  const router = useRouter();
  const { toast } = useToast();
  const [cards, setCards] = useState<DazzleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, [searchTerm]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/cms/dazzle?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCards(Array.isArray(data) ? data : []);
      } else {
        setCards([]);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch dazzle cards:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeletingId(deleteId);
      const response = await fetch(`/api/admin/cms/dazzle/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Dazzle card deleted successfully',
          variant: 'success',
        });
        fetchCards();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete dazzle card',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the card',
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
        <h1 className='text-3xl font-bold'>Dazzle in Every Moment Cards</h1>
        <Button onClick={() => router.push('/admin/cms/dazzle/add')} className='gap-2 bg-[#22c55e]'>
          <Plus className='h-4 w-4' />
          Add Card
        </Button>
      </div>

      <Card className='shadow-md border border-gray-200 overflow-hidden'>
        <div className='flex flex-row gap-2 flex-wrap px-5 py-4'>
          <Input
            placeholder='Search cards...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='border-gray-300 focus:ring-green-500 max-w-[300px]'
          />
        </div>

        <div className='overflow-x-auto px-5'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50 border-b border-gray-200 hover:bg-gray-50'>
                <TableHead className='font-semibold text-gray-700 py-4'>Image</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Title</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Subtitle</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4'>Order</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <DataTableBody
              loading={loading}
              data={cards}
              columns={5}
              loadingText='Loading cards...'
              emptyText='No cards found'>
              {cards.map(card => (
                <TableRow key={card._id} className='border-b border-gray-200 hover:bg-green-50 transition-colors duration-150'>
                  <TableCell className='py-4'>
                    {card.image ? (
                      <img src={card.image} alt={card.title} className='w-20 h-20 object-cover rounded' />
                    ) : (
                      <span className='text-gray-400 text-sm'>No image</span>
                    )}
                  </TableCell>
                  <TableCell className='font-semibold text-gray-900 py-4'>{card.title}</TableCell>
                  <TableCell className='text-sm text-gray-600 py-4'>{card.subtitle}</TableCell>
                  <TableCell className='text-sm text-gray-600 py-4'>{card.displayOrder}</TableCell>
                  <TableCell className='py-4'>
                    <div className='flex justify-end gap-6'>
                      <button
                        onClick={() => router.push(`/admin/cms/dazzle/edit/${card._id}`)}
                        title='Edit card'
                        disabled={deletingId === card._id}
                        className='text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                        <Pencil className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => setDeleteId(card._id)}
                        disabled={deletingId === card._id}
                        className='text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed'
                        title='Delete card'>
                        {deletingId === card._id ? (
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
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the dazzle card.</AlertDialogDescription>
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

