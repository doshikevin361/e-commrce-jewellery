'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export type RetailerProfileState = {
  _id?: string;
  fullName: string;
  companyName: string;
  email: string;
  contactNumber: string;
  businessAddress: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  alternatePhone: string;
  whatsappNumber: string;
  businessType: 'individual' | 'company' | 'partnership';
  gstNumber: string;
  panNumber: string;
  businessRegistrationNumber: string;
  description: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  facebook: string;
  instagram: string;
  twitter: string;
  website: string;
  status: string;
};

function normalizeFromApi(r: Record<string, unknown>): RetailerProfileState {
  const businessAddress = String(r.businessAddress ?? '');
  const address1 = String(r.address1 ?? '');
  return {
    _id: r._id ? String(r._id) : undefined,
    fullName: String(r.fullName ?? ''),
    companyName: String(r.companyName ?? ''),
    email: String(r.email ?? ''),
    contactNumber: String(r.contactNumber ?? ''),
    businessAddress,
    address1: address1 || businessAddress,
    address2: String(r.address2 ?? ''),
    city: String(r.city ?? ''),
    state: String(r.state ?? ''),
    pinCode: String(r.pinCode ?? ''),
    country: String(r.country ?? '') || 'India',
    alternatePhone: String(r.alternatePhone ?? ''),
    whatsappNumber: String(r.whatsappNumber ?? ''),
    businessType: (r.businessType as RetailerProfileState['businessType']) || 'individual',
    gstNumber: String(r.gstNumber ?? ''),
    panNumber: String(r.panNumber ?? ''),
    businessRegistrationNumber: String(r.businessRegistrationNumber ?? ''),
    description: String(r.description ?? ''),
    bankName: String(r.bankName ?? ''),
    accountHolderName: String(r.accountHolderName ?? ''),
    accountNumber: String(r.accountNumber ?? ''),
    ifscCode: String(r.ifscCode ?? ''),
    upiId: String(r.upiId ?? ''),
    facebook: String(r.facebook ?? ''),
    instagram: String(r.instagram ?? ''),
    twitter: String(r.twitter ?? ''),
    website: String(r.website ?? ''),
    status: String(r.status ?? 'pending'),
  };
}

interface RetailerProfileFormProps {
  primaryColor: string;
}

