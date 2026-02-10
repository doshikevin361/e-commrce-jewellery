'use client';

import { useRouter } from 'next/navigation';
import { VendorCommissionSettings } from '@/components/vendor/vendor-commission-settings';

export default function VendorCommissionSetupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full max-w-none bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-none px-4 py-6 sm:px-6 lg:px-8">
        <VendorCommissionSettings
          mode="setup"
          onComplete={() => router.push('/admin')}
        />
      </div>
    </div>
  );
}

