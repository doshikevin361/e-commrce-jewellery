'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MainImageUpload } from '@/components/media/main-image-upload';
import { useToast } from '@/hooks/use-toast';
import FormField from '@/components/formField/formField';

interface DazzleFormData {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  displayOrder: number;
}

interface DazzleFormPageProps {
  cardId?: string;
}

export function BannerFormPage({ cardId }: DazzleFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<DazzleFormData>({
    title: '',
    subtitle: '',
    description: '',
    buttonText: 'Explore More',
    buttonLink: '/products',
    image: '',
    displayOrder: 0,
  });

  useEffect(() => {
    if (cardId) {
      fetchCard();
    } else {
      setFetching(false);
    }
  }, [cardId]);

  const fetchCard = async () => {
    try {
      setFetching(true);
      const response = await fetch(`/api/admin/cms/dazzle/${cardId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          description: data.description || '',
          buttonText: data.buttonText || 'Explore More',
          buttonLink: data.buttonLink || '/products',
          image: data.image || '',
          displayOrder: data.displayOrder || 0,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load card',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Failed to fetch dazzle card:', error);
      toast({
        title: 'Error',
        description: 'Failed to load card',
        variant: 'destructive',
      });
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

  const updateField = (field: keyof DazzleFormData, value: any) => {
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
    if (!formData.subtitle.trim()) {
      newErrors.subtitle = 'Subtitle is required';
    }
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
      const url = cardId ? `/api/admin/cms/dazzle/${cardId}` : '/api/admin/cms/dazzle';
      const method = cardId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Dazzle card ${cardId ? 'updated' : 'created'} successfully`,
          variant: 'success',
        });
        router.push('/admin/cms/dazzle');
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || `Failed to ${cardId ? 'update' : 'create'} card`,
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
          <h1 className='text-3xl font-bold'>{cardId ? 'Edit Dazzle Card' : 'Add New Dazzle Card'}</h1>
        </div>
      </div>

      <Card className='p-6 shadow-md'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              label='Title'
              required
              value={formData.title}
              onChange={e => updateField('title', e.target.value)}
              placeholder='Enter section title'
              error={errors.title}
            />

            <FormField
              label='Subtitle'
              required
              value={formData.subtitle}
              onChange={e => updateField('subtitle', e.target.value)}
              placeholder='Enter section subtitle'
              error={errors.subtitle}
            />
          </div>

          <FormField
            label='Description'
            textarea
            value={formData.description}
            onChange={e => updateField('description', e.target.value)}
            placeholder='Enter section description'
          />

          <div>
            <FormField
              label='Section Image'
              required
              hideLabel
            >
              <MainImageUpload
                value={formData.image}
                onChange={val => updateField('image', val)}
                uploadHandler={uploadImage}
                hideLabel
                recommendedText='Recommended: 800×600px, JPG/PNG'
              />
            </FormField>
            {errors.image && <p className='text-sm text-red-500 mt-1'>{errors.image}</p>}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              label='Button Text'
              value={formData.buttonText}
              onChange={e => updateField('buttonText', e.target.value)}
              placeholder='Explore More'
            />

            <FormField
              label='Button Link'
              value={formData.buttonLink}
              onChange={e => updateField('buttonLink', e.target.value)}
              placeholder='/products'
            />
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
              {loading ? 'Saving...' : cardId ? 'Update Card' : 'Create Card'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

