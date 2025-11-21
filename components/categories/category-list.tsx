'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Plus, Pencil, Trash2, Download, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { formatIndianDate } from '@/app/utils/helper';
import { CommonDialog } from '../dialog/dialog';
import { DataTableBody } from '@/components/ui/data-table-body';
import { Spinner } from '@/components/ui/spinner';

interface Category {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  productCount: number;
  displayOrder: number;
  position: number;
  featured: boolean;
  parentId?: string;
  // Optional fields used in the details view
  banner?: string;
  image?: string;
  icon?: string;
  displayOnHomepage?: boolean;
  commissionRate?: number;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  shortDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export function CategoryList() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [detailsData, setDetailsData] = useState<Category | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  console.log(detailsData);

  useEffect(() => {
    fetchCategories();
  }, [searchTerm, statusFilter, featuredFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (featuredFilter !== 'all') params.append('featured', featuredFilter);

      const response = await fetch(`/api/admin/categories?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeletingId(deleteId);
      const response = await fetch(`/api/admin/categories/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Category deleted successfully',
          variant: 'success',
        });
        fetchCategories();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete category',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the category',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
      setDeletingId(null);
    }
  };

  const getCategoryDetails = async (id: string): Promise<void> => {
    try {
      setLoadingDetails(true);

      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch category details');
      }

      const data: Category = await response.json(); // typed
      setDetailsData(data);
    } catch (error) {
      console.error('Get Category Error:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleView = (id: string) => {
    setDetailsId(id);
    getCategoryDetails(id);
  };

  const handleToggleStatus = async (categoryId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      setTogglingStatusId(categoryId);
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Category ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
          variant :'success'
        });
        fetchCategories();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update category status',
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

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Slug', 'Status', 'Products', 'Featured', 'Display Order'],
      ...categories.map(cat => [cat.name, cat.slug, cat.status, cat.productCount || 0, cat.featured ? 'Yes' : 'No', cat.displayOrder]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Categories</h1>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleExport} className='gap-2'>
            <Download className='h-4 w-4' />
            Export
          </Button>
          <Button onClick={() => router.push('/admin/categories/add')} className='gap-2 bg-[#22c55e] '>
            <Plus className='h-4 w-4' />
            Add Category
          </Button>
        </div>
      </div>

      {/* Filters */}
      {/* <Card className='p-6 shadow-md border border-gray-200'>
   
      </Card> */}

      {/* Table */}
      <Card className='shadow-md border border-gray-200 overflow-hidden'>
        <div className='flex flex-row gap-2 flex-wrap px-5'>
          <Input
            placeholder='Search categories...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='border-gray-300 focus:ring-green-500 max-w-[300px]'
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='border-gray-300'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
            <SelectTrigger className='border-gray-300'>
              <SelectValue placeholder='Filter by featured' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              <SelectItem value='true'>Featured Only</SelectItem>
              <SelectItem value='false'>Non-Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>
          <div className='overflow-x-auto px-5'>
            <Table>
              <TableHeader>
                <TableRow className='bg-gray-50 border-b border-gray-200 hover:bg-gray-50'>
                  <TableHead className='font-semibold text-gray-700 py-4'>Name</TableHead>
                  <TableHead className='font-semibold text-gray-700 py-4'>Slug</TableHead>
                  <TableHead className='font-semibold text-gray-700 py-4'>Position</TableHead>
                <TableHead className='font-semibold text-gray-700 py-4 text-center'>Status</TableHead>
                  {/* <TableHead className="font-semibold text-gray-700 py-4">Products</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Featured</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Order</TableHead> */}
                  <TableHead className='font-semibold text-gray-700 py-4 text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
            <DataTableBody
              loading={loading}
              data={categories}
              columns={5}
              loadingText='Loading categories...'
              emptyText='No categories found'>
                {categories.map(category => (
                  <TableRow key={category._id} className='border-b border-gray-200 hover:bg-green-50 transition-colors duration-150'>
                    <TableCell className='font-semibold text-gray-900 py-4'>{category.name}</TableCell>
                    <TableCell className='text-sm text-gray-600 py-4'>{category.slug}</TableCell>
                    <TableCell className='font-medium text-gray-900 py-4'>{category.position}</TableCell>
                    <TableCell className='py-4 text-center'>
                      {togglingStatusId === category._id ? (
                        <Spinner className='h-4 w-4 mx-auto' />
                      ) : (
                        <Switch
                          size='md'
                          checked={category.status === 'active'}
                          onCheckedChange={() => handleToggleStatus(category._id, category.status)}
                          disabled={togglingStatusId === category._id}
                        />
                      )}
                    </TableCell>
                    {/* <TableCell className="text-gray-900 font-medium py-4">{category.productCount || 0}</TableCell>
                      <TableCell className="py-4">
                        {category.featured ? (
                          <Badge className="bg-blue-100 text-blue-800 border border-blue-300">Featured</Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-900 py-4">{category.displayOrder}</TableCell> */}
                    <TableCell className='py-4'>
                      <div className='flex justify-end gap-6'>
                        <button
                          onClick={() => handleView(category._id)}
                          title='View category'
                          disabled={togglingStatusId === category._id || deletingId === category._id}
                          className='text-gray-600 hover:text-gray-900 cursor-pointer hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'>
                          <Eye className='h-5 w-5' />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/categories/edit/${category._id}`)}
                          title='Edit category'
                          disabled={togglingStatusId === category._id || deletingId === category._id}
                          className='text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                          <Pencil className='h-5 w-5' />
                        </button>
                        <button
                          onClick={() => setDeleteId(category._id)}
                          disabled={togglingStatusId === category._id || deletingId === category._id}
                          className='text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed'
                          title='Delete category'>
                          {deletingId === category._id ? (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the category.</AlertDialogDescription>
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

      <CommonDialog
        open={!!detailsId}
        onOpenChange={open => {
          if (!open) setDetailsId(null);
          setDetailsData(null);
        }}
        title='Category Details'
        description={detailsData?._id}
        cancelText='Close'
        loading={loadingDetails}>
        {detailsData && (
          <div className='mt-1 space-y-6 text-sm text-gray-700'>
            {/* Name */}
            <div className="flex items-center gap-6">
              <label className="w-1/4 text-sm font-medium text-gray-700 text-right pr-4">
                Name
              </label>
              <div className="flex-1">
                <p className="text-gray-900">{detailsData.name}</p>
              </div>
            </div>

            {/* Description */}
            {detailsData.description && (
              <div className="flex items-start gap-6">
                <label className="w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3">
                  Description
                </label>
                <div className="flex-1">
                  <p className="text-gray-900 whitespace-pre-line">{detailsData.description}</p>
                </div>
              </div>
            )}

            {/* Commission Rate */}
            <div className="flex items-center gap-6">
              <label className="w-1/4 text-sm font-medium text-gray-700 text-right pr-4">
                Commission Rate
              </label>
              <div className="flex-1">
                <p className="text-gray-900">{detailsData.commissionRate || 0}%</p>
              </div>
              </div>

            {/* Select Parent */}
            <div className="flex items-center gap-6">
              <label className="w-1/4 text-sm font-medium text-gray-700 text-right pr-4">
                Parent Category
              </label>
              <div className="flex-1">
                <p className="text-gray-900">{detailsData.parentId ? 'Has Parent' : 'No Parent (Root)'}</p>
              </div>
              </div>

            {/* Image */}
            {detailsData.image && (
              <div className="flex items-start gap-6">
                <label className="w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3">
                  Image
                </label>
                <div className="flex-1">
                  <img src={detailsData.image} alt="Category" className="w-32 h-32 object-cover rounded-lg border" />
                </div>
              </div>
            )}

            {/* Icon */}
            {detailsData.icon && (
              <div className="flex items-start gap-6">
                <label className="w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3">
                  Icon
                </label>
                <div className="flex-1">
                  <img src={detailsData.icon} alt="Category Icon" className="w-32 h-32 object-cover rounded-lg border" />
                </div>
              </div>
            )}

            {/* Meta Title */}
            {detailsData.metaTitle && (
              <div className="flex items-center gap-6">
                <label className="w-1/4 text-sm font-medium text-gray-700 text-right pr-4">
                  Meta Title
                </label>
                <div className="flex-1">
                  <p className="text-gray-900">{detailsData.metaTitle}</p>
                </div>
              </div>
            )}

            {/* Meta Description */}
            {detailsData.metaDescription && (
              <div className="flex items-start gap-6">
                <label className="w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3">
                  Meta Description
                </label>
                <div className="flex-1">
                  <p className="text-gray-900 whitespace-pre-line">{detailsData.metaDescription}</p>
                </div>
              </div>
            )}

            {/* Banner Image */}
            {detailsData.banner && (
              <div className="flex items-start gap-6">
                <label className="w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3">
                  Banner Image
                </label>
                <div className="flex-1">
                  <img src={detailsData.banner} alt="Category Banner" className="w-full max-w-md h-48 object-cover rounded-lg border" />
                </div>
              </div>
            )}

            {/* Position */}
            <div className="flex items-center gap-6">
              <label className="w-1/4 text-sm font-medium text-gray-700 text-right pr-4">
                Position
              </label>
              <div className="flex-1">
                <p className="text-gray-900">{detailsData.position || 0}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-6">
              <label className="w-1/4 text-sm font-medium text-gray-700 text-right pr-4">
                Status
              </label>
              <div className="flex-1">
                <p className="text-gray-900 capitalize">{detailsData.status || 'active'}</p>
            </div>
            </div>
          </div>
        )}
      </CommonDialog>
    </div>
  );
}
