'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, MapPin, Trash2 } from 'lucide-react';

type LocationRow = {
  _id: string;
  ownerType: string;
  pickupLocation: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  country?: string;
  pinCode: string;
  createdAt?: string;
};

type Props = {
  apiBase: '/api/admin/pickup-locations' | '/api/retailer/pickup-locations';
  title?: string;
};

export function PickupLocationsPage({ apiBase, title = 'Pickup locations (Shiprocket)' }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<LocationRow[]>([]);
  const [shiprocketEnabled, setShiprocketEnabled] = useState(true);
  const [adminRole, setAdminRole] = useState<string | null>(null);

  const [pickupLocation, setPickupLocation] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [pinCode, setPinCode] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiBase, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setRows(data.locations || []);
      setShiprocketEnabled(data.shiprocketEnabled !== false);
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to load',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [apiBase]);

  useEffect(() => {
    try {
      const u = localStorage.getItem('adminUser');
      if (u) setAdminRole(JSON.parse(u).role);
    } catch {
      setAdminRole(null);
    }
  }, []);

  const showDeleteForRow = (r: LocationRow) => {
    if (apiBase.includes('/retailer')) return r.ownerType === 'retailer';
    if (adminRole === 'vendor') return r.ownerType === 'vendor';
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLocation,
          name,
          email,
          phone,
          address,
          address2,
          city,
          state,
          country,
          pinCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      toast({ title: 'Saved', description: 'Pickup location added in Shiprocket and here.' });
      setPickupLocation('');
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setAddress2('');
      setCity('');
      setState('');
      setCountry('India');
      setPinCode('');
      await load();
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Save failed',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this record from the app? (Shiprocket panel may still list it.)')) return;
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      toast({ title: 'Removed', description: data.message || 'Done' });
      await load();
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Delete failed',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-7 h-7" />
          {title}
        </h1>
        <p className="text-slate-600 mt-1 text-sm">
          Nickname must be unique. It is saved in Shiprocket and used when you mark an order <strong>Shipped</strong>.
        </p>
        {!shiprocketEnabled && (
          <p className="text-amber-700 text-sm mt-2">Shiprocket is disabled in environment — saving will fail.</p>
        )}
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">Add pickup location</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label>Nickname (Shiprocket pickup name) *</Label>
            <Input
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="e.g. Main Warehouse"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Contact name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Phone (10 digit) *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>PIN code *</Label>
            <Input value={pinCode} onChange={(e) => setPinCode(e.target.value)} maxLength={6} required />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Address line 1 *</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Address line 2</Label>
            <Input value={address2} onChange={(e) => setAddress2(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>City *</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>State *</Label>
            <Input value={state} onChange={(e) => setState(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={saving} className="mt-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save to Shiprocket
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">Saved locations</h2>
        {rows.length === 0 ? (
          <p className="text-slate-500 text-sm">No locations yet.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((r) => (
              <div
                key={r._id}
                className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border border-slate-200 rounded-lg p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{r.pickupLocation}</p>
                  <p className="text-sm text-slate-600">
                    {r.address}
                    {r.address2 ? `, ${r.address2}` : ''}, {r.city}, {r.state} {r.pinCode},{' '}
                    {r.country || 'India'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {r.name} · {r.email} · {r.phone} · <span className="uppercase">{r.ownerType}</span>
                  </p>
                </div>
                {showDeleteForRow(r) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 shrink-0"
                    onClick={() => handleDelete(r._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
