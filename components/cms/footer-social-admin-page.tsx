'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Facebook, Instagram, Linkedin, Loader2, Twitter, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Links = {
  facebook: string;
  twitter: string;
  youtube: string;
  instagram: string;
  linkedin: string;
};

const empty: Links = { facebook: '', twitter: '', youtube: '', instagram: '', linkedin: '' };

export function FooterSocialAdminPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<Links>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/cms/footer-social');
        if (res.ok) {
          const data = await res.json();
          setForm({
            facebook: data.facebook || '',
            twitter: data.twitter || '',
            youtube: data.youtube || '',
            instagram: data.instagram || '',
            linkedin: data.linkedin || '',
          });
        }
      } catch {
        toast({ title: 'Error', description: 'Could not load social links', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/cms/footer-social', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      if (data.footerSocialLinks) {
        setForm({
          facebook: data.footerSocialLinks.facebook || '',
          twitter: data.footerSocialLinks.twitter || '',
          youtube: data.footerSocialLinks.youtube || '',
          instagram: data.footerSocialLinks.instagram || '',
          linkedin: data.footerSocialLinks.linkedin || '',
        });
      }
      toast({ title: 'Saved', variant: 'success', description: 'Website footer will show these links when set.' });
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

  const row = (
    key: keyof Links,
    label: string,
    placeholder: string,
    Icon: typeof Facebook
  ) => (
    <div className="space-y-2">
      <Label htmlFor={key} className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 shrink-0 opacity-70" />
        {label}
      </Label>
      <Input
        id={key}
        type="url"
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        disabled={loading}
        className="font-mono text-sm"
      />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/cms/footer-content" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Footer social links</h1>
          <p className="text-sm text-gray-500 mt-1">
            URLs for “Follow us on” icons on the public website footer. Leave blank to hide an icon.
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {row('facebook', 'Facebook', 'https://facebook.com/yourpage', Facebook)}
            {row('twitter', 'X (Twitter)', 'https://x.com/yourhandle', Twitter)}
            {row('youtube', 'YouTube', 'https://youtube.com/@yourchannel', Youtube)}
            {row('instagram', 'Instagram', 'https://instagram.com/yourprofile', Instagram)}
            {row('linkedin', 'LinkedIn', 'https://linkedin.com/company/yourcompany', Linkedin)}
            <Button onClick={save} disabled={saving} className="bg-[#22c55e] hover:bg-[#16a34a]">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
