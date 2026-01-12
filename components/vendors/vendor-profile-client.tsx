'use client';

import { useState, useEffect } from 'react';
import { VendorProfileForm } from './vendor-profile-form';
import { VendorPasswordChange } from './vendor-password-change';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function VendorProfileClient() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user role from localStorage or a user info endpoint
    const checkUserRole = async () => {
      try {
        // Try to get admin info from localStorage
        const adminData = localStorage.getItem('adminUser');
        if (adminData) {
          const admin = JSON.parse(adminData);
          setUserRole(admin.role);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If user is a vendor, show vendor profile form
  if (userRole === 'vendor') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Vendor Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your vendor profile and business information</p>
        </div>
        <VendorProfileForm />
        <VendorPasswordChange />
      </div>
    );
  }

  // Otherwise show admin profile form
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your profile information and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input type="text" placeholder="Enter your full name" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" placeholder="Enter your email" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <Input type="tel" placeholder="Enter your phone number" className="mt-1" />
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Current Password</label>
                <Input type="password" placeholder="Enter current password" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" placeholder="Enter new password" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input type="password" placeholder="Confirm new password" className="mt-1" />
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
