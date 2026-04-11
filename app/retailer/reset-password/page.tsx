'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ResetPasswordModal } from '@/components/auth/reset-password-modal';

function RetailerResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setModalOpen(true);
    } else {
      router.push('/retailer/login');
    }
  }, [searchParams, router]);

  const handleClose = () => {
    setModalOpen(false);
    router.push('/retailer/login');
  };

  const openForgotOnRetailerLogin = (options?: { tokenExpired?: boolean }) => {
    try {
      sessionStorage.setItem('openRetailerForgotPassword', '1');
      if (options?.tokenExpired) {
        sessionStorage.setItem('retailerForgotExpired', '1');
      } else {
        sessionStorage.removeItem('retailerForgotExpired');
      }
    } catch {
      /* ignore */
    }
    handleClose();
  };

  if (!token) {
    return null;
  }

  return (
    <ResetPasswordModal
      open={modalOpen}
      onOpenChange={handleClose}
      token={token}
      resetPasswordApiPath="/api/retailer-auth/reset-password"
      onSwitchToLogin={handleClose}
      onSwitchToForgotPassword={openForgotOnRetailerLogin}
    />
  );
}

export default function RetailerResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0b1220]">Loading...</div>}>
      <RetailerResetPasswordContent />
    </Suspense>
  );
}