export function RetailerProfileForm({ primaryColor }: RetailerProfileFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<RetailerProfileState | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/retailer/profile', { credentials: 'include', headers: getAuthHeaders() });
      if (res.status === 401) {
        window.location.href = '/retailer/login';
        return;
      }
      const data = await res.json();
      const raw = data.retailer ?? data;
      if (!raw || data.error) {
        toast.error(data.error || 'Failed to load profile');
        return;
      }
      setProfile(normalizeFromApi(raw as Record<string, unknown>));
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setSaving(true);
      const res = await fetch('/api/retailer/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fullName: profile.fullName,
          companyName: profile.companyName,
          contactNumber: profile.contactNumber,
          businessAddress: profile.businessAddress,
          address1: profile.address1,
          address2: profile.address2,
          city: profile.city,
          state: profile.state,
          pinCode: profile.pinCode,
          country: profile.country,
          alternatePhone: profile.alternatePhone,
          whatsappNumber: profile.whatsappNumber,
          businessType: profile.businessType,
          gstNumber: profile.gstNumber,
          panNumber: profile.panNumber,
          businessRegistrationNumber: profile.businessRegistrationNumber,
          description: profile.description,
          bankName: profile.bankName,
          accountHolderName: profile.accountHolderName,
          accountNumber: profile.accountNumber,
          ifscCode: profile.ifscCode,
          upiId: profile.upiId,
          facebook: profile.facebook,
          instagram: profile.instagram,
          twitter: profile.twitter,
          website: profile.website,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update profile');
        return;
      }
      if (data.retailer) {
        setProfile(normalizeFromApi(data.retailer as Record<string, unknown>));
      }
      try {
        const u = localStorage.getItem('retailerUser');
        if (u && data.retailer) {
          const parsed = JSON.parse(u);
          parsed.fullName = data.retailer.fullName ?? parsed.fullName;
          parsed.companyName = data.retailer.companyName ?? parsed.companyName;
          localStorage.setItem('retailerUser', JSON.stringify(parsed));
        }
      } catch (_) {}
      toast.success(data.message || 'Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof RetailerProfileState, value: string | RetailerProfileState['businessType']) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" style={{ color: primaryColor }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load profile
      </div>
    );
  }

  const btnStyle = { backgroundColor: primaryColor };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business & store</CardTitle>
          <CardDescription>Same structure as vendor profile — your shop details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Company / shop name *</label>
              <Input
                value={profile.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contact person (full name) *</label>
              <Input
                value={profile.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Business type</label>
              <Select
                value={profile.businessType}
                onValueChange={(v: RetailerProfileState['businessType']) => handleChange('businessType', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select" />
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
            <label className="text-sm font-medium">About your business</label>
            <Textarea
              value={profile.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="mt-1"
              placeholder="Short description (optional)"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>Phone, WhatsApp, alternate number</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={profile.email} disabled className="mt-1 bg-muted/50" />
              <p className="text-xs text-muted-foreground mt-1">Login email — cannot be changed here</p>
            </div>
            <div>
              <label className="text-sm font-medium">Primary phone *</label>
              <Input
                value={profile.contactNumber}
                onChange={(e) => handleChange('contactNumber', e.target.value.replace(/\D/g, '').slice(0, 15))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Alternate phone</label>
              <Input
                value={profile.alternatePhone}
                onChange={(e) => handleChange('alternatePhone', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">WhatsApp</label>
              <Input
                value={profile.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GST & registration</CardTitle>
          <CardDescription>GSTIN, PAN, other registration numbers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">GST number</label>
              <Input
                value={profile.gstNumber}
                onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">PAN number</label>
              <Input
                value={profile.panNumber}
                onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Business registration number</label>
              <Input
                value={profile.businessRegistrationNumber}
                onChange={(e) => handleChange('businessRegistrationNumber', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
          <CardDescription>Pickup / billing address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Address line 1</label>
            <Input value={profile.address1} onChange={(e) => handleChange('address1', e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Address line 2</label>
            <Input value={profile.address2} onChange={(e) => handleChange('address2', e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">City</label>
              <Input value={profile.city} onChange={(e) => handleChange('city', e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">State</label>
              <Input value={profile.state} onChange={(e) => handleChange('state', e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">PIN code</label>
              <Input
                value={profile.pinCode}
                onChange={(e) => handleChange('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <Input value={profile.country} onChange={(e) => handleChange('country', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Full address (legacy / notes)</label>
            <Textarea
              value={profile.businessAddress}
              onChange={(e) => handleChange('businessAddress', e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="Optional — kept for older records; prefer structured fields above"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank details</CardTitle>
          <CardDescription>Account for settlements & payouts (same as vendor profile)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Bank name</label>
              <Input value={profile.bankName} onChange={(e) => handleChange('bankName', e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Account holder name</label>
              <Input
                value={profile.accountHolderName}
                onChange={(e) => handleChange('accountHolderName', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Account number</label>
              <Input
                value={profile.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value.replace(/\s/g, ''))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">IFSC code</label>
              <Input
                value={profile.ifscCode}
                onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">UPI ID</label>
              <Input value={profile.upiId} onChange={(e) => handleChange('upiId', e.target.value)} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social & website</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Facebook</label>
              <Input
                type="url"
                value={profile.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Instagram</label>
              <Input
                type="url"
                value={profile.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Twitter / X</label>
              <Input type="url" value={profile.twitter} onChange={(e) => handleChange('twitter', e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Website</label>
              <Input type="url" value={profile.website} onChange={(e) => handleChange('website', e.target.value)} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
            <span className="text-sm font-medium">Status:</span>
            <span
              className={`text-sm font-semibold capitalize ${
                profile.status === 'approved'
                  ? 'text-green-700'
                  : profile.status === 'pending'
                    ? 'text-amber-700'
                    : profile.status === 'blocked'
                      ? 'text-red-700'
                      : 'text-muted-foreground'
              }`}
            >
              {profile.status}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="text-white px-8" style={btnStyle}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
