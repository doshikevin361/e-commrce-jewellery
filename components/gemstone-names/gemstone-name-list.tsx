'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { DataTableBody } from '@/components/ui/data-table-body';

interface GemstoneName {
  _id: string;
  name: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export function GemstoneNameList() {
  const router = useRouter();
  const { toast } = useToast();
  const [gemstoneNames, setGemstoneNames] = useState<GemstoneName[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchGemstoneNames();
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(gemstoneNames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGemstoneNames = gemstoneNames.slice(startIndex, endIndex);

  const fetchGemstoneNames = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/gemstone-names?${params}`);
      if (response.ok) {
        const data = await response.json();
        setGemstoneNames(Array.isArray(data.gemstoneNames) ? data.gemstoneNames : []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch gemstone names',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch gemstone names:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch gemstone names',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeletingId(deleteId);
      const response = await fetch(`/api/admin/gemstone-names/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Gemstone name deleted successfully',
          variant: 'success',
        });
        fetchGemstoneNames();
        setDeleteId(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete gemstone name');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete gemstone name',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      setTogglingStatusId(id);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      const currentItem = gemstoneNames.find(item => item._id === id);
      if (!currentItem) {
        throw new Error('Item not found');
      }

      const response = await fetch(`/api/admin/gemstone-names/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentItem.name,
          status: newStatus,
          displayOrder: currentItem.displayOrder || 0,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Gemstone name ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
          variant: 'success',
        });
        fetchGemstoneNames();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setTogglingStatusId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gemstone Names</h1>
          <p className="text-gray-600 mt-1">Manage gemstone names</p>
        </div>
        <Button
          onClick={() => router.push('/admin/gemstone-names/add')}
          className="bg-[#1F3B29] hover:bg-[#2d4a3a] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Gemstone Name
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search gemstone names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-center">Order</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <DataTableBody
              loading={loading}
              data={paginatedGemstoneNames}
              columns={4}
              loadingText="Loading gemstone names..."
              emptyText="No gemstone names found"
            >
              {paginatedGemstoneNames.map((gemstoneName) => (
                <TableRow key={gemstoneName._id}>
                  <TableCell className="font-medium">{gemstoneName.name}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={gemstoneName.status === 'active'}
                      onCheckedChange={() => handleStatusToggle(gemstoneName._id, gemstoneName.status)}
                      disabled={togglingStatusId === gemstoneName._id}
                    />
                  </TableCell>
                  <TableCell className="text-center">{gemstoneName.displayOrder || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/gemstone-names/edit/${gemstoneName._id}`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(gemstoneName._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </DataTableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, gemstoneNames.length)} of {gemstoneNames.length} gemstone names
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the gemstone name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={!!deletingId}
            >
              {deletingId ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

