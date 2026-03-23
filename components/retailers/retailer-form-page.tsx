'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Store,
  Briefcase,
  MapPin,
  CreditCard,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import FormField from '@/components/formField/formField';
import Dropdown from '../customDropdown/customDropdown';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';

type RetailerTabId = 'basic' | 'business' | 'address' | 'bank' | 'social' | 'status';

interface RetailerFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  contactNumber: string;
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
  facebook: string;
  instagram: string;
  twitter: string;
  website: string;
  status: 'pending' | 'approved' | 'blocked';
  approvalNotes: string;
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

const RETAILER_FIELD_TAB_MAP: Record<string, RetailerTabId> = {
  fullName: 'basic',
  email: 'basic',
  password: 'basic',
  confirmPassword: 'basic',
  companyName: 'basic',
  contactNumber: 'basic',
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
  facebook: 'social',
  instagram: 'social',
  twitter: 'social',
  website: 'social',
  status: 'status',
  approvalNotes: 'status',
};

export interface RetailerFormPageProps {
  retailerId?: string;
}

export function RetailerFormPage({ retailerId }: RetailerFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<RetailerFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    contactNumber: '',
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
    facebook: '',
    instagram: '',
    twitter: '',
    website: '',
    status: 'pending',
    approvalNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!retailerId);
  const [tabsWithErrors, setTabsWithErrors] = useState<Set<RetailerTabId>>(new Set());
  const [activeTab, setActiveTab] = useState<RetailerTabId>('basic');

  useEffect(() => {
    if (!retailerId) return;

    const fetchRetailer = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        const res = await fetch(`/api/admin/retailers/${retailerId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
        });
        if (!res.ok) {
          toast({
            title: 'Error',
            description: 'Failed to load retailer',
            variant: 'destructive',
          });
          return;
        }
        const data = await res.json();
        const r = data.retailer as Record<string, unknown>;
        if (!r) return;

        setFormData(prev => ({
          ...prev,
          fullName: String(r.fullName ?? ''),
          email: String(r.email ?? ''),
          password: '',
          confirmPassword: '',
          companyName: String(r.companyName ?? ''),
          contactNumber: String(r.contactNumber ?? ''),
          alternatePhone: String(r.alternatePhone ?? ''),
          whatsappNumber: String(r.whatsappNumber ?? ''),
          businessType:
            r.businessType === 'company' || r.businessType === 'partnership' || r.businessType === 'individual'
              ? (r.businessType as RetailerFormData['businessType'])
              : 'individual',
          gstNumber: String(r.gstNumber ?? ''),
          panNumber: String(r.panNumber ?? ''),
          businessRegistrationNumber: String(r.businessRegistrationNumber ?? ''),
          description: typeof r.description === 'string' ? r.description : '',
          address1: String(r.address1 ?? ''),
          address2: String(r.address2 ?? ''),
          city: String(r.city ?? ''),
          state: String(r.state ?? ''),
          pinCode: String(r.pinCode ?? ''),
          country: String(r.country ?? 'India') || 'India',
          bankName: String(r.bankName ?? ''),
          accountHolderName: String(r.accountHolderName ?? ''),
          accountNumber: String(r.accountNumber ?? ''),
          ifscCode: String(r.ifscCode ?? ''),
          upiId: String(r.upiId ?? ''),
          facebook: String(r.facebook ?? ''),
          instagram: String(r.instagram ?? ''),
          twitter: String(r.twitter ?? ''),
          website: String(r.website ?? ''),
          status:
            r.status === 'approved' || r.status === 'blocked' || r.status === 'pending'
              ? (r.status as RetailerFormData['status'])
              : 'pending',
          approvalNotes: String(r.approvalNotes ?? ''),
        }));
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load retailer',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRetailer();
  }, [retailerId, toast]);

  const getTabsWithErrors = (errorFields: Record<string, string>) => {
    const tabs = new Set<RetailerTabId>();
    Object.keys(errorFields).forEach(field => {
      const tab = RETAILER_FIELD_TAB_MAP[field];
      if (tab) tabs.add(tab);
    });
    return tabs;
  };

  const isFieldInActiveTab = (field: string) => {
    const tab = RETAILER_FIELD_TAB_MAP[field];
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

  const updateField = (field: keyof RetailerFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field as string);
  };

  const getFieldError = (field: keyof RetailerFormData) =>
    isFieldInActiveTab(field as string) ? errors[field] : undefined;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof RetailerFormData, value);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Owner / contact name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company / store name is required';

    if (!retailerId) {
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
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Phone is required';
    if (!formData.address1.trim()) newErrors.address1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pinCode.trim()) newErrors.pinCode = 'PIN code is required';

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
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const { confirmPassword: _c, password, ...restWithoutPassword } = formData;
      const businessAddress = [
        formData.address1,
        formData.address2,
        [formData.city, formData.state, formData.pinCode].filter(Boolean).join(', '),
        formData.country,
      ]
        .filter(Boolean)
        .join(', ');

      const payload: Record<string, unknown> = {
        ...restWithoutPassword,
        businessAddress,
      };
      if (!retailerId || (password && password.length > 0)) {
        payload.password = password;
      }

      const response = await fetch(retailerId ? `/api/admin/retailers/${retailerId}` : '/api/admin/retailers', {
        method: retailerId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: retailerId ? 'Retailer updated successfully' : 'Retailer created successfully',
        });
        router.push('/admin/retailers');
      } else {
        const error = await response.json().catch(() => ({}));
        toast({
          title: 'Error',
          description: error.error || 'Failed to save retailer',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An error occurred while saving',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-slate-600">Loading retailer...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'basic' as const, label: 'Store Information', icon: Store },
    { id: 'business' as const, label: 'Business Details', icon: Briefcase },
    { id: 'address' as const, label: 'Address', icon: MapPin },
    { id: 'bank' as const, label: 'Banking', icon: CreditCard },
    { id: 'social' as const, label: 'Social Links', icon: Share2 },
    { id: 'status' as const, label: 'Verification & Status', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/retailers')}
              className="inline-flex items-center justify-center cursor-pointer bg-white p-2 text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {retailerId ? 'Edit Retailer' : 'Add New Retailer'}
              </h1>
              <p className="text-sm text-slate-500">
                Keep all B2B retailer onboarding details organized with tabbed sections.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-2 space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const hasError = tabsWithErrors.has(tab.id);
                  return (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition cursor-pointer',
                        activeTab === tab.id
                          ? 'bg-gray-100 text-primary font-medium'
                          : 'text-gray-700 hover:bg-gray-50',
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className={cn('text-sm md:text-base', hasError && 'text-red-600')}>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="lg:col-span-9 space-y-6">
              <Card className="bg-white border border-slate-200">
                <div className="space-y-6 px-6 py-6">
                  {activeTab === 'basic' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">Store Information</h3>
                        <p className="text-sm text-slate-500">Provide the retailer&apos;s primary store and login details.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Company / Store Name"
                            required
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Enter store name"
                            error={getFieldError('companyName')}
                          />
                          <FormField
                            label="Contact Person Name"
                            required
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter owner or contact name"
                            error={getFieldError('fullName')}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Email"
                            required
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="email@example.com"
                            error={getFieldError('email')}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Password"
                            required={!retailerId}
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder={
                              retailerId ? 'Leave blank to keep current password' : 'Enter password'
                            }
                            error={getFieldError('password')}
                          />
                          <FormField
                            label="Confirm Password"
                            required={!retailerId}
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder={
                              retailerId ? 'Leave blank to keep current password' : 'Confirm password'
                            }
                            error={getFieldError('confirmPassword')}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            label="Phone"
                            required
                            id="contactNumber"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            placeholder="+91 XXXXXXXXXX"
                            error={getFieldError('contactNumber')}
                          />
                          <FormField
                            label="Alternate Phone"
                            id="alternatePhone"
                            name="alternatePhone"
                            value={formData.alternatePhone}
                            onChange={handleInputChange}
                            placeholder="Alternate number"
                          />
                          <FormField
                            label="WhatsApp Number"
                            id="whatsappNumber"
                            name="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={handleInputChange}
                            placeholder="+91 XXXXXXXXXX"
                          />
                        </div>

                        <RichTextEditor
                          label="Store Description"
                          value={formData.description}
                          onChange={val => updateField('description', val)}
                          placeholder="Describe the business..."
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'business' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">Business Details</h3>
                        <p className="text-sm text-slate-500">Legal and tax information for compliance.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Dropdown
                            labelMain="Business Type"
                            options={[
                              { label: 'Individual', value: 'individual' },
                              { label: 'Company', value: 'company' },
                              { label: 'Partnership', value: 'partnership' },
                            ]}
                            value={formData.businessType}
                            onChange={option => updateField('businessType', option.value as RetailerFormData['businessType'])}
                            placeholder="Select type"
                          />
                          <FormField
                            label="GST Number"
                            id="gstNumber"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleInputChange}
                            placeholder="GSTIN"
                          />
                          <FormField
                            label="PAN Number"
                            id="panNumber"
                            name="panNumber"
                            value={formData.panNumber}
                            onChange={handleInputChange}
                            placeholder="PAN"
                          />
                        </div>

                        <FormField
                          label="Business Registration Number"
                          id="businessRegistrationNumber"
                          name="businessRegistrationNumber"
                          value={formData.businessRegistrationNumber}
                          onChange={handleInputChange}
                          placeholder="Registration number"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'address' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">Address Details</h3>
                        <p className="text-sm text-slate-500">Business and pickup address.</p>
                      </div>

                      <div className="space-y-4">
                        <FormField
                          label="Address Line 1"
                          required
                          id="address1"
                          name="address1"
                          value={formData.address1}
                          onChange={handleInputChange}
                          placeholder="Street address"
                          error={getFieldError('address1')}
                        />

                        <FormField
                          label="Address Line 2"
                          id="address2"
                          name="address2"
                          value={formData.address2}
                          onChange={handleInputChange}
                          placeholder="Apartment, suite, etc."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <FormField
                            label="City"
                            required
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="City"
                            error={getFieldError('city')}
                          />

                          <Dropdown
                            labelMain="State *"
                            options={INDIAN_STATES.map(state => ({ label: state, value: state }))}
                            value={formData.state}
                            onChange={option => updateField('state', option.value)}
                            placeholder="Select state"
                            error={getFieldError('state')}
                          />

                          <FormField
                            label="PIN Code"
                            required
                            id="pinCode"
                            name="pinCode"
                            value={formData.pinCode}
                            onChange={handleInputChange}
                            placeholder="PIN code"
                            error={getFieldError('pinCode')}
                          />

                          <FormField
                            label="Country"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'bank' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">Bank Details</h3>
                        <p className="text-sm text-slate-500">Payment settlement information.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Bank Name"
                            id="bankName"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleInputChange}
                            placeholder="Bank name"
                          />
                          <FormField
                            label="Account Holder Name"
                            id="accountHolderName"
                            name="accountHolderName"
                            value={formData.accountHolderName}
                            onChange={handleInputChange}
                            placeholder="Name as per bank"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            label="Account Number"
                            id="accountNumber"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            placeholder="Account number"
                          />
                          <FormField
                            label="IFSC Code"
                            id="ifscCode"
                            name="ifscCode"
                            value={formData.ifscCode}
                            onChange={handleInputChange}
                            placeholder="IFSC code"
                          />
                          <FormField
                            label="UPI ID"
                            id="upiId"
                            name="upiId"
                            value={formData.upiId}
                            onChange={handleInputChange}
                            placeholder="upi@handle"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'social' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">Social Links</h3>
                        <p className="text-sm text-slate-500">Optional online presence.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Facebook URL"
                            id="facebook"
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleInputChange}
                            placeholder="https://facebook.com/..."
                          />
                          <FormField
                            label="Instagram URL"
                            id="instagram"
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleInputChange}
                            placeholder="https://instagram.com/..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Twitter URL"
                            id="twitter"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleInputChange}
                            placeholder="https://twitter.com/..."
                          />
                          <FormField
                            label="Website URL"
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'status' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">Verification & Status</h3>
                        <p className="text-sm text-slate-500">Initial account status for this retailer.</p>
                      </div>

                      <Dropdown
                        labelMain="Retailer Status"
                        options={[
                          { label: 'Pending Approval', value: 'pending' },
                          { label: 'Approved', value: 'approved' },
                          { label: 'Blocked', value: 'blocked' },
                        ]}
                        value={formData.status}
                        onChange={option => updateField('status', option.value as RetailerFormData['status'])}
                        placeholder="Select status"
                      />

                      <FormField
                        label="Approval Notes"
                        textarea
                        id="approvalNotes"
                        name="approvalNotes"
                        value={formData.approvalNotes}
                        onChange={handleInputChange}
                        placeholder="Internal notes..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200"
                  onClick={() => router.push('/admin/retailers')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : retailerId ? 'Update Retailer' : 'Create Retailer'}
                </Button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
