'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  Store,
  Briefcase,
  MapPin,
  CreditCard,
  ImageIcon,
  FileText,
  Share2,
  ShieldCheck,
  ListChecks,
} from 'lucide-react';
import FormField from '@/components/formField/formField';
import Dropdown from '../customDropdown/customDropdown';
import { MainImageUpload } from '@/components/media/main-image-upload';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';

type VendorTabId =
  | 'basic'
  | 'business'
  | 'address'
  | 'bank'
  | 'media'
  | 'documents'
  | 'social'
  | 'status'
  | 'commission';

interface VendorFormData {
  storeName: string;
  storeSlug: string;
  ownerName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  alternatePhone: string;
  whatsappNumber: string;
  businessType: 'individual' | 'company' | 'partnership';
  gstNumber: string;
  panNumber: string;
  businessRegistrationNumber: string;
  description: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  logo: string;
  banner: string;
  commissionRate: number;
  productTypeCommissions?: Record<string, number>;
  allowedProductTypes?: string[];
  allowedCategories?: string[];
  facebook: string;
  instagram: string;
  twitter: string;
  website: string;
  idProof: string;
  addressProof: string;
  gstCertificate: string;
  cancelledCheque: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approvalNotes: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  documentsVerified: boolean;
}

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Puducherry',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Tripura',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const VENDOR_FIELD_TAB_MAP: Record<string, VendorTabId> = {
  storeName: 'basic',
  storeSlug: 'basic',
  ownerName: 'basic',
  email: 'basic',
  password: 'basic',
  confirmPassword: 'basic',
  phone: 'basic',
  description: 'basic',
  businessType: 'business',
  gstNumber: 'business',
  panNumber: 'business',
  businessRegistrationNumber: 'business',
  address1: 'address',
  city: 'address',
  state: 'address',
  pinCode: 'address',
  bankName: 'bank',
  accountHolderName: 'bank',
  accountNumber: 'bank',
  ifscCode: 'bank',
  upiId: 'bank',
  commissionRate: 'media',
  logo: 'media',
  banner: 'media',
  idProof: 'documents',
  addressProof: 'documents',
  gstCertificate: 'documents',
  cancelledCheque: 'documents',
  facebook: 'social',
  instagram: 'social',
  twitter: 'social',
  website: 'social',
  status: 'status',
  approvalNotes: 'status',
};

