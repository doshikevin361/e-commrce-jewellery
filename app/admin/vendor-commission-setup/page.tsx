'use client';

import { useRouter } from 'next/navigation';
import { VendorCommissionSettings } from '@/components/vendor/vendor-commission-settings';

export default function VendorCommissionSetupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10">
        <div className="w-full">
          <VendorCommissionSettings
            mode="setup"
            onComplete={() => router.push('/admin')}
          />
        </div>
      </div>
    </div>
  );
}

