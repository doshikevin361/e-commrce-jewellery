'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { MainImageUpload } from '@/components/media/main-image-upload';
import { useToast } from '@/hooks/use-toast';
import FormField from '@/components/formField/formField';
import { Label } from '@radix-ui/react-dropdown-menu';

interface LogoFormData {
  name: string;
  imageUrl: string;
  altText: string;
  isActive: boolean;
  width: number;
  height: number;
}

interface LogoFormPageProps {
  logoId?: string;
}

export function LogoFormPage({ logoId }: LogoFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<LogoFormData>({
    name: '',
    imageUrl: '',
    altText: 'Website Logo',
    isActive: false,
    width: 150,
    height: 50,
  });

  useEffect(() => {
    if (logoId) {
      fetchLogo();
    }
  }, [logoId]);

  const fetchLogo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/cms/logos/${logoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.logo.name || '',
          imageUrl: data.logo.imageUrl || '',
          altText: data.logo.altText || 'Website Logo',
          isActive: data.logo.isActive || false,
          width: data.logo.width || 150,
          height: data.logo.height || 50,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load logo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Failed to fetch logo:', error);
      toast({
        title: 'Error',
        description: 'Failed to load logo',
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

  const updateField = (field: keyof LogoFormData, value: any) => {
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
    if (!formData.name.trim()) {
      newErrors.name = 'Logo name is required';
    }
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Logo image is required';
    }
    if (formData.width < 10 || formData.width > 500) {
      newErrors.width = 'Width must be between 10 and 500';
    }
    if (formData.height < 10 || formData.height > 200) {
      newErrors.height = 'Height must be between 10 and 200';
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
      const token = localStorage.getItem('adminToken');
      const url = logoId ? `/api/admin/cms/logos/${logoId}` : '/api/admin/cms/logos';
      const method = logoId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Logo ${logoId ? 'updated' : 'created'} successfully`,
          variant: 'success',
        });
        router.push('/admin/cms/logos');
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || `Failed to ${logoId ? 'update' : 'create'} logo`,
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
          <h1 className='text-3xl font-bold'>{logoId ? 'Edit Logo' : 'Add New Logo'}</h1>
        </div>
      </div>

      <Card className='p-6 shadow-md'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              label='Logo Name'
              required
              value={formData.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder='e.g., Main Logo, Dark Logo'
              error={errors.name}
              helperText='A descriptive name for this logo'
            />

            <FormField
              label='Alt Text'
              value={formData.altText}
              onChange={e => updateField('altText', e.target.value)}
              placeholder='Website Logo'
              helperText='Alternative text for accessibility'
            />
          </div>

          <div>
            <FormField label='Logo Image' required hideLabel>
              <MainImageUpload
                value={formData.imageUrl}
                onChange={val => updateField('imageUrl', val)}
                uploadHandler={uploadImage}
                hideLabel
                recommendedText='Recommended: PNG with transparent background, max 500×200px'
              />
            </FormField>
            {errors.imageUrl && <p className='text-sm text-red-500 mt-1'>{errors.imageUrl}</p>}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              label='Width (px)'
              type='number'
              numericOnly
              required
              value={formData.width}
              onChange={e => updateField('width', parseInt(e.target.value) || 150)}
              placeholder='150'
              error={errors.width}
              helperText='Logo width in pixels (10-500)'
            />

            <FormField
              label='Height (px)'
              type='number'
              numericOnly
              required
              value={formData.height}
              onChange={e => updateField('height', parseInt(e.target.value) || 50)}
              placeholder='50'
              error={errors.height}
              helperText='Logo height in pixels (10-200)'
            />
          </div>

          <div className='flex items-center gap-2'>
            <Switch
              checked={formData.isActive}
              onCheckedChange={checked => updateField('isActive', checked)}
            />
            <Label>Set as Active Logo (will deactivate all other logos)</Label>
          </div>

          <div className='flex justify-end gap-4'>
            <Button type='button' variant='outline' onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading} className='bg-[#22c55e]'>
              {loading ? 'Saving...' : logoId ? 'Update Logo' : 'Create Logo'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
