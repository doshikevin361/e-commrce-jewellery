'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useSettings } from '@/components/settings/settings-provider';

interface VendorOption {
  _id: string;
  storeName: string;
  email?: string;
}

export default function RetailerRegisterPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor || '#22c55e';
  const siteName = settings.siteName || 'E-commerce';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [trustedVendorIds, setTrustedVendorIds] = useState<string[]>([]);
  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/retailers/vendors');
        const data = await res.json();
        if (res.ok && Array.isArray(data.vendors)) {
          setVendorOptions(data.vendors);
        }
      } catch {
        setVendorOptions([]);
      } finally {
        setLoadingVendors(false);
      }
    })();
  }, []);

  const toggleVendor = (id: string) => {
    setTrustedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/retailer-auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          companyName,
          gstNumber,
          contactNumber,
          businessAddress,
          trustedVendorIds,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      setSuccess(true);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Registration Submitted</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your B2B retailer account is pending approval. You will be able to sign in once an administrator approves your account.
          </p>
          <Link href="/retailer/login">
            <Button className="w-full" style={{ backgroundColor: primaryColor }}>Go to Retailer Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Become a B2B Retailer</h1>
          <p className="text-slate-600 dark:text-slate-400">Register to purchase from trusted vendors</p>
        </div>

        <Card className="bg-white dark:bg-slate-800 border-0 shadow-xl rounded-2xl p-6 md:p-8">
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Password * (min 6 characters)</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Company / Store Name *</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Store Pvt Ltd"
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>GST Number / Tax ID *</Label>
                <Input
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Contact Number *</Label>
                <Input
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="10-digit mobile"
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Business Address *</Label>
              <textarea
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Full address, city, state, pincode"
                required
                rows={3}
                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <Label>Trusted Vendors (select vendors you want to purchase from)</Label>
              {loadingVendors ? (
                <div className="mt-2 flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading vendors...
                </div>
              ) : (
                <div className="mt-2 border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-900/50">
                  {vendorOptions.length === 0 ? (
                    <p className="text-sm text-slate-500">No approved vendors available.</p>
                  ) : (
                    vendorOptions.map((v) => (
                      <label key={v._id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={trustedVendorIds.includes(v._id)}
                          onChange={() => toggleVendor(v._id)}
                          className="rounded border-input"
                        />
                        <span className="text-sm">{v.storeName}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
              <Link href="/retailer/login" className="flex-1">
                <Button type="button" variant="outline" className="w-full">Already have an account? Sign In</Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
