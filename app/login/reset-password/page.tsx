'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ResetPasswordModal } from '@/components/auth/reset-password-modal';

function LoginResetPasswordContent() {
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
      router.push('/login');
    }
  }, [searchParams, router]);

  const handleClose = () => {
    setModalOpen(false);
    router.push('/login');
  };

  const openForgotOnLogin = (options?: { tokenExpired?: boolean }) => {
    try {
      sessionStorage.setItem('openPortalForgotPassword', '1');
      if (options?.tokenExpired) {
        sessionStorage.setItem('portalForgotExpired', '1');
      } else {
        sessionStorage.removeItem('portalForgotExpired');
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
      resetPasswordApiPath="/api/auth/admin-vendor/reset-password"
      onSwitchToLogin={handleClose}
      onSwitchToForgotPassword={openForgotOnLogin}
    />
  );
}

export default function LoginResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">Loading...</div>}>
      <LoginResetPasswordContent />
    </Suspense>
  );
}
