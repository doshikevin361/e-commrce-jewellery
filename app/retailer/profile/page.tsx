'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { RetailerProfileForm } from '@/components/retailer/retailer-profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/components/settings/settings-provider';
import { User, Lock, Loader2 } from 'lucide-react';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export default function RetailerProfilePage() {
  const { settings } = useSettings();
  const primaryColor = settings?.adminPrimaryColor || settings?.primaryColor || '#16a34a';
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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

  return (
    <RetailerLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">
            Business, bank, address & social — same detail level as vendor profile
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-11 bg-gray-100 p-1 rounded-lg mb-2">
            <TabsTrigger value="profile" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium">
              <User className="w-4 h-4 mr-2" />
              Business profile
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium">
              <Lock className="w-4 h-4 mr-2" />
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <RetailerProfileForm primaryColor={primaryColor} />
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Change password</CardTitle>
                <CardDescription>Use at least 6 characters for your new password.</CardDescription>
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
                      className="border-gray-200"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={changingPassword}
                    className="text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {changingPassword ? 'Updating...' : 'Update password'}
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
