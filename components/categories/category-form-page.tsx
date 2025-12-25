'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { MainImageUpload } from '@/components/media/main-image-upload';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CategoryTree } from './category-tree';
import Dropdown from '@/components/customDropdown/customDropdown';
import { X, Plus } from 'lucide-react';

interface Occasion {
  name: string;
  productId?: string;
  image?: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  shortDescription: string;
  image: string;
  icon: string;
  banner: string;
  displayOnHomepage: boolean;
  displayOrder: number;
  position: number;
  status: 'active' | 'inactive';
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  canonicalUrl: string;
  ogImage: string;
  commissionRate: number;
  featured: boolean;
  showProductCount: boolean;
  occasions?: Occasion[];
  megaMenuProductId?: string;
}

interface CategoryFormPageProps {
  categoryId?: string;
}

export function CategoryFormPage({ categoryId }: CategoryFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    parentId: null,
    description: '',
    shortDescription: '',
    image: '',
    icon: '',
    banner: '',
    displayOnHomepage: true,
    displayOrder: 0,
    position: 0,
    status: 'active',
    metaTitle: '',
    metaDescription: '',
    focusKeywords: [],
    canonicalUrl: '',
    ogImage: '',
    commissionRate: 0,
    featured: false,
    showProductCount: true,
    occasions: [],
    megaMenuProductId: '',
  });

  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [products, setProducts] = useState<Array<{ _id: string; name: string; mainImage?: string }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [newOccasionName, setNewOccasionName] = useState('');
  const [selectedProductForOccasion, setSelectedProductForOccasion] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchParentCategories();
    fetchProducts();
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  useEffect(() => {
    // Hide scroll
    document.body.style.overflowY = 'hidden';

    // Cleanup when leaving page
    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, []);

  const fetchParentCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        const categories = Array.isArray(data) ? data : Array.isArray(data.categories) ? data.categories : [];
        // Filter out current category if editing
        const filtered = categoryId ? categories.filter((cat: any) => cat._id !== categoryId) : categories;
        setParentCategories(filtered);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch parent categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const clearFieldError = (field: string) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateField = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    clearFieldError(field as string);
  };

  const uploadCategoryAsset = async (file: File) => {
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
        variant : 'success'
      });
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

  const fetchCategory = async () => {
    try {
      setLoading(true);
      console.log('[v0] Fetching category:', categoryId);
      const response = await fetch(`/api/admin/categories/${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('[v0] Fetched category data:', data);
        setFormData(prev => ({
          ...prev,
          ...data,
          parentId: data.parentId || null,
          icon: data.icon || data.image || '',
          focusKeywords: Array.isArray(data.focusKeywords) ? data.focusKeywords : [],
          status: data.status || 'active',
          occasions: Array.isArray(data.occasions) ? data.occasions : [],
          megaMenuProductId: data.megaMenuProductId || '',
        }));
      } else {
        const error = await response.json();
        console.error('[v0] Failed to fetch category:', error);
        toast({
          title: 'Error',
          description: error.error || 'Failed to load category details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Failed to fetch category:', error);
      toast({
        title: 'Error',
        description: 'Failed to load category details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Convert number fields to integers
    const processedValue =
      name === 'position' || name === 'displayOrder' || name === 'commissionRate' ? (value === '' ? 0 : parseInt(value) || 0) : value;

    updateField(name as keyof CategoryFormData, processedValue);

    // Auto-generate slug from name
    if (name === 'name' && !categoryId) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
      updateField('slug', slug);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const url = categoryId ? `/api/admin/categories/${categoryId}` : '/api/admin/categories';
      const method = categoryId ? 'PUT' : 'POST';

      const { _id, createdAt, updatedAt, ...submitData } = formData as any;

      console.log('[v0] Submitting category data:', submitData);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Category ${categoryId ? 'updated' : 'created'} successfully`,
          variant:'success'
        });
        router.push('/admin/categories');
      } else {
        const error = await response.json();
        console.error('[v0] Server error:', error);
        toast({
          title: 'Error',
          description: error.details || error.error || 'Failed to save category',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Submit error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the category',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && categoryId) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-lg'>Loading category...</p>
      </div>
    );
  }

  const handleCategorySelect = (selectedId: string) => {
    router.push(`/admin/categories/${selectedId}`);
  };

  const handleCategoryUpdate = () => {
    fetchParentCategories();
    if (categoryId) {
      fetchCategory();
    }
  };

  return (
    <div className='flex h-[calc(100vh-4rem)]'>
      {/* Left Sidebar - Category Tree */}
      <div className='w-80 flex-shrink-0'>
        <CategoryTree onCategorySelect={handleCategorySelect} selectedCategoryId={categoryId} onCategoryUpdate={handleCategoryUpdate} />
      </div>

      {/* Right Side - Form */}
      <div className='flex-1 overflow-y-auto p-6'>
        <div className='space-y-6 max-w-4xl'>
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='icon' onClick={() => router.push('/admin/categories')}>
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold'>{categoryId ? 'Edit Category' : 'Add Category'}</h1>
              <p className='text-sm text-muted-foreground'>Manage category information and settings.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className='p-6 space-y-6'>
              {/* Name Field */}
              <div className='flex items-center gap-6'>
                <label htmlFor='name' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4'>
                  Name <span className='text-red-500'>*</span>
                </label>
                <div className='flex-1'>
                  <Input
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder='Enter Category Name'
                    className='h-[48px]'
                  />
                  {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name}</p>}
                </div>
              </div>

              {/* Description Field */}
              <div className='flex items-start gap-6'>
                <label htmlFor='description' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3'>
                  Description
                </label>
                <div className='flex-1'>
                  <textarea
                    id='description'
                    name='description'
                    value={formData.description}
                    onChange={e => updateField('description', e.target.value)}
                    placeholder='Enter Category Description'
                    className='w-full border rounded-md p-3 text-sm bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition min-h-[100px] resize-y'
                    rows={4}
                  />
                </div>
              </div>

              {/* Commission Rate Field */}
              <div className='flex items-center gap-6'>
                <label htmlFor='commissionRate' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4'>
                  Commission Rate
                </label>
                <div className='flex-1'>
                  <div className='relative'>
                    <Input
                      id='commissionRate'
                      name='commissionRate'
                      type='number'
                      value={formData.commissionRate}
                      onChange={handleInputChange}
                      placeholder='Enter Commission Rate'
                      className='h-[48px] pr-10'
                      step='0.1'
                    />
                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500'>%</span>
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>*Define the percentage of earnings retained as commission.</p>
                </div>
              </div>

              {/* Select Parent Field */}
              <div className='flex items-center gap-6'>
                <label htmlFor='parentId' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4'>
                  Select Parent
                </label>
                <div className='flex-1'>
                  <Select
                    value={formData.parentId || 'none'}
                    onValueChange={val => updateField('parentId', val === 'none' ? null : val)}
                    disabled={loadingCategories}>
                    <SelectTrigger id='parentId' className='h-[48px]'>
                      <SelectValue placeholder='Select' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>All</SelectItem>
                      {parentCategories.map(cat => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Field */}
              <div className='flex items-start gap-6'>
                <label className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3'>Image</label>
                <div className='flex-1'>
                  <MainImageUpload
                    value={formData.image}
                    onChange={val => updateField('image', val)}
                    uploadHandler={uploadCategoryAsset}
                    hideLabel
                  />
                </div>
              </div>

              {/* Icon Field */}
              <div className='flex items-start gap-6'>
                <label className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3'>Icon</label>
                <div className='flex-1'>
                  <MainImageUpload
                    value={formData.icon}
                    onChange={val => updateField('icon', val)}
                    uploadHandler={uploadCategoryAsset}
                    hideLabel
                  />
                </div>
              </div>

              {/* Meta Title Field */}
              <div className='flex items-center gap-6'>
                <label htmlFor='metaTitle' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4'>
                  Meta Title
                </label>
                <div className='flex-1'>
                  <Input
                    id='metaTitle'
                    name='metaTitle'
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder='Enter Meta Title'
                    className='h-[48px]'
                  />
                </div>
              </div>

              {/* Meta Description Field */}
              <div className='flex items-start gap-6'>
                <label htmlFor='metaDescription' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3'>
                  Meta Description
                </label>
                <div className='flex-1'>
                  <textarea
                    id='metaDescription'
                    name='metaDescription'
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    placeholder='Enter Meta Description'
                    className='w-full border rounded-md p-3 text-sm bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition min-h-[100px] resize-y'
                    rows={4}
                  />
                </div>
              </div>

              {/* Image Upload Component (Second Image) */}
              <div className='flex items-start gap-6'>
                <label className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3'>Image</label>
                <div className='flex-1'>
                  <MainImageUpload
                    value={formData.banner}
                    onChange={val => updateField('banner', val)}
                    uploadHandler={uploadCategoryAsset}
                    hideLabel
                  />
                </div>
              </div>

              {/* Position Field */}
              <div className='flex items-center gap-6'>
                <label htmlFor='position' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4'>
                  Position
                </label>
                <div className='flex-1'>
                  <Input
                    id='position'
                    name='position'
                    type='number'
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder='Enter Position'
                    className='h-[48px]'
                    min='0'
                  />
                </div>
              </div>

              {/* MegaMenu Product Selection */}
              <div className='flex items-center gap-6'>
                <label htmlFor='megaMenuProductId' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4'>
                  MegaMenu Featured Product
                </label>
                <div className='flex-1'>
                  <Dropdown
                    options={[
                      { label: 'None', value: '' },
                      ...products.map(p => ({ label: p.name, value: p._id })),
                    ]}
                    placeholder='Select a product to display in MegaMenu'
                    withSearch={true}
                    value={formData.megaMenuProductId || ''}
                    onChange={option => updateField('megaMenuProductId', option.value)}
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    Product image will be shown beside the "Shop by Occasion" section in the MegaMenu
                  </p>
                </div>
              </div>

              {/* Occasions Management */}
              <div className='flex items-start gap-6'>
                <label className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4 pt-3'>
                  Shop by Occasion
                </label>
                <div className='flex-1 space-y-4'>
                  <div className='space-y-3'>
                    {(formData.occasions || []).map((occasion, index) => (
                      <div key={index} className='flex items-center gap-3 p-3 border rounded-lg bg-gray-50'>
                        <div className='flex-1'>
                          <div className='font-medium text-sm text-gray-700 mb-2'>{occasion.name}</div>
                          <Dropdown
                            options={[
                              { label: 'No product selected', value: '' },
                              ...products.map(p => ({ label: p.name, value: p._id })),
                            ]}
                            placeholder='Select product for this occasion'
                            withSearch={true}
                            value={occasion.productId || ''}
                            onChange={option => {
                              const updatedOccasions = [...(formData.occasions || [])];
                              updatedOccasions[index] = {
                                ...updatedOccasions[index],
                                productId: option.value,
                                image: products.find(p => p._id === option.value)?.mainImage || undefined,
                              };
                              updateField('occasions', updatedOccasions);
                            }}
                          />
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            const updatedOccasions = (formData.occasions || []).filter((_, i) => i !== index);
                            updateField('occasions', updatedOccasions);
                          }}
                          className='text-red-500 hover:text-red-700 hover:bg-red-50'>
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className='flex gap-2'>
                    <Input
                      placeholder='Enter occasion name (e.g., Daily Wear, Wedding)'
                      value={newOccasionName}
                      onChange={e => setNewOccasionName(e.target.value)}
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newOccasionName.trim()) {
                            const updatedOccasions = [...(formData.occasions || []), { name: newOccasionName.trim() }];
                            updateField('occasions', updatedOccasions);
                            setNewOccasionName('');
                          }
                        }
                      }}
                      className='flex-1'
                    />
                    <Button
                      type='button'
                      onClick={() => {
                        if (newOccasionName.trim()) {
                          const updatedOccasions = [...(formData.occasions || []), { name: newOccasionName.trim() }];
                          updateField('occasions', updatedOccasions);
                          setNewOccasionName('');
                        }
                      }}
                      disabled={!newOccasionName.trim()}
                      className='bg-primary text-white'>
                      <Plus className='h-4 w-4 mr-1' />
                      Add
                    </Button>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Add occasion categories that will appear in the "Shop by Occasion" section of the MegaMenu
                  </p>
                </div>
              </div>

              {/* Status Toggle */}
              <div className='flex items-center gap-6'>
                <label htmlFor='status' className='w-1/4 text-sm font-medium text-gray-700 text-right pr-4'>
                  Status
                </label>
                <div className='flex-1'>
                  <div className='flex items-center gap-3'>
                    <Switch
                      id='status'
                      checked={formData.status === 'active'}
                      onCheckedChange={checked => updateField('status', checked ? 'active' : 'inactive')}
                    />
                    <Label htmlFor='status' className='text-sm text-gray-700 cursor-pointer'>
                      {formData.status === 'active' ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </div>
              </div>
            </Card>

            <div className='flex justify-end gap-3 mt-5'>
              <Button type='button' variant='outline' onClick={() => router.push('/admin/categories')} disabled={loading}>
                Cancel
              </Button>
              <Button type='submit' disabled={loading} className='bg-primary text-white'>
                {loading ? 'Saving...' : categoryId ? 'Update Category' : 'Save'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
