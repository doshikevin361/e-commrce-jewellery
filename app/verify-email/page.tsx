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
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [email, setEmail] = useState('');

  // Cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownSeconds]);

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    
    if (successParam === 'true') {
      setSuccess(true);
      setLoading(false);
      return;
    }
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setLoading(false);
      return;
    }
    
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

  const handleResendVerification = async () => {
    if (!email || cooldownSeconds > 0) return;

    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/customer/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.cooldownRemaining) {
          setCooldownSeconds(data.cooldownRemaining);
          setError(data.error || 'Please wait before requesting another email.');
        } else {
          setError(data.error || 'Failed to send verification email');
        }
        return;
      }

      setCooldownSeconds(300); // 5 minutes = 300 seconds
      setError('');
      alert('Verification email has been sent! Please check your inbox.');
    } catch (err) {
      console.error('Resend verification error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setResendLoading(false);
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
        <p className="text-sm text-gray-500 mb-4">
          If the link has expired, you can request a new verification email.
        </p>
        
        {/* Resend Verification Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent mb-3"
          />
          <button
            onClick={handleResendVerification}
            disabled={resendLoading || cooldownSeconds > 0 || !email}
            className="w-full bg-[#C8A15B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#b8914a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? (
              'Sending...'
            ) : cooldownSeconds > 0 ? (
              `Resend in ${Math.floor(cooldownSeconds / 60)}:${String(cooldownSeconds % 60).padStart(2, '0')}`
            ) : (
              'Resend Verification Email'
            )}
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={onOpenLogin}
            className="block w-full bg-[#1F3B29] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2a4d3a] transition-colors"
          >
            Go to Login
          </button>
          <button
            onClick={onOpenRegister}
            className="block w-full text-[#C8A15B] font-semibold hover:underline"
          >
            Register Again
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

