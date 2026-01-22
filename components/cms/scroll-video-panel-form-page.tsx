'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FormField from '@/components/formField/formField';
import Dropdown from '@/components/customDropdown/customDropdown';
import { MainImageUpload } from '@/components/media/main-image-upload';

interface ScrollVideoPanelData {
  videoUrl: string;
  hashtag: string;
  productId: string;
  productSlug: string;
  displayOrder: number;
}

interface ProductOption {
  value: string;
  label: string;
  slug?: string;
}

interface ScrollVideoPanelFormPageProps {
  panelId?: string;
}

export function ScrollVideoPanelFormPage({ panelId }: ScrollVideoPanelFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<ProductOption[]>([]);

  const normalizeId = (value: any) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && '$oid' in value) {
      return String((value as { $oid?: string }).$oid || '');
    }
    return String(value);
  };

  const [formData, setFormData] = useState<ScrollVideoPanelData>({
    videoUrl: '',
    hashtag: '',
    productId: '',
    productSlug: '',
    displayOrder: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (panelId) {
      fetchPanel();
    } else {
      setFetching(false);
    }
  }, [panelId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products/lookup');
      if (response.ok) {
        const data = await response.json();
        const options = Array.isArray(data)
          ? data.map((product: any) => ({
              value: product._id,
              label: product.name || 'Untitled product',
              slug: product.urlSlug || '',
            }))
          : [];
        setProducts(options);
      }
    } catch (error) {
      console.error('[v0] Failed to load products:', error);
    }
  };

  const fetchPanel = async () => {
    try {
      setFetching(true);
      const response = await fetch(`/api/admin/cms/scroll-video-panels/${panelId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          videoUrl: data.videoUrl || '',
          hashtag: data.hashtag || '',
          productId: normalizeId(data.productId),
          productSlug: data.productSlug ? String(data.productSlug) : '',
          displayOrder: data.displayOrder || 0,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load panel',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Failed to fetch panel:', error);
      toast({
        title: 'Error',
        description: 'Failed to load panel',
        variant: 'destructive',
      });
    } finally {
      setFetching(false);
    }
  };

  const uploadVideo = async (file: File) => {
    const payload = new FormData();
    payload.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: payload,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data.url as string;
  };

  const updateField = (field: keyof ScrollVideoPanelData, value: any) => {
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

  const handleVideoUpload = async (file: File) => {
    if (file.type !== 'video/mp4') {
      toast({
        title: 'Invalid file',
        description: 'Only MP4 videos are supported.',
        variant: 'destructive',
      });
      throw new Error('Only MP4 videos are supported.');
    }

    try {
      setUploading(true);
      const url = await uploadVideo(file);
      toast({
        title: 'Success',
        description: 'Video uploaded successfully',
        variant: 'success',
      });
      return url;
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload video',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const selectedValue = formData.productId || formData.productSlug;

  const productOptions = useMemo(() => {
    if (!selectedValue || products.some(option => option.value === selectedValue)) {
      return products;
    }

    return [
      {
        value: selectedValue,
        label: formData.productSlug || 'Selected product',
        slug: formData.productSlug,
      },
      ...products,
    ];
  }, [products, formData.productId, formData.productSlug, selectedValue]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = 'Video is required';
    }
    if (!formData.hashtag.trim()) {
      newErrors.hashtag = 'Hashtag is required';
    }
    if (!formData.productId && !formData.productSlug) {
      newErrors.productId = 'Product selection is required';
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
      const url = panelId ? `/api/admin/cms/scroll-video-panels/${panelId}` : '/api/admin/cms/scroll-video-panels';
      const method = panelId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Panel ${panelId ? 'updated' : 'created'} successfully`,
          variant: 'success',
        });
        router.push('/admin/cms/scroll-video-panels');
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || `Failed to ${panelId ? 'update' : 'create'} panel`,
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
          <h1 className='text-3xl font-bold'>{panelId ? 'Edit Panel' : 'Add New Panel'}</h1>
        </div>
      </div>

      <Card className='p-6 shadow-md'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <FormField label='Hashtag' required value={formData.hashtag} onChange={e => updateField('hashtag', e.target.value)} placeholder='#StyleInspo' error={errors.hashtag} />

          <div className='space-y-2'>
            <FormField label='Video (MP4)' required hideLabel>
              <MainImageUpload
                value={formData.videoUrl}
                onChange={val => updateField('videoUrl', val)}
                uploadHandler={handleVideoUpload}
                accept='video/mp4'
                previewType='video'
                hideLabel
                recommendedText='Recommended: MP4, max 50MB'
                description={uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              />
            </FormField>
            {errors.videoUrl && <p className='text-sm text-red-500'>{errors.videoUrl}</p>}
          </div>

          <FormField label='Linked Product' required>
            <Dropdown
              value={selectedValue}
              onChange={option => {
                const selected = option as ProductOption;
                updateField('productId', selected.value);
                updateField('productSlug', selected.slug || '');
              }}
              options={productOptions}
              withSearch
              placeholder='Select product'
            />
            {errors.productId && <p className='text-sm text-red-500 mt-1'>{errors.productId}</p>}
          </FormField>

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
              {loading ? 'Saving...' : panelId ? 'Update Panel' : 'Create Panel'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

