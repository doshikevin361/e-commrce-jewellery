'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/components/settings/settings-provider';

export default function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor || '#22c55e';
  const siteName = settings.siteName || 'E-commerce';
  const tagline = settings.tagline || 'User Account Login';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('[v0] User login attempt');
      const response = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('[v0] Login failed:', data.error);
        setError(data.error || 'Login failed');
        return;
      }

      if (data.token) {
        console.log('[v0] Token received, storing in localStorage');
        localStorage.setItem('userToken', data.token);
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify({
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            email: data.user.email,
            role: data.user.role,
          }));
          console.log('[v0] User data stored');
        }
        console.log('[v0] Redirecting to dashboard');
        setTimeout(() => {
          window.location.href = '/user-dashboard';
        }, 100);
      }
    } catch (err) {
      console.error('[v0] Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-xl rounded-2xl">
          <div className="p-8">
            <div className="text-center mb-8 space-y-2">
              {settings.logo ? (
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg border border-slate-200 bg-white overflow-hidden mx-auto">
                  <img src={settings.logo} alt={siteName} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg text-white text-2xl font-bold mx-auto" style={{ backgroundColor: primaryColor }}>
                  {siteName[0]}
                </div>
              )}
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{siteName}</h1>
              <p className="text-slate-600 dark:text-slate-400">{tagline}</p>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full h-12 bg-blue-50 dark:bg-slate-700 border-blue-100 dark:border-slate-600 rounded-lg"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
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
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label 
                    htmlFor="remember" 
                    className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
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
                className="w-full text-white h-12 text-base font-semibold rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <a href="#" className="font-medium hover:opacity-80" style={{ color: primaryColor }}>
                  Sign up here
                </a>
              </p>
            </div>

            <div className="mt-8">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
