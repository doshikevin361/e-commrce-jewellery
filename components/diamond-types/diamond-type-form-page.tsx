'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FormField from '../formField/formField';

interface DiamondTypeFormPageProps {
  diamondTypeId?: string;
}

export function DiamondTypeFormPage({ diamondTypeId }: DiamondTypeFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    status: 'active' as 'active' | 'inactive',
    displayOrder: 0,
  });

  useEffect(() => {
    if (diamondTypeId) {
      fetchDiamondType();
    } else {
      fetchMaxOrder();
    }
  }, [diamondTypeId]);

  const fetchMaxOrder = async () => {
    try {
      const response = await fetch('/api/admin/diamond-types');
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data.diamondTypes) ? data.diamondTypes : [];
        const maxOrder =
          items.length > 0 ? Math.max(...items.map((item: any) => item.displayOrder || 0)) : 0;
        setFormData((prev) => ({ ...prev, displayOrder: maxOrder + 1 }));
      }
    } catch (error) {
      console.error('Failed to fetch max order:', error);
    }
  };

  const fetchDiamondType = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/diamond-types/${diamondTypeId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          status: data.status || 'active',
          displayOrder: data.displayOrder || 0,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load diamond type',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch diamond type:', error);
      toast({
        title: 'Error',
        description: 'Failed to load diamond type',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const url = diamondTypeId ? `/api/admin/diamond-types/${diamondTypeId}` : '/api/admin/diamond-types';
      const method = diamondTypeId ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        displayOrder: formData.displayOrder || 0,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: diamondTypeId ? 'Diamond type updated successfully' : 'Diamond type created successfully',
          variant: 'success',
        });
        router.push('/admin/diamond-types');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save diamond type');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save diamond type',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && diamondTypeId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F3B29]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {diamondTypeId ? 'Edit Diamond Type' : 'Add Diamond Type'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Diamond Type Information</h2>
          <div className="space-y-4">
            <FormField
              label="Name *"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              type="text"
              placeholder="Example: Natural Diamonds, Lab Grown Diamonds"
            />

            <FormField
              label="Display Order"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              type="number"
              placeholder="Example: 1"
            />

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Status</label>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="status-active"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-4 h-4"
                />
                <label htmlFor="status-active" className="text-sm">Active</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="status-inactive"
                  name="status"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-4 h-4"
                />
                <label htmlFor="status-inactive" className="text-sm">Inactive</label>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-[#1F3B29] hover:bg-[#2d4a3a] text-white">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {diamondTypeId ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              diamondTypeId ? 'Update Diamond Type' : 'Create Diamond Type'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}


