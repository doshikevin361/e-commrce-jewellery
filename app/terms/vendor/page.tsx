'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import { useSettings } from '@/components/settings/settings-provider';

export default function VendorTermsPage() {
  const { settings } = useSettings();
  const siteName = settings?.siteName || 'Jewel Manas';
  const logo = settings?.logo;
  const [data, setData] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/terms/vendor')
      .then((res) => res.json())
      .then((json) =>
        setData({
          title: json.title || 'Vendor Terms & Conditions',
          content: json.content || '',
        })
      )
      .catch(() => setError('Failed to load terms'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#f8f6f2_60%,_#ffffff)] text-slate-800">


      <main className="max-w-4xl mx-auto px-5 py-10">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 text-amber-800">
            <p>{error}</p>
            <Link href="/become-member" className="mt-4 inline-block text-primary font-medium hover:underline">
              Back to Become Member
            </Link>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400/15 to-primary/10 text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">{data.title}</h1>
            </div>

            <div className="rounded-2xl border border-[#ece7df] bg-white/80 backdrop-blur shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                {data.content ? (
                  <div
                    className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                  />
                ) : (
                  <p className="text-slate-500 italic">No content has been set yet. Please check back later.</p>
                )}
              </div>
            </div>

            <p className="mt-8 text-center">
              <Link href="/become-member" className="text-sm text-slate-500 hover:text-primary transition">
                Back to Become Member
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  );
}
