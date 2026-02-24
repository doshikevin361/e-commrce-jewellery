'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { useSettings } from '@/components/settings/settings-provider';

export default function RetailerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor || '#22c55e';
  const siteName = settings.siteName || 'E-commerce';
  const tagline = settings.tagline;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/retailer-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      if (data.token) {
        localStorage.setItem('retailerToken', data.token);
        if (data.retailer) {
          localStorage.setItem('retailerUser', JSON.stringify(data.retailer));
        }
        window.location.href = '/retailer';
      } else {
        setError('No token received from server');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          {settings.logo ? (
            <div className="w-20 h-20 mx-auto rounded-2xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
              <img src={settings.logo} alt={siteName} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-white text-4xl font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {siteName[0]}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{siteName}</h1>
            {tagline && <p className="text-slate-600 dark:text-slate-400 text-sm">{tagline}</p>}
          </div>
        </div>

        <Card className="bg-white dark:bg-slate-800 border-0 shadow-xl rounded-2xl">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">B2B / Retailer Sign In</h2>
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice.admin@example.com"
                  className="w-full h-12 bg-blue-50 dark:bg-slate-700 border-blue-100 dark:border-slate-600 rounded-lg"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 bg-blue-50 dark:bg-slate-700 border-blue-100 dark:border-slate-600 rounded-lg"
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c as boolean)} />
                  <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-orange-500 hover:text-orange-600">
                  Forgot Password?
                </a>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-white h-12 text-base font-semibold rounded-lg transition-opacity cursor-pointer hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Not a B2B retailer?{' '}
                <Link href="/retailer/register" className="font-semibold hover:underline" style={{ color: primaryColor }}>
                  Register as B2B Retailer
                </Link>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Admin / Vendor?{' '}
                <Link href="/login" className="font-medium hover:underline" style={{ color: primaryColor }}>
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
