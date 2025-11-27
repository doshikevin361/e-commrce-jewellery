'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface ContactFormData {
  title: string;
  content: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  mapEmbedCode: string;
  metaTitle: string;
  metaDescription: string;
  status: 'active' | 'inactive';
}

export function ContactFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ContactFormData>({
    title: 'Contact Us',
    content: '',
    address: '',
    phone: '',
    email: '',
    workingHours: '',
    mapEmbedCode: '',
    metaTitle: '',
    metaDescription: '',
    status: 'active',
  });

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const response = await fetch('/api/admin/cms/contact');
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch contact data:', error);
    }
  };

  const updateField = (field: keyof ContactFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
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
      const response = await fetch('/api/admin/cms/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Contact page updated successfully',
          variant: 'success',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to update contact page',
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
          <h1 className='text-3xl font-bold'>Contact Page Management</h1>
        </div>
      </div>

      <Tabs defaultValue='content' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='content'>Content</TabsTrigger>
          <TabsTrigger value='contact-info'>Contact Info</TabsTrigger>
          <TabsTrigger value='seo'>SEO</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value='content' className='space-y-6'>
            <Card className='p-6 shadow-md'>
              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='title'>
                      Page Title <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='title'
                      value={formData.title}
                      onChange={e => updateField('title', e.target.value)}
                      placeholder='Enter page title'
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className='text-sm text-red-500'>{errors.title}</p>}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='status'>Status</Label>
                    <div className='flex items-center space-x-2'>
                      <Switch
                        id='status'
                        checked={formData.status === 'active'}
                        onCheckedChange={checked => updateField('status', checked ? 'active' : 'inactive')}
                      />
                      <Label htmlFor='status'>{formData.status === 'active' ? 'Active' : 'Inactive'}</Label>
                    </div>
                  </div>
                </div>

                <RichTextEditor
                  label='Page Content'
                  value={formData.content}
                  onChange={value => updateField('content', value)}
                  placeholder='Enter the main content for your contact page...'
                  required
                  error={errors.content}
                  helperText='Use the rich text editor to format your contact page content with headings, lists, links, images, and more.'
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value='contact-info' className='space-y-6'>
            <Card className='p-6 shadow-md'>
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>Contact Information</h3>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>
                      Email Address <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      value={formData.email}
                      onChange={e => updateField('email', e.target.value)}
                      placeholder='contact@example.com'
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='phone'>Phone Number</Label>
                    <Input
                      id='phone'
                      value={formData.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      placeholder='+1 (555) 123-4567'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='address'>Address</Label>
                  <Input
                    id='address'
                    value={formData.address}
                    onChange={e => updateField('address', e.target.value)}
                    placeholder='123 Main Street, City, State 12345'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='workingHours'>Working Hours</Label>
                  <Input
                    id='workingHours'
                    value={formData.workingHours}
                    onChange={e => updateField('workingHours', e.target.value)}
                    placeholder='Monday - Friday: 9:00 AM - 6:00 PM'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='mapEmbedCode'>Google Maps Embed Code</Label>
                  <Input
                    id='mapEmbedCode'
                    value={formData.mapEmbedCode}
                    onChange={e => updateField('mapEmbedCode', e.target.value)}
                    placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
                  />
                  <p className='text-xs text-slate-500'>
                    Get embed code from Google Maps → Share → Embed a map
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value='seo' className='space-y-6'>
            <Card className='p-6 shadow-md'>
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>SEO Settings</h3>
                
                <div className='space-y-2'>
                  <Label htmlFor='metaTitle'>Meta Title</Label>
                  <Input
                    id='metaTitle'
                    value={formData.metaTitle}
                    onChange={e => updateField('metaTitle', e.target.value)}
                    placeholder='Contact Us - Your Company Name'
                  />
                  <p className='text-xs text-slate-500'>
                    Recommended: 50-60 characters
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='metaDescription'>Meta Description</Label>
                  <Input
                    id='metaDescription'
                    value={formData.metaDescription}
                    onChange={e => updateField('metaDescription', e.target.value)}
                    placeholder='Get in touch with us. Contact information, address, and business hours.'
                  />
                  <p className='text-xs text-slate-500'>
                    Recommended: 150-160 characters
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <div className='flex justify-end gap-4 pt-6'>
            <Button type='button' variant='outline' onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
