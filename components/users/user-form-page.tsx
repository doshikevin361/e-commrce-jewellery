'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import FormField from '@/components/formField/formField';
import { ArrowLeft } from 'lucide-react';
import { STAFF_MODULE_DEFINITIONS } from '@/lib/admin-modules';

interface AdminFormData {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  status?: 'active' | 'inactive';
  password?: string;
  confirmPassword?: string;
  role?: string;
  permissions?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserFormPageProps {
  adminId?: string;
}

export function UserFormPage({ adminId }: UserFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    password: '',
    confirmPassword: '',
    role: 'admin',
    permissions: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!adminId);
  const [initialData, setInitialData] = useState<AdminFormData | null>(null);
  const [viewerIsSuperadmin, setViewerIsSuperadmin] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('adminUser');
      if (raw) {
        const u = JSON.parse(raw);
        if (u.role === 'staff') {
          router.replace('/admin/users');
          return;
        }
        setViewerIsSuperadmin(u.role === 'superadmin');
      }
    } catch {
      /* ignore */
    }
  }, [router]);

  useEffect(() => {
    // Hide scroll
    document.body.style.overflowY = 'hidden';

    // Cleanup when leaving page
    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, []);

  useEffect(() => {
    if (!adminId) {
      setLoading(false);
      return;
    }

    const fetchAdmin = async () => {
      try {
        const response = await fetch(`/api/admin/users/${adminId}`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const u = data.user;
          setFormData({
            ...u,
            permissions: Array.isArray(u.permissions) ? u.permissions : [],
            password: '',
            confirmPassword: '',
          });
          setInitialData(u);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch user',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Fetch user error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [adminId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'User Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (formData.role === 'staff' && !(formData.permissions && formData.permissions.length > 0)) {
      newErrors.permissions = 'Select at least one module for staff';
    }

    if (!adminId) {
      if (!formData.password) newErrors.password = 'Password is required for new users';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const method = adminId ? 'PUT' : 'POST';
      const url = adminId ? `/api/admin/users/${adminId}` : '/api/admin/users';

      const { _id, createdAt, updatedAt, confirmPassword, ...rest } = formData as any;
      const dataToSend: Record<string, unknown> = { ...rest };
      if (formData.role === 'staff') {
        dataToSend.permissions = formData.permissions || [];
      } else {
        delete dataToSend.permissions;
      }
      if (adminId && !formData.password?.trim()) {
        delete dataToSend.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: adminId ? 'User updated successfully' : 'User created successfully',
          variant: 'success'
        });
        router.push('/admin/users');
      } else {
        let message = 'Failed to save user';
        try {
          const error = await response.json();
          if (error && typeof error.error === 'string') message = error.error;

          const fieldErrors: Record<string, string> = {};
          if (message.toLowerCase().includes('email')) fieldErrors.email = message;
          setErrors(prev => ({ ...prev, ...fieldErrors }));
        } catch {
          // ignore JSON parse errors
        }

        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Save user error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the user',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-muted-foreground'>Loading user...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8'>
      <div className='max-w-5xl mx-auto space-y-6'>
        <div className='bg-white rounded-lg shadow-sm p-4 md:p-6'>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              onClick={() => router.push('/admin/users')}
              className='inline-flex items-center justify-center cursor-pointer bg-white p-2 text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200'>
              <ArrowLeft className='h-5 w-5' />
            </button>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-slate-900'>{adminId ? 'Edit User' : 'Add New User'}</h1>
              <p className='text-sm text-slate-500'>Manage user account information from a single workspace.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <section className='space-y-6'>
            <Card className='bg-white border border-slate-200'>
              <div className='space-y-6 px-6 py-6'>
                <div className='space-y-4'>
                  <h3 className='text-xl font-semibold text-slate-900'>Basic Information</h3>
                  <p className='text-sm text-slate-500'>Provide the user’s profile details.</p>

                  <FormField
                    label='User Name'
                    required
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder='John Doe'
                    disabled={saving}
                    error={errors.name}
                  />

                  <FormField
                    label='Email'
                    required
                    id='email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder='john@example.com'
                    disabled={saving || !!adminId}
                    error={errors.email}
                    helperText={adminId ? 'Email cannot be changed' : undefined}
                  />

                  <FormField
                    label='Phone Number'
                    required
                    id='phone'
                    name='phone'
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    placeholder='+1 (555) 123-4567'
                    disabled={saving}
                    error={errors.phone}
                  />
                </div>

                {!adminId && (
                  <div className='space-y-4'>
                    <h3 className='text-xl font-semibold text-slate-900'>Security</h3>
                    <p className='text-sm text-slate-500'>Set a password for this user.</p>

                    <FormField
                      label='Password'
                      required
                      id='password'
                      name='password'
                      type='password'
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      placeholder='••••••••'
                      disabled={saving}
                      error={errors.password}
                    />

                    <FormField
                      label='Confirm Password'
                      required
                      id='confirmPassword'
                      name='confirmPassword'
                      type='password'
                      value={formData.confirmPassword || ''}
                      onChange={handleInputChange}
                      placeholder='••••••••'
                      disabled={saving}
                      error={errors.confirmPassword}
                    />
                  </div>
                )}

                <div className='space-y-4'>
                  <h3 className='text-xl font-semibold text-slate-900'>Status & Role</h3>
                  <p className='text-sm text-slate-500'>Control account availability and permissions.</p>

                  <div className='flex items-center justify-between p-4 border rounded-lg'>
                    <div>
                      <p className='text-sm font-medium'>User Status</p>
                      <p className='text-xs text-muted-foreground'>Inactive users won't be able to login</p>
                    </div>
                    <Switch
                      id='status'
                      checked={(formData.status || 'active') === 'active'}
                      onCheckedChange={checked => setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Role</Label>
                    <Select
                      value={formData.role || 'admin'}
                      onValueChange={value =>
                        setFormData(prev => ({
                          ...prev,
                          role: value,
                          permissions: value === 'staff' ? prev.permissions || [] : [],
                        }))
                      }
                      disabled={saving || (!!adminId && initialData?.role === 'superadmin' && !viewerIsSuperadmin)}>
                      <SelectTrigger className='w-full max-w-md bg-white'>
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='admin'>Admin</SelectItem>
                        <SelectItem value='staff'>Staff (module permissions)</SelectItem>
                        {viewerIsSuperadmin ? <SelectItem value='superadmin'>Super Admin</SelectItem> : null}
                      </SelectContent>
                    </Select>
                    {errors.role ? <p className='text-sm text-red-600'>{errors.role}</p> : null}
                  </div>

                  {formData.role === 'staff' ? (
                    <div className='space-y-3 p-4 border rounded-lg bg-slate-50'>
                      <div>
                        <p className='text-sm font-medium text-slate-900'>Module access</p>
                        <p className='text-xs text-muted-foreground'>Staff login par sirf yahi menu dikhenge.</p>
                      </div>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto'>
                        {STAFF_MODULE_DEFINITIONS.map(mod => (
                          <label key={mod.key} className='flex items-start gap-2 text-sm cursor-pointer'>
                            <Checkbox
                              checked={(formData.permissions || []).includes(mod.key)}
                              onCheckedChange={checked => {
                                setFormData(prev => {
                                  const cur = new Set(prev.permissions || []);
                                  if (checked) cur.add(mod.key);
                                  else cur.delete(mod.key);
                                  return { ...prev, permissions: [...cur] };
                                });
                                if (errors.permissions) setErrors(prev => ({ ...prev, permissions: '' }));
                              }}
                              disabled={saving}
                            />
                            <span>{mod.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.permissions ? <p className='text-sm text-red-600'>{errors.permissions}</p> : null}
                    </div>
                  ) : null}

                  {adminId ? (
                    <div className='space-y-4'>
                      <h3 className='text-xl font-semibold text-slate-900'>Change password</h3>
                      <p className='text-sm text-slate-500'>Optional — leave blank to keep current password.</p>
                      <FormField
                        label='New password'
                        id='password'
                        name='password'
                        type='password'
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        placeholder='••••••••'
                        disabled={saving}
                        error={errors.password}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>

            <div className='flex flex-col sm:flex-row gap-3 justify-end pt-4'>
              <Button
                type='button'
                variant='outline'
                className='border-slate-200'
                onClick={() => router.push('/admin/users')}
                disabled={saving}>
                Cancel
              </Button>
              <Button type='submit' disabled={saving}>
                {saving ? 'Saving...' : adminId ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
