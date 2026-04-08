'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Globe } from 'lucide-react';
import { useSettings } from '@/components/settings/settings-provider';

export default function RetailerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Premium backdrop: deep slate + warm gold light */}
      <div
        className="pointer-events-none absolute inset-0 bg-[#0b1220]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#131c2e] to-[#0a0f1a]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(200,161,91,0.22),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(180,130,60,0.12),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-amber-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-20 h-[380px] w-[380px] rounded-full bg-amber-600/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[linear-gradient(rgba(200,161,91,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(200,161,91,0.06)_1px,transparent_1px)] bg-[size:48px_48px]"
        aria-hidden
      />

      {/* Top: back to store */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6">
        <p className="text-xs sm:text-sm text-slate-400/90 max-w-[min(100%,20rem)] hidden sm:block">
          B2B portal — wholesale pricing & orders
        </p>
        <Link
          href="/"
          className="group ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100/95 shadow-lg shadow-black/20 backdrop-blur-md transition hover:border-amber-400/30 hover:bg-white/10 hover:text-white"
        >
          <Globe className="h-4 w-4 text-amber-300/90 transition group-hover:scale-110" aria-hidden />
          Go to website
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md pt-14 sm:pt-8">
        <div className="text-center mb-8 space-y-3">
          {settings.logo ? (
            <div className="w-20 h-20 mx-auto rounded-2xl border border-white/20 bg-white/95 shadow-xl shadow-black/30 ring-1 ring-amber-400/20 flex items-center justify-center overflow-hidden">
              <img src={settings.logo} alt={siteName} className="w-full h-full object-contain p-1" />
            </div>
          ) : (
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-white text-4xl font-bold shadow-lg shadow-black/30 ring-2 ring-amber-400/30"
              style={{ background: `linear-gradient(145deg, ${primaryColor}, #0f172a)` }}
            >
              {siteName[0]}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">{siteName}</h1>
            {tagline ? (
              <p className="text-slate-400 text-sm mt-1.5">{tagline}</p>
            ) : (
              <p className="text-slate-400 text-sm mt-1.5">Manage every part of your storefront</p>
            )}
          </div>
        </div>

        <Card className="border border-white/10 bg-white/[0.07] shadow-2xl shadow-black/40 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div
            className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent"
            aria-hidden
          />
          <div className="p-8 sm:p-9">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">B2B / Retailer Sign In</h2>
            <p className="text-sm text-slate-400 mb-6">Enter your credentials to access the dashboard</p>
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-400/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Username</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full h-12 bg-white/[0.07] border-white/15 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-amber-400/40 focus-visible:border-amber-400/40"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Password</label>
                <div className="[&_button]:text-slate-400 [&_button:hover]:text-white">
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 bg-white/[0.07] border-white/15 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-amber-400/40 focus-visible:border-amber-400/40"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(c) => setRememberMe(c as boolean)}
                    className="border-white/30 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-500"
                  />
                  <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-amber-400/90 hover:text-amber-300 transition shrink-0"
                >
                  Forgot Password?
                </a>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-white h-12 text-base font-semibold rounded-xl transition-all hover:brightness-110 shadow-lg shadow-black/30"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-slate-400">
                Not a B2B retailer?{' '}
                <Link
                  href="/retailer/register"
                  className="font-semibold text-amber-400/95 hover:text-amber-300 transition"
                >
                  Register as B2B Retailer
                </Link>
              </p>
              <p className="text-sm text-slate-500">
                Admin / Vendor?{' '}
                <Link href="/login" className="font-medium text-amber-400/90 hover:text-amber-300 transition">
                  Sign in here
                </Link>
              </p>
              <p className="text-sm text-slate-500 pt-1">
                <Link
                  href="/terms/retailer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-400 hover:text-amber-400/90 transition"
                >
                  Retailer Terms & Conditions
                </Link>
              </p>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-amber-400/90 transition">
            <Globe className="h-3.5 w-3.5" />
            Return to storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
