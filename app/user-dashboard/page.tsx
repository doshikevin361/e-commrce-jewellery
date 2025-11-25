'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

export default function UserDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      router.push('/user-login');
      return;
    }

    const user = localStorage.getItem('currentUser');
    if (user) {
      setUserData(JSON.parse(user));
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    router.push('/user-login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome, {userData?.firstName}!</h1>
            <p className="text-gray-600 dark:text-gray-400">User Dashboard</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="destructive"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">First Name</p>
            <p className="text-2xl font-bold">{userData?.firstName}</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Name</p>
            <p className="text-2xl font-bold">{userData?.lastName}</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
            <p className="text-lg font-semibold break-all">{userData?.email}</p>
          </Card>
        </div>

        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Role</dt>
              <dd className="font-semibold">{userData?.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Status</dt>
              <dd className="font-semibold text-green-600">Active</dd>
            </div>
          </dl>
        </Card>
      </div>
  );
}
