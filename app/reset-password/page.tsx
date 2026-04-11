'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ResetPasswordModal } from '@/components/auth/reset-password-modal';

function ResetPasswordPageContent() {
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
      // No token, redirect to home
      router.push('/');
    }
  }, [searchParams, router]);

  const handleClose = () => {
    setModalOpen(false);
    router.push('/');
  };

  const openForgotPasswordOnHome = (options?: { tokenExpired?: boolean }) => {
    try {
      sessionStorage.setItem('openForgotPassword', '1');
      if (options?.tokenExpired) {
        sessionStorage.setItem('forgotPasswordExpired', '1');
      } else {
        sessionStorage.removeItem('forgotPasswordExpired');
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
      onSwitchToLogin={() => {
        handleClose();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('openLoginModal'));
        }
      }}
      onSwitchToForgotPassword={openForgotPasswordOnHome}
    />
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

