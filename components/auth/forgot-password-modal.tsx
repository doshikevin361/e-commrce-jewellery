'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
  tokenExpired?: boolean;
}

export function ForgotPasswordModal({ 
  open, 
  onOpenChange, 
  onSwitchToLogin,
  tokenExpired = false 
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (tokenExpired) {
      setError('The password reset link has expired. Please request a new one.');
    }
  }, [tokenExpired]);

  const validateForm = () => {
    if (!email || !email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/customer/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email');
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1F3B29] mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-4">
              If an account exists with <strong>{email}</strong>, we've sent a password reset link.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please check your inbox and click the link to reset your password. The link will expire in 1 hour.
            </p>
            {onSwitchToLogin && (
              <button
                onClick={() => {
                  onOpenChange(false);
                  onSwitchToLogin();
                }}
                className="inline-block bg-[#1F3B29] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2a4d3a] transition-colors"
              >
                Back to Login
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1F3B29]">Forgot Password</DialogTitle>
          <DialogDescription>Enter your email to receive a password reset link</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p>{error}</p>
              {tokenExpired && (
                <p className="mt-1 text-xs text-red-600">
                  Password reset links are valid for 1 hour only for security reasons.
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F3B29] text-white py-3 rounded-lg font-semibold hover:bg-[#2a4d3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>

        {onSwitchToLogin && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSwitchToLogin();
              }}
              className="text-[#C8A15B] font-semibold hover:underline text-sm"
            >
              Back to Login
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

