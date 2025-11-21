'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { useSettings } from '@/components/settings/settings-provider';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@grocify.com');
  const [password, setPassword] = useState('Admin@123456');
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
      console.log('[v0] Sending login request');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('[v0] Login response received:', data);

      if (!response.ok) {
        console.log('[v0] Login failed:', data.error);
        setError(data.error || 'Login failed');
        return;
      }

      if (data.token) {
        console.log('[v0] Token received, storing in localStorage');
        localStorage.setItem('adminToken', data.token);
        if (data.admin) {
          localStorage.setItem('adminUser', JSON.stringify({
            name: data.admin.name,
            email: data.admin.email,
            role: data.admin.role,
          }));
          console.log('[v0] User data stored:', data.admin.name);
        }
        console.log('[v0] Redirecting to dashboard');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 100);
      } else {
        console.log('[v0] No token in response');
        setError('No token received from server');
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
        <div className="text-center mb-8 space-y-2">
          {settings.logo ? (
            <div className="w-20 h-20 mx-auto rounded-2xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
              <img src={settings.logo} alt={siteName} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-white text-4xl font-bold" style={{ backgroundColor: primaryColor }}>
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Sign In</h2>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Username
                </label>
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
                className="w-full text-white h-12 text-base font-semibold rounded-lg transition-opacity cursor-pointer hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
