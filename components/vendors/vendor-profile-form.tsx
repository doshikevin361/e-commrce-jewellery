'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';

interface VendorProfile {
  _id?: string;
  storeName: string;
  storeSlug: string;
  ownerName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  whatsappNumber?: string;
  businessType: 'individual' | 'company' | 'partnership';
  gstNumber?: string;
  panNumber?: string;
  businessRegistrationNumber?: string;
  description: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
  status: string;
  commissionRate: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  documentsVerified: boolean;
}

export function VendorProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<VendorProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/vendor/profile');
      const data = await response.json();

      if (data.success) {
        setProfile(data.vendor);
      } else {
        toast.error(data.error || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      const response = await fetch('/api/admin/vendor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile updated successfully');
        setProfile(data.vendor);
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof VendorProfile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Basic details about your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Store Name *</label>
              <Input
                type="text"
                value={profile.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Store Slug</label>
              <Input
                type="text"
                value={profile.storeSlug}
                disabled
                className="mt-1 bg-gray-50"
              />
              <p className="text-xs text-muted-foreground mt-1">Cannot be changed</p>
            </div>
            <div>
              <label className="text-sm font-medium">Owner Name *</label>
              <Input
                type="text"
                value={profile.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Business Type *</label>
              <Select
                value={profile.businessType}
                onValueChange={(value: 'individual' | 'company' | 'partnership') =>
                  handleChange('businessType', value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Store Description</label>
            <Textarea
              value={profile.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="mt-1"
              placeholder="Tell us about your store..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Your contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={profile.email}
                disabled
                className="mt-1 bg-gray-50"
              />
              <p className="text-xs text-muted-foreground mt-1">Cannot be changed</p>
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number *</label>
              <Input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Alternate Phone</label>
              <Input
                type="tel"
                value={profile.alternatePhone || ''}
                onChange={(e) => handleChange('alternatePhone', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">WhatsApp Number</label>
              <Input
                type="tel"
                value={profile.whatsappNumber || ''}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Registration */}
      <Card>
        <CardHeader>
          <CardTitle>Business Registration</CardTitle>
          <CardDescription>Your business registration details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">GST Number</label>
              <Input
                type="text"
                value={profile.gstNumber || ''}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
                placeholder="e.g., 22AAAAA0000A1Z5"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">PAN Number</label>
              <Input
                type="text"
                value={profile.panNumber || ''}
                onChange={(e) => handleChange('panNumber', e.target.value)}
                placeholder="e.g., ABCDE1234F"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Business Registration Number</label>
              <Input
                type="text"
                value={profile.businessRegistrationNumber || ''}
                onChange={(e) => handleChange('businessRegistrationNumber', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Details */}
      <Card>
        <CardHeader>
          <CardTitle>Address Details</CardTitle>
          <CardDescription>Your business address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Address Line 1 *</label>
            <Input
              type="text"
              value={profile.address1}
              onChange={(e) => handleChange('address1', e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Address Line 2</label>
            <Input
              type="text"
              value={profile.address2 || ''}
              onChange={(e) => handleChange('address2', e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">City *</label>
              <Input
                type="text"
                value={profile.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">State *</label>
              <Input
                type="text"
                value={profile.state}
                onChange={(e) => handleChange('state', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">PIN Code *</label>
              <Input
                type="text"
                value={profile.pinCode}
                onChange={(e) => handleChange('pinCode', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Country *</label>
              <Input
                type="text"
                value={profile.country}
                onChange={(e) => handleChange('country', e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
          <CardDescription>Your banking information for payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Bank Name</label>
              <Input
                type="text"
                value={profile.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Account Holder Name</label>
              <Input
                type="text"
                value={profile.accountHolderName || ''}
                onChange={(e) => handleChange('accountHolderName', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Account Number</label>
              <Input
                type="text"
                value={profile.accountNumber || ''}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">IFSC Code</label>
              <Input
                type="text"
                value={profile.ifscCode || ''}
                onChange={(e) => handleChange('ifscCode', e.target.value)}
                placeholder="e.g., SBIN0001234"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">UPI ID</label>
              <Input
                type="text"
                value={profile.upiId || ''}
                onChange={(e) => handleChange('upiId', e.target.value)}
                placeholder="e.g., yourname@upi"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>Your social media presence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Facebook URL</label>
              <Input
                type="url"
                value={profile.facebook || ''}
                onChange={(e) => handleChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Instagram URL</label>
              <Input
                type="url"
                value={profile.instagram || ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Twitter URL</label>
              <Input
                type="url"
                value={profile.twitter || ''}
                onChange={(e) => handleChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourhandle"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Website URL</label>
              <Input
                type="url"
                value={profile.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Your account verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Account Status</span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  profile.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : profile.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : profile.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Email Verified</span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  profile.emailVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {profile.emailVerified ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Phone Verified</span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  profile.phoneVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {profile.phoneVerified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 px-8"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
