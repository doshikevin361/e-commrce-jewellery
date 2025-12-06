'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MainImageUpload } from '@/components/media/main-image-upload';
import { useToast } from '@/hooks/use-toast';
import FormField from '@/components/formField/formField';

interface NewArrivalsBannerData {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
}

export function NewArrivalsFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<NewArrivalsBannerData>({
    title: 'New Arrivals',
    subtitle: '💎 500+ New Items',
    description: 'New Arrivals Dropping Daily, Monday through Friday.\nExplore the Latest Launches Now!',
    backgroundImage: '',
  });

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      setFetching(true);
      const response = await fetch('/api/admin/cms/new-arrivals');
      if (response.ok) {
        const data = await response.json();
        if (data.banner) {
          setFormData({
            title: data.banner.title || 'New Arrivals',
            subtitle: data.banner.subtitle || data.banner.badgeText || '💎 500+ New Items',
            description: data.banner.description || '',
            backgroundImage: data.banner.backgroundImage || '',
          });
        }
      }
    } catch (error) {
      console.error('[v0] Failed to fetch banner:', error);
    } finally {
      setFetching(false);
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

  const updateField = (field: keyof NewArrivalsBannerData, value: any) => {
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
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.backgroundImage.trim()) {
      newErrors.backgroundImage = 'Background image is required';
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
      const response = await fetch('/api/admin/cms/new-arrivals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banner: formData }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Banner updated successfully',
          variant: 'success',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to update banner',
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

  if (fetching) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-gray-500'>Loading...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' onClick={() => router.back()} className='gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Back
          </Button>
          <h1 className='text-3xl font-bold'>New Arrivals Banner</h1>
        </div>
      </div>

      <Card className='p-6 shadow-md'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <FormField
            label='Title'
            required
            value={formData.title}
            onChange={e => updateField('title', e.target.value)}
            placeholder='New Arrivals'
            error={errors.title}
          />

          <FormField
            label='Subtitle'
            value={formData.subtitle}
            onChange={e => updateField('subtitle', e.target.value)}
            placeholder='💎 500+ New Items'
            helperText='Optional subtitle or badge text'
          />

          <FormField
            label='Description'
            textarea
            value={formData.description}
            onChange={e => updateField('description', e.target.value)}
            placeholder='New Arrivals Dropping Daily, Monday through Friday.'
            helperText='Use line breaks for multiple lines'
          />

          <div>
            <FormField label='Background Image' required hideLabel>
              <MainImageUpload
                value={formData.backgroundImage}
                onChange={val => updateField('backgroundImage', val)}
                uploadHandler={uploadImage}
                hideLabel
                recommendedText='Recommended: 1920×420px, JPG/PNG'
              />
            </FormField>
            {errors.backgroundImage && <p className='text-sm text-red-500 mt-1'>{errors.backgroundImage}</p>}
          </div>

          <div className='flex justify-end gap-4'>
            <Button type='button' variant='outline' onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading} className='bg-[#22c55e]'>
              {loading ? 'Saving...' : 'Save Banner'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

