'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MainImageUpload } from '@/components/media/main-image-upload';
import { useToast } from '@/hooks/use-toast';
import FormField from '@/components/formField/formField';

interface GalleryFormData {
  image: string;
  displayOrder: number;
}

interface GalleryFormPageProps {
  itemId?: string;
}

export function GalleryFormPage({ itemId }: GalleryFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<GalleryFormData>({
    image: '',
    displayOrder: 0,
  });

  useEffect(() => {
    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/cms/gallery/${itemId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          image: data.image || '',
          displayOrder: data.displayOrder || 0,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load gallery item',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Failed to fetch gallery item:', error);
      toast({
        title: 'Error',
        description: 'Failed to load gallery item',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
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
      return data.url as string;
    } catch (error) {
      console.error('[v0] Image upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateField = (field: keyof GalleryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.image.trim()) {
      newErrors.image = 'Image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the highlighted fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const url = itemId ? `/api/admin/cms/gallery/${itemId}` : '/api/admin/cms/gallery';
      const method = itemId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Gallery item ${itemId ? 'updated' : 'created'} successfully`,
          variant: 'success',
        });
        router.push('/admin/cms/gallery');
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || `Failed to ${itemId ? 'update' : 'create'} gallery item`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Submit error:', error);
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
        <div className='flex items-center gap-4'>
          <Button variant='outline' onClick={() => router.back()} className='gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Back
          </Button>
          <h1 className='text-3xl font-bold'>{itemId ? 'Edit Gallery Item' : 'Add New Gallery Item'}</h1>
        </div>
      </div>

      <Card className='p-6 shadow-md'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <FormField
              label='Image'
              required
              hideLabel
            >
              <MainImageUpload
                value={formData.image}
                onChange={val => updateField('image', val)}
                uploadHandler={uploadImage}
                hideLabel
                recommendedText='Recommended: 800×800px, JPG/PNG'
              />
            </FormField>
            {errors.image && <p className='text-sm text-red-500 mt-1'>{errors.image}</p>}
          </div>

          <FormField
            label='Display Order'
            type='number'
            numericOnly
            value={formData.displayOrder}
            onChange={e => updateField('displayOrder', parseInt(e.target.value) || 0)}
            placeholder='0'
            helperText='Lower numbers appear first'
          />

          <div className='flex justify-end gap-4'>
            <Button type='button' variant='outline' onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading} className='bg-[#22c55e]'>
              {loading ? 'Saving...' : itemId ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

