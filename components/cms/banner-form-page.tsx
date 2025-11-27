'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { MainImageUpload } from '@/components/media/main-image-upload';
import { useToast } from '@/hooks/use-toast';

interface BannerFormData {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
  buttonText: string;
  type: 'main' | 'side';
  displayOrder: number;
  status: 'active' | 'inactive';
}

interface BannerFormPageProps {
  bannerId?: string;
}

export function BannerFormPage({ bannerId }: BannerFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    link: '',
    buttonText: '',
    type: 'main',
    displayOrder: 0,
    status: 'active',
  });

  useEffect(() => {
    if (bannerId) {
      fetchBanner();
    }
  }, [bannerId]);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/cms/banners/${bannerId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title || '',
          description: data.description || '',
          image: data.image || '',
          link: data.link || '',
          buttonText: data.buttonText || '',
          displayOrder: data.displayOrder || 0,
          status: data.status || 'active',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load banner',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Failed to fetch banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to load banner',
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

  const updateField = (field: keyof BannerFormData, value: any) => {
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
      const url = bannerId ? `/api/admin/cms/banners/${bannerId}` : '/api/admin/cms/banners';
      const method = bannerId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Banner ${bannerId ? 'updated' : 'created'} successfully`,
          variant: 'success',
        });
        router.push('/admin/cms/banners');
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || `Failed to ${bannerId ? 'update' : 'create'} banner`,
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
          <h1 className='text-3xl font-bold'>{bannerId ? 'Edit Banner' : 'Add New Banner'}</h1>
        </div>
      </div>

      <Card className='p-6 shadow-md'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='title'>
                Title <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='title'
                value={formData.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder='Enter banner title'
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className='text-sm text-red-500'>{errors.title}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='subtitle'>
                Subtitle <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='subtitle'
                value={formData.subtitle}
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder='Enter banner subtitle'
                className={errors.subtitle ? 'border-red-500' : ''}
              />
              {errors.subtitle && <p className='text-sm text-red-500'>{errors.subtitle}</p>}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='type'>
                Banner Type <span className='text-red-500'>*</span>
              </Label>
              <select
                id='type'
                value={formData.type}
                onChange={e => updateField('type', e.target.value as 'main' | 'side')}
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <option value='main'>Main Banner (Large)</option>
                <option value='side'>Side Banner (Small)</option>
              </select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='displayOrder'>Display Order</Label>
              <Input
                id='displayOrder'
                type='number'
                value={formData.displayOrder}
                onChange={e => updateField('displayOrder', parseInt(e.target.value) || 0)}
                placeholder='0'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder='Enter banner description'
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='image'>
              Banner Image <span className='text-red-500'>*</span>
            </Label>
            <MainImageUpload
              value={formData.image}
              onChange={val => updateField('image', val)}
              uploadHandler={uploadImage}
              hideLabel
              recommendedText='Recommended: 1920×600px, JPG/PNG'
            />
            {errors.image && <p className='text-sm text-red-500'>{errors.image}</p>}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='link'>Link URL</Label>
              <Input
                id='link'
                value={formData.link}
                onChange={e => updateField('link', e.target.value)}
                placeholder='https://example.com'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='buttonText'>Button Text</Label>
              <Input
                id='buttonText'
                value={formData.buttonText}
                onChange={e => updateField('buttonText', e.target.value)}
                placeholder='Shop Now'
              />
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Switch
              checked={formData.status === 'active'}
              onCheckedChange={checked => updateField('status', checked ? 'active' : 'inactive')}
            />
            <Label>Active</Label>
          </div>

          <div className='flex justify-end gap-4'>
            <Button type='button' variant='outline' onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading} className='bg-[#22c55e]'>
              {loading ? 'Saving...' : bannerId ? 'Update Banner' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

