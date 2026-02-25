'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BecomeVendorRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/become-member');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-500">Redirecting...</p>
    </div>
  );
}
