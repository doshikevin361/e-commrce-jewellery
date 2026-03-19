'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/components/settings/settings-provider';
import { User, Lock, Loader2 } from 'lucide-react';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

type ProfileForm = {
  fullName: string;
  companyName: string;
  email: string;
  contactNumber: string;
  businessAddress: string;
  gstNumber: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function RetailerProfilePage() {
  const { settings } = useSettings();
  const primaryColor = settings?.adminPrimaryColor || settings?.primaryColor || '#16a34a';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>({
    fullName: '',
    companyName: '',
    email: '',
    contactNumber: '',
    businessAddress: '',
    gstNumber: '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/retailer/profile', { credentials: 'include', headers: getAuthHeaders() });
      if (res.status === 401) {
        window.location.href = '/retailer/login';
        return;
      }
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setProfile({
        fullName: data.fullName ?? '',
        companyName: data.companyName ?? '',
        email: data.email ?? '',
        contactNumber: data.contactNumber ?? '',
        businessAddress: data.businessAddress ?? '',
        gstNumber: data.gstNumber ?? '',
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/retailer/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fullName: profile.fullName.trim(),
          companyName: profile.companyName.trim(),
          contactNumber: profile.contactNumber.trim(),
          businessAddress: profile.businessAddress.trim(),
          gstNumber: profile.gstNumber.trim(),
        }),
      });
      if (res.status === 401) {
        window.location.href = '/retailer/login';
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update profile');
      }
      const data = await res.json();
      setProfile((prev) => ({
        ...prev,
        fullName: data.fullName ?? prev.fullName,
        companyName: data.companyName ?? prev.companyName,
        contactNumber: data.contactNumber ?? prev.contactNumber,
        businessAddress: data.businessAddress ?? prev.businessAddress,
        gstNumber: data.gstNumber ?? prev.gstNumber,
      }));
      // Update localStorage so sidebar/topbar show updated name
      try {
        const u = localStorage.getItem('retailerUser');
        if (u) {
          const parsed = JSON.parse(u);
          parsed.fullName = data.fullName ?? parsed.fullName;
          parsed.companyName = data.companyName ?? parsed.companyName;
          localStorage.setItem('retailerUser', JSON.stringify(parsed));
        }
      } catch (_) {}
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch('/api/retailer/profile/password', {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (res.status === 401) {
        window.location.href = '/retailer/login';
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to change password');
      }
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <RetailerLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" style={{ color: primaryColor }} />
        </div>
      </RetailerLayout>
    );
  }

  return (
    <RetailerLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your retailer account details</p>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-11 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="basic"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 font-medium"
            >
              <User className="w-4 h-4 mr-2" />
              Basic & contact
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 font-medium"
            >
              <Lock className="w-4 h-4 mr-2" />
              Change password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic & contact</CardTitle>
                <CardDescription>Update your name, company and contact information.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input
                        id="fullName"
                        value={profile.fullName}
                        onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                        placeholder="Contact person name"
                        className="border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company / shop name</Label>
                      <Input
                        id="companyName"
                        value={profile.companyName}
                        onChange={(e) => setProfile((p) => ({ ...p, companyName: e.target.value }))}
                        placeholder="Business name"
                        className="border-gray-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      readOnly
                      disabled
                      className="bg-gray-50 border-gray-200 text-gray-600"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact number</Label>
                    <Input
                      id="contactNumber"
                      value={profile.contactNumber}
                      onChange={(e) => setProfile((p) => ({ ...p, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 15) }))}
                      placeholder="10-digit mobile number"
                      className="border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business address</Label>
                    <Textarea
                      id="businessAddress"
                      value={profile.businessAddress}
                      onChange={(e) => setProfile((p) => ({ ...p, businessAddress: e.target.value }))}
                      placeholder="Full address"
                      rows={3}
                      className="border-gray-200 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST number (optional)</Label>
                    <Input
                      id="gstNumber"
                      value={profile.gstNumber}
                      onChange={(e) => setProfile((p) => ({ ...p, gstNumber: e.target.value.toUpperCase().trim() }))}
                      placeholder="GSTIN"
                      className="border-gray-200"
                    />
                  </div>
                  <Button type="submit" disabled={saving} style={{ backgroundColor: primaryColor }} className="text-white hover:opacity-90">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {saving ? 'Saving...' : 'Save profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Change password</CardTitle>
                <CardDescription>Use a strong password with at least 6 characters.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Min 6 characters"
                      className="border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="border-gray-200"
                    />
                  </div>
                  <Button type="submit" disabled={changingPassword} variant="outline" className="border-gray-300">
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {changingPassword ? 'Updating...' : 'Change password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RetailerLayout>
  );
}