export function VendorFormPage({ vendorId }: VendorFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<VendorFormData>({
    storeName: '',
    storeSlug: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    alternatePhone: '',
    whatsappNumber: '',
    businessType: 'individual',
    gstNumber: '',
    panNumber: '',
    businessRegistrationNumber: '',
    description: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    logo: '',
    banner: '',
    commissionRate: 0,
    productTypeCommissions: undefined,
    allowedProductTypes: [],
    allowedCategories: [],
    facebook: '',
    instagram: '',
    twitter: '',
    website: '',
    idProof: '',
    addressProof: '',
    gstCertificate: '',
    cancelledCheque: '',
    status: 'pending',
    approvalNotes: '',
    emailVerified: false,
    phoneVerified: false,
    documentsVerified: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!vendorId);
  const [tabsWithErrors, setTabsWithErrors] = useState<Set<VendorTabId>>(new Set());
  const [categoryOptions, setCategoryOptions] = useState<{ _id: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState<
    | 'basic'
    | 'business'
    | 'address'
    | 'bank'
    | 'media'
    | 'documents'
    | 'social'
    | 'status'
    | 'commission'
  >('basic');

  useEffect(() => {
    if (vendorId) {
      const fetchVendor = async () => {
        try {
          const response = await fetch(`/api/admin/vendors/${vendorId}`);
          if (response.ok) {
            const data = await response.json();
            setFormData(prev => ({ ...prev, ...data.vendor }));
          } else {
            toast({
              title: 'Error',
              description: 'Failed to fetch vendor',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('[v0] Failed to fetch vendor:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchVendor();
    }
  }, [vendorId, toast]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          const options = Array.isArray(data.categories) ? data.categories : [];
          setCategoryOptions(options);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const getTabsWithErrors = (errorFields: Record<string, string>) => {
    const tabs = new Set<VendorTabId>();
    Object.keys(errorFields).forEach(field => {
      const tab = VENDOR_FIELD_TAB_MAP[field];
      if (tab) {
        tabs.add(tab);
      }
    });
    return tabs;
  };

  const isFieldInActiveTab = (field: string) => {
    const tab = VENDOR_FIELD_TAB_MAP[field];
    if (!tab) return true;
    return tab === activeTab;
  };

  const clearFieldError = (field: string) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      setTabsWithErrors(getTabsWithErrors(next));
      return next;
    });
  };

  const updateField = (field: keyof VendorFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    clearFieldError(field as string);
  };

  const getFieldError = (field: keyof VendorFormData) =>
    isFieldInActiveTab(field as string) ? errors[field] : undefined;

  const uploadVendorAsset = async (file: File) => {
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
        description: 'File uploaded successfully',
      });
      return data.url as string;
    } catch (error) {
      console.error('[v0] Upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof VendorFormData, value);

    if (name === 'storeName' && !vendorId) {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');
      updateField('storeSlug', slug);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.storeName) newErrors.storeName = 'Store name is required';
    if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    
    // Password validation - required for new vendors, optional for updates
    if (!vendorId) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password || formData.confirmPassword) {
      // If updating and password fields are filled, validate them
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.address1) newErrors.address1 = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pinCode) newErrors.pinCode = 'PIN code is required';

    setErrors(newErrors);
    setTabsWithErrors(getTabsWithErrors(newErrors));
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

    setSaving(true);
    try {
      const method = vendorId ? 'PUT' : 'POST';
      const url = vendorId ? `/api/admin/vendors/${vendorId}` : '/api/admin/vendors';

      const { _id, createdAt, updatedAt, confirmPassword, ...dataToSend } = formData as any;
      
      // Remove password field if empty (for updates)
      if (vendorId && !dataToSend.password) {
        delete dataToSend.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: vendorId ? 'Vendor updated successfully' : 'Vendor created successfully',
          variant : 'success'
        });
        router.push('/admin/vendors');
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to save vendor',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Save error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Store Information', icon: Store },
    { id: 'business', label: 'Business Details', icon: Briefcase },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'bank', label: 'Banking', icon: CreditCard },
    { id: 'media', label: 'Media & Commission', icon: ImageIcon },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'social', label: 'Social Links', icon: Share2 },
    { id: 'status', label: 'Verification & Status', icon: ShieldCheck },
    { id: 'commission', label: 'Commission Setup', icon: ListChecks },
  ] as const;

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-lg text-slate-600'>Loading vendor...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <div className='bg-white rounded-lg shadow-sm p-4 md:p-6'>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              onClick={() => router.push('/admin/vendors')}
              className='inline-flex items-center justify-center cursor-pointer bg-white p-2 text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200'
            >
              <ArrowLeft className='h-5 w-5' />
            </button>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-slate-900'>
                {vendorId ? 'Edit Vendor' : 'Add New Vendor'}
              </h1>
              <p className='text-sm text-slate-500'>
                Keep all vendor onboarding details organized with tabbed sections.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
            <aside className='lg:col-span-3'>
              <div className='bg-white rounded-lg shadow-sm p-2 space-y-1'>
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const hasError = tabsWithErrors.has(tab.id);
                  return (
                    <button
                      type='button'
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition cursor-pointer',
                        activeTab === tab.id
                          ? 'bg-gray-100 text-primary font-medium'
                          : 'text-gray-700 hover:bg-gray-50',
                      )}
                    >
                      <Icon className='w-5 h-5' />
                      <span
                        className={cn('text-sm md:text-base', hasError && 'text-red-600')}
                      >
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className='lg:col-span-9 space-y-6'>
              <Card className='bg-white border border-slate-200'>
                <div className='space-y-6 px-6 py-6'>
                  {activeTab === 'basic' && (
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-xl font-semibold text-slate-900'>Store Information</h3>
                        <p className='text-sm text-slate-500'>Provide the vendor’s primary store details.</p>
                      </div>

                      <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <FormField
                            label='Store Name'
                            required
                            id='storeName'
                            name='storeName'
                            value={formData.storeName}
                            onChange={handleInputChange}
                            placeholder='Enter store name'
                            error={getFieldError('storeName')}
                          />
                          <FormField
                            label='Store Slug'
                            required
                            id='storeSlug'
                            name='storeSlug'
                            value={formData.storeSlug}
                            onChange={handleInputChange}
                            placeholder='auto-generated-slug'
                          />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <FormField
                            label='Owner Name'
                            required
                            id='ownerName'
                            name='ownerName'
                            value={formData.ownerName}
                            onChange={handleInputChange}
                            placeholder='Enter owner name'
                            error={getFieldError('ownerName')}
                          />
                          <FormField
                            label='Email'
                            required
                            id='email'
                            name='email'
                            type='email'
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder='email@example.com'
                            error={getFieldError('email')}
                          />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <FormField
                            label='Password'
                            required={!vendorId}
                            id='password'
                            name='password'
                            type='password'
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder={vendorId ? 'Leave blank to keep current password' : 'Enter password'}
                            error={getFieldError('password')}
                          />
                          <FormField
                            label='Confirm Password'
                            required={!vendorId}
                            id='confirmPassword'
                            name='confirmPassword'
                            type='password'
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder={vendorId ? 'Leave blank to keep current password' : 'Confirm password'}
                            error={getFieldError('confirmPassword')}
                          />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                          <FormField
                            label='Phone'
                            required
                            id='phone'
                            name='phone'
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder='+91 XXXXXXXXXX'
                            error={getFieldError('phone')}
                          />
                          <FormField
                            label='Alternate Phone'
                            id='alternatePhone'
                            name='alternatePhone'
                            value={formData.alternatePhone}
                            onChange={handleInputChange}
                            placeholder='Alternate number'
                          />
                          <FormField
                            label='WhatsApp Number'
                            id='whatsappNumber'
                            name='whatsappNumber'
                            value={formData.whatsappNumber}
                            onChange={handleInputChange}
                            placeholder='+91 XXXXXXXXXX'
                          />
                        </div>

                        <RichTextEditor
                          label='Store Description'
                          value={formData.description}
                          onChange={val => updateField('description', val)}
                          placeholder='Describe your business...'
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'business' && (
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-xl font-semibold text-slate-900'>Business Details</h3>
                        <p className='text-sm text-slate-500'>Capture legal business information for compliance.</p>
                      </div>

                      <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <Dropdown
                              labelMain='Business Type'
                              options={[
                                { label: 'Individual', value: 'individual' },
                                { label: 'Company', value: 'company' },
                                { label: 'Partnership', value: 'partnership' },
                              ]}
                              value={formData.businessType}
                              onChange={option => updateField('businessType', option.value as any)}
                              placeholder='Select type'
                            />
                          <FormField
                            label='GST Number'
                            id='gstNumber'
                            name='gstNumber'
                            value={formData.gstNumber}
                            onChange={handleInputChange}
                            placeholder='GSTIN'
                          />
                          <FormField
                            label='PAN Number'
                            id='panNumber'
                            name='panNumber'
                            value={formData.panNumber}
                            onChange={handleInputChange}
                            placeholder='PAN'
                          />
                        </div>

                        <FormField
                          label='Business Registration Number'
                          id='businessRegistrationNumber'
                          name='businessRegistrationNumber'
                          value={formData.businessRegistrationNumber}
                          onChange={handleInputChange}
                          placeholder='Registration number'
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'address' && (
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-xl font-semibold text-slate-900'>Address Details</h3>
                        <p className='text-sm text-slate-500'>Storefront and pickup address information.</p>
                      </div>

                      <div className='space-y-4'>
          <FormField
            label='Address Line 1'
            required
            id='address1'
            name='address1'
            value={formData.address1}
            onChange={handleInputChange}
            placeholder='Street address'
            error={getFieldError('address1')}
          />

                        <FormField
                          label='Address Line 2'
                          id='address2'
                          name='address2'
                          value={formData.address2}
                          onChange={handleInputChange}
                          placeholder='Apartment, suite, etc.'
                        />

                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <FormField
              label='City'
              required
              id='city'
              name='city'
              value={formData.city}
              onChange={handleInputChange}
              placeholder='City'
              error={getFieldError('city')}
            />

                            <Dropdown
                              labelMain='State *'
                              options={INDIAN_STATES.map(state => ({ label: state, value: state }))}
                              value={formData.state}
                              onChange={option => updateField('state', option.value)}
                              placeholder='Select state'
                              error={getFieldError('state')}
                            />

            <FormField
              label='PIN Code'
              required
              id='pinCode'
              name='pinCode'
              value={formData.pinCode}
              onChange={handleInputChange}
              placeholder='PIN code'
              error={getFieldError('pinCode')}
            />

                          <FormField
                            label='Country'
                            id='country'
                            name='country'
                            value={formData.country}
                            onChange={handleInputChange}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'bank' && (
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-xl font-semibold text-slate-900'>Bank Details</h3>
                        <p className='text-sm text-slate-500'>Payment settlement information.</p>
                      </div>

                      <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <FormField
                            label='Bank Name'
                            id='bankName'
                            name='bankName'
                            value={formData.bankName}
                            onChange={handleInputChange}
                            placeholder='Bank name'
                          />
                          <FormField
                            label='Account Holder Name'
                            id='accountHolderName'
                            name='accountHolderName'
                            value={formData.accountHolderName}
                            onChange={handleInputChange}
                            placeholder='Name as per bank'
                          />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                          <FormField
                            label='Account Number'
                            id='accountNumber'
                            name='accountNumber'
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            placeholder='Account number'
                          />
                          <FormField
                            label='IFSC Code'
                            id='ifscCode'
                            name='ifscCode'
                            value={formData.ifscCode}
                            onChange={handleInputChange}
                            placeholder='IFSC code'
                          />
                          <FormField
                            label='UPI ID'
                            id='upiId'
                            name='upiId'
                            value={formData.upiId}
                            onChange={handleInputChange}
                            placeholder='upi@handle'
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'media' && (
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-xl font-semibold text-slate-900'>Store Media</h3>
                        <p className='text-sm text-slate-500'>Upload branding assets and set commission rates.</p>
                      </div>

                      <div className='space-y-4'>
                        <MainImageUpload
                          label='Store Logo'
                          value={formData.logo}
                          onChange={val => updateField('logo', val)}
                          uploadHandler={uploadVendorAsset}
                          helperText='Displayed on vendor cards and listings'
                        />

                        <MainImageUpload
                          label='Store Banner'
                          value={formData.banner}
                          onChange={val => updateField('banner', val)}
                          uploadHandler={uploadVendorAsset}
                          recommendedText='Recommended: 1600×400px, JPG/PNG'
                          helperText='Shown on vendor detail header'
                        />

                        {/* <FormField
                          label='Commission Rate (%)'
                          id='commissionRate'
                          name='commissionRate'
                          type='number'
                          value={formData.commissionRate}
                          onChange={handleInputChange}
                          placeholder='0'
                          step='0.1'
                        /> */}
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-xl font-semibold text-slate-900'>Documents</h3>
                        <p className='text-sm text-slate-500'>Upload KYC and compliance documents.</p>
                      </div>

                      <div className='space-y-4'>
                        <MainImageUpload
                          label='ID Proof'
                          value={formData.idProof}
                          onChange={val => updateField('idProof', val)}
                          uploadHandler={uploadVendorAsset}
                          helperText='Upload clear copy of the vendor ID'
                        />

                        <MainImageUpload
                          label='Address Proof'
                          value={formData.addressProof}
                          onChange={val => updateField('addressProof', val)}
                          uploadHandler={uploadVendorAsset}
                          helperText='Latest utility bill or government document'
                        />

                        <MainImageUpload
                          label='GST Certificate'
                          value={formData.gstCertificate}
                          onChange={val => updateField('gstCertificate', val)}
                          uploadHandler={uploadVendorAsset}
                        />

                        <MainImageUpload
                          label='Cancelled Cheque'
                          value={formData.cancelledCheque}
                          onChange={val => updateField('cancelledCheque', val)}
                          uploadHandler={uploadVendorAsset}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'social' && (
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-xl font-semibold text-slate-900'>Social Links</h3>
                        <p className='text-sm text-slate-500'>Let customers find the vendor online.</p>
                      </div>

                      <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <FormField
                            label='Facebook URL'
                            id='facebook'
                            name='facebook'
                            value={formData.facebook}
                            onChange={handleInputChange}
                            placeholder='https://facebook.com/...'
                          />
                          <FormField
                            label='Instagram URL'
                            id='instagram'
                            name='instagram'
                            value={formData.instagram}
                            onChange={handleInputChange}
                            placeholder='https://instagram.com/...'
                          />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <FormField
                            label='Twitter URL'
                            id='twitter'
                            name='twitter'
                            value={formData.twitter}
                            onChange={handleInputChange}
                            placeholder='https://twitter.com/...'
                          />
                          <FormField
                            label='Website URL'
                            id='website'
                            name='website'
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder='https://example.com'
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'status' && (
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-xl font-semibold text-slate-900'>Verification & Status</h3>
                        <p className='text-sm text-slate-500'>Manage approvals and verification states.</p>
                      </div>

                      <Dropdown
                        labelMain='Vendor Status'
                        options={[
                          { label: 'Pending Approval', value: 'pending' },
                          { label: 'Approved', value: 'approved' },
                          { label: 'Rejected', value: 'rejected' },
                          { label: 'Suspended', value: 'suspended' },
                        ]}
                        value={formData.status}
                        onChange={option => updateField('status', option.value as any)}
                        placeholder='Select status'
                      />

                      <FormField
                        label='Approval Notes'
                        textarea
                        id='approvalNotes'
                        name='approvalNotes'
                        value={formData.approvalNotes}
                        onChange={handleInputChange}
                        placeholder='Add notes about approval/rejection...'
                        rows={3}
                      />

                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <Label htmlFor='emailVerified'>Email Verified</Label>
                          <Switch
                            id='emailVerified'
                            checked={formData.emailVerified}
                            onCheckedChange={val => updateField('emailVerified', val)}
                          />
                        </div>

                        <div className='flex items-center justify-between'>
                          <Label htmlFor='phoneVerified'>Phone Verified</Label>
                          <Switch
                            id='phoneVerified'
                            checked={formData.phoneVerified}
                            onCheckedChange={val => updateField('phoneVerified', val)}
                          />
                        </div>

                        <div className='flex items-center justify-between'>
                          <Label htmlFor='documentsVerified'>Documents Verified</Label>
                          <Switch
                            id='documentsVerified'
                            checked={formData.documentsVerified}
                            onCheckedChange={val => updateField('documentsVerified', val)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'commission' && (
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-xl font-semibold text-slate-900'>Commission Setup</h3>
                        <p className='text-sm text-slate-500'>
                          Read-only view of the vendor’s selected product scope and commission rates.
                        </p>
                      </div>

                      <div className='space-y-4'>
                        <div>
                          <Label>Selected Product Types</Label>
                          <div className='mt-2 text-sm text-slate-700'>
                            {Array.isArray(formData.allowedProductTypes) && formData.allowedProductTypes.length
                              ? formData.allowedProductTypes.join(', ')
                              : 'No product types selected'}
                          </div>
                        </div>

                        <div>
                          <Label>Selected Categories</Label>
                          <div className='mt-2 text-sm text-slate-700'>
                            {Array.isArray(formData.allowedCategories) && formData.allowedCategories.length
                              ? formData.allowedCategories
                                  .map(
                                    id =>
                                      categoryOptions.find(category => category._id === id)?.name || id
                                  )
                                  .join(', ')
                              : 'No categories selected'}
                          </div>
                        </div>

                        <div>
                          <Label>Product Type Commissions (%)</Label>
                          <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700'>
                            {formData.productTypeCommissions &&
                            Object.keys(formData.productTypeCommissions).length ? (
                              Object.entries(formData.productTypeCommissions).map(([type, rate]) => (
                                <div
                                  key={type}
                                  className='flex items-center justify-between rounded-md border border-slate-200 px-3 py-2'
                                >
                                  <span>{type}</span>
                                  <span className='font-medium'>{rate}%</span>
                                </div>
                              ))
                            ) : (
                              <div>No commission settings saved</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div className='flex flex-col sm:flex-row gap-3 justify-end pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  className='border-slate-200'
                  onClick={() => router.push('/admin/vendors')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={saving}>
                  {saving ? 'Saving...' : vendorId ? 'Update Vendor' : 'Create Vendor'}
                </Button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}