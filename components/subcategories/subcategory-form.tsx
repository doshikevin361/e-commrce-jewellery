'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MainImageUpload } from '@/components/media/main-image-upload';
import { useToast } from '@/hooks/use-toast';

interface SubcategoryFormData {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  image: string;
  banner: string;
  position: number;
  status: 'active' | 'inactive';
}

interface Category {
  _id: string;
  name: string;
}

interface SubcategoryFormProps {
  subcategory?: SubcategoryFormData & { _id: string };
  isEdit?: boolean;
}

export function SubcategoryForm({ subcategory, isEdit = false }: SubcategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SubcategoryFormData>({
    name: '',
    slug: '',
    categoryId: '',
    description: '',
    image: '',
    banner: '',
    position: 0,
    status: 'active',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (subcategory) {
      console.log('Loading subcategory data:', subcategory);
      setFormData({
        name: subcategory.name || '',
        slug: subcategory.slug || '',
        categoryId: subcategory.categoryId || '',
        description: subcategory.description || '',
        image: subcategory.image || '',
        banner: subcategory.banner || '',
        position: subcategory.position || 0,
        status: subcategory.status || 'active',
      });
    }
  }, [subcategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        // Filter to only show parent categories (those without parentId)
        const parentCategories = (Array.isArray(data.categories) ? data.categories : []).filter(
          (cat: any) => !cat.parentId
        );
        setCategories(parentCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'name' && !isEdit) {
      setFormData(prev => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, ''),
      }));
    }
  };

  const uploadSubcategoryAsset = async (file: File) => {
    try {
      const payload = new FormData();
      payload.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: payload,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Upload failed');
      }
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
        variant: 'success',
      });
      return data.url as string;
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug || !formData.categoryId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/admin/subcategories/${(subcategory as any)?._id}` : '/api/admin/subcategories';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Subcategory ${isEdit ? 'updated' : 'created'} successfully`,
          variant: 'success',
        });
        router.push('/admin/subcategories');
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || `Failed to ${isEdit ? 'update' : 'create'} subcategory`,
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
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>{isEdit ? 'Edit Subcategory' : 'Add New Subcategory'}</h1>
        <Button variant='outline' onClick={() => router.push('/admin/subcategories')}>
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className='p-6'>
          <div className='space-y-4'>
            {/* Name Field */}
            <div className='flex items-center gap-6'>
              <Label htmlFor='name' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4'>
                Subcategory Name <span className='text-red-500'>*</span>
              </Label>
              <div className='flex-1'>
                <Input
                  id='name'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder='e.g., Wedding Rings, Necklaces'
                  className='h-[48px]'
                  required
                />
              </div>
            </div>

            {/* Slug Field */}
            <div className='flex items-center gap-6'>
              <Label htmlFor='slug' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4'>
                URL Slug <span className='text-red-500'>*</span>
              </Label>
              <div className='flex-1'>
                <Input
                  id='slug'
                  name='slug'
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder='auto-generated'
                  className='h-[48px]'
                  required
                />
              </div>
            </div>

            {/* Parent Category Field */}
            <div className='flex items-center gap-6'>
              <Label htmlFor='categoryId' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4'>
                Parent Category <span className='text-red-500'>*</span>
              </Label>
              <div className='flex-1'>
                <Select value={formData.categoryId} onValueChange={val => setFormData(prev => ({ ...prev, categoryId: val }))}>
                  <SelectTrigger className='h-[48px]'>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description Field */}
            <div className='flex items-start gap-6'>
              <Label htmlFor='description' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3'>
                Description
              </Label>
              <div className='flex-1'>
                <Textarea
                  id='description'
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Add detailed subcategory information'
                  rows={4}
                />
              </div>
            </div>

            {/* Image Field */}
            <div className='flex items-start gap-6'>
              <Label className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3'>Image</Label>
              <div className='flex-1'>
                <MainImageUpload
                  value={formData.image}
                  onChange={val => setFormData(prev => ({ ...prev, image: val }))}
                  uploadHandler={uploadSubcategoryAsset}
                  hideLabel
                  recommendedText='Recommended: 500×500px, JPG/PNG'
                />
              </div>
            </div>

            {/* Banner Field */}
            <div className='flex items-start gap-6'>
              <Label className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3'>Banner</Label>
              <div className='flex-1'>
                <MainImageUpload
                  value={formData.banner}
                  onChange={val => setFormData(prev => ({ ...prev, banner: val }))}
                  uploadHandler={uploadSubcategoryAsset}
                  hideLabel
                  recommendedText='Recommended: 1920×400px, JPG/PNG'
                />
              </div>
            </div>

            {/* Position Field */}
            <div className='flex items-center gap-6'>
              <Label htmlFor='position' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4'>
                Position
              </Label>
              <div className='flex-1'>
                <Input
                  id='position'
                  name='position'
                  type='number'
                  min='0'
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder='0'
                  className='h-[48px]'
                />
                <p className='text-sm text-muted-foreground mt-1'>Lower numbers appear first</p>
              </div>
            </div>

            {/* Status Field */}
            <div className='flex items-center gap-6'>
              <Label htmlFor='status' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4'>
                Status
              </Label>
              <div className='flex-1'>
                <div className='flex items-center gap-3'>
                  <Switch
                    id='status'
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
                  />
                  <Label htmlFor='status' className='text-sm text-gray-700 cursor-pointer'>
                    {formData.status === 'active' ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className='flex gap-2 justify-end mt-6'>
          <Button type='button' variant='outline' onClick={() => router.push('/admin/subcategories')} disabled={loading}>
            Cancel
          </Button>
          <Button type='submit' disabled={loading} className='bg-[#22c55e] hover:bg-[#1ea34b]'>
            {loading ? 'Saving...' : isEdit ? 'Update Subcategory' : 'Create Subcategory'}
          </Button>
        </div>
      </form>
    </div>
  );
}
