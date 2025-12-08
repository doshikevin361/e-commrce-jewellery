'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { AuthModal } from '@/components/auth/auth-modal';

function VerifyEmailForm({ 
  onOpenLogin, 
  onOpenRegister 
}: { 
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setError('Invalid verification link');
      setLoading(false);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/customer/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to verify email');
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Verify email error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5EEE5] to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="w-12 h-12 text-[#C8A15B] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1F3B29] mb-2">Verifying Email...</h2>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5EEE5] to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1F3B29] mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-4">
            Your email has been verified successfully. You can now login to your account.
          </p>
          <button
            onClick={onOpenLogin}
            className="inline-block bg-[#1F3B29] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2a4d3a] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5EEE5] to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#1F3B29] mb-2">Verification Failed</h2>
        <p className="text-gray-600 mb-4">
          {error || 'The verification link is invalid or has expired.'}
        </p>
        <div className="space-y-2">
          <button
            onClick={onOpenRegister}
            className="block w-full bg-[#1F3B29] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2a4d3a] transition-colors"
          >
            Register Again
          </button>
          <button
            onClick={onOpenLogin}
            className="block w-full text-[#C8A15B] font-semibold hover:underline"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-[#F5EEE5] to-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
              <Loader2 className="w-12 h-12 text-[#C8A15B] animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#1F3B29] mb-2">Loading...</h2>
              <p className="text-gray-600">Please wait...</p>
            </div>
          </div>
        }
      >
        <VerifyEmailForm 
          onOpenLogin={() => {
            setAuthMode('login');
            setAuthModalOpen(true);
          }}
          onOpenRegister={() => {
            setAuthMode('register');
            setAuthModalOpen(true);
          }}
        />
      </Suspense>
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onSwitchMode={() => {
          setAuthMode(authMode === 'login' ? 'register' : 'login');
        }}
      />
    </>
  );
}

