'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

type FooterPageType = 'about' | 'policies' | 'jewellery-guide' | 'customer-delight';

interface FooterPageFormData {
  pageType: FooterPageType | '';
  pageName: string;
  slug: string;
  content: string;
  status: 'active' | 'inactive';
}

interface FooterContentFormPageProps {
  pageId?: string;
}

const PAGE_TYPES: { value: FooterPageType; label: string }[] = [
  { value: 'about', label: 'About Us' },
  { value: 'policies', label: 'Policies' },
  { value: 'jewellery-guide', label: 'Jewellery Guide' },
  { value: 'customer-delight', label: 'Customer Delight' },
];

const normalizePageType = (value?: string) => {
  if (!value) {
    return '';
  }
  const normalized = value.trim().toLowerCase();
  const slug = normalized.replace(/\s+/g, '-');
  if (PAGE_TYPES.some(option => option.value === slug)) {
    return slug;
  }
  const aliasMap: Record<string, FooterPageType> = {
    'about-us': 'about',
    aboutus: 'about',
    policy: 'policies',
    policies: 'policies',
    'customer-delight': 'customer-delight',
    customerdelight: 'customer-delight',
    'jewellery-guide': 'jewellery-guide',
    jewelleryguide: 'jewellery-guide',
    'jewelry-guide': 'jewellery-guide',
    jewelryguide: 'jewellery-guide',
  };
  return aliasMap[slug] ?? aliasMap[normalized] ?? '';
};

export function FooterContentFormPage({ pageId }: FooterContentFormPageProps) {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resolvedPageId = pageId || (typeof params?.id === 'string' ? params.id : '');

  const [formData, setFormData] = useState<FooterPageFormData>({
    pageType: '',
    pageName: '',
    slug: '',
    content: '',
    status: 'active',
  });

  useEffect(() => {
    if (resolvedPageId) {
      fetchPage(resolvedPageId);
    }
  }, [resolvedPageId]);

  const fetchPage = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/cms/footer-pages/${id}`);
      if (response.ok) {
        const data = await response.json();
        const normalizedType = normalizePageType(data.pageType);
        const rawType = typeof data.pageType === 'string' ? data.pageType.trim() : '';
        const resolvedType = normalizedType || rawType;
        setFormData({
          pageType: resolvedType,
          pageName: data.pageName || '',
          slug: data.slug || '',
          content: data.content || '',
          status: data.status || 'active',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load footer page',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Failed to fetch footer page:', error);
      toast({
        title: 'Error',
        description: 'Failed to load footer page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof FooterPageFormData, value: any) => {
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

  const handleNameChange = (value: string) => {
    updateField('pageName', value);
    if (!resolvedPageId || !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');
      updateField('slug', slug);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.pageType) {
      newErrors.pageType = 'Page type is required';
    }
    if (!formData.pageName.trim()) {
      newErrors.pageName = 'Page name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
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
      const url = resolvedPageId
        ? `/api/admin/cms/footer-pages/${resolvedPageId}`
        : '/api/admin/cms/footer-pages';
      const method = resolvedPageId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Footer page ${resolvedPageId ? 'updated' : 'created'} successfully`,
          variant: 'success',
        });
        router.push('/admin/cms/footer-content');
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || `Failed to ${pageId ? 'update' : 'create'} footer page`,
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
          <h1 className='text-3xl font-bold'>{pageId ? 'Edit Footer Page' : 'Add Footer Page'}</h1>
        </div>
      </div>

      <Card className='p-6 shadow-md'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='pageType'>Page Type</Label>
              <Select value={formData.pageType} onValueChange={value => updateField('pageType', value)}>
                <SelectTrigger className={errors.pageType ? 'border-red-500' : ''}>
                  <SelectValue placeholder='Select page type' />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_TYPES.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  {formData.pageType &&
                    !PAGE_TYPES.some(option => option.value === formData.pageType) && (
                      <SelectItem value={formData.pageType}>{formData.pageType}</SelectItem>
                    )}
                </SelectContent>
              </Select>
              {errors.pageType && <p className='text-xs text-red-600'>{errors.pageType}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='pageName'>Page Name</Label>
              <Input
                id='pageName'
                value={formData.pageName}
                onChange={event => handleNameChange(event.target.value)}
                placeholder='Enter page name'
                className={errors.pageName ? 'border-red-500' : ''}
              />
              {errors.pageName && <p className='text-xs text-red-600'>{errors.pageName}</p>}
            </div>

            <div className='space-y-2 md:col-span-2'>
              <Label htmlFor='slug'>Slug</Label>
              <Input
                id='slug'
                value={formData.slug}
                onChange={event => updateField('slug', event.target.value)}
                placeholder='e.g. shipping-policy'
                className={errors.slug ? 'border-red-500' : ''}
              />
              {errors.slug && <p className='text-xs text-red-600'>{errors.slug}</p>}
            </div>
          </div>

          <MarkdownEditor
            label='Content'
            value={formData.content}
            onChange={value => updateField('content', value)}
            placeholder='Write footer page content in markdown...'
            helperText='Supports Markdown formatting (headings, lists, links, tables).'
            error={errors.content}
          />

          <div className='flex items-center gap-3'>
            <Switch
              checked={formData.status === 'active'}
              onCheckedChange={checked => updateField('status', checked ? 'active' : 'inactive')}
            />
            <span className='text-sm text-slate-600'>Active</span>
          </div>

          <div className='flex justify-end gap-3'>
            <Button type='button' variant='outline' onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type='submit' className='bg-[#22c55e]' disabled={loading}>
              {loading ? 'Saving...' : 'Save Footer Page'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

