'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'login' | 'register';
  onSwitchMode?: () => void;
  onSwitchToForgotPassword?: () => void;
  showSuccessMessage?: string;
}

export function AuthModal({ open, onOpenChange, mode, onSwitchMode, onSwitchToForgotPassword, showSuccessMessage }: AuthModalProps) {
  const router = useRouter();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Register state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<{ email?: string; phone?: string; [key: string]: string | undefined }>({});

  // Common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (showSuccessMessage) {
      setSuccess(showSuccessMessage);
    }
  }, [showSuccessMessage]);

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

  // Reset form when modal closes or mode changes
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setError('');
      setSuccess('');
      setRegisterSuccess(false);
      setLoginErrors({});
      setRegisterErrors({});
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
        },
      });
    }
  }, [open, mode]);

  // Email validation helper
  const validateEmail = (emailValue: string): string | undefined => {
    if (!emailValue || !emailValue.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue.trim())) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  // Phone validation helper
  const validatePhone = (phoneValue: string): string | undefined => {
    if (!phoneValue || !phoneValue.trim()) {
      return 'Phone number is required';
    }
    // Remove all non-numeric characters for validation
    const numericPhone = phoneValue.replace(/\D/g, '');
    if (numericPhone.length === 0) {
      return 'Phone number is required';
    }
    if (numericPhone.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    if (numericPhone.length > 15) {
      return 'Phone number must not exceed 15 digits';
    }
    // Check if it contains only numbers
    if (!/^\d+$/.test(numericPhone)) {
      return 'Phone number must contain only numbers';
    }
    return undefined;
  };

  // Handle login email change with real-time validation
  const handleLoginEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const emailError = validateEmail(value);
    setLoginErrors(prev => ({ ...prev, email: emailError }));
  };

  // Handle register email change with real-time validation
  const handleRegisterEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    const emailError = validateEmail(value);
    setRegisterErrors(prev => ({ ...prev, email: emailError }));
  };

  // Handle register phone change with real-time validation and numeric only
  const handleRegisterPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Only allow numeric characters
    value = value.replace(/\D/g, '');
    // Limit to 15 digits maximum
    if (value.length > 15) {
      value = value.slice(0, 15);
    }
    setFormData(prev => ({ ...prev, phone: value }));
    // Real-time validation
    const phoneError = validatePhone(value);
    setRegisterErrors(prev => ({ ...prev, phone: phoneError }));
  };

  const validateLoginForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    if (!password || !password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!validateLoginForm()) {
      setError('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Invalid credentials');
        setError(data.error || 'Login failed');
        return;
      }

      if (data.token) {
        localStorage.setItem('customerToken', data.token);
        if (data.customer) {
          localStorage.setItem('currentCustomer', JSON.stringify(data.customer));
        }
        toast.success('Login successful!');
        window.dispatchEvent(new Event('authChange'));
        onOpenChange(false);
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Invalid credentials');
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle email and phone with special validation
    if (name === 'email') {
      handleRegisterEmailChange(e);
      return;
    }
    if (name === 'phone') {
      handleRegisterPhoneChange(e);
      return;
    }

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateRegisterForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters long';
    }

    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    // Phone validation
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;

    // Password validation
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    } else if (formData.password.length > 50) {
      errors.password = 'Password must be less than 50 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateRegisterForm()) {
      setError('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Registration failed');
        setError(data.error || 'Registration failed');
        return;
      }

      toast.success('Account created successfully!');
      setRegisterSuccess(true);
      setCooldownSeconds(300); // 5 minutes cooldown
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Registration failed');
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (cooldownSeconds > 0 || !formData.email) return;

    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/customer/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.cooldownRemaining) {
          setCooldownSeconds(data.cooldownRemaining);
          toast.error(data.error || 'Please wait before requesting another email.');
        } else {
          toast.error(data.error || 'Failed to send verification email');
        }
        return;
      }

      setCooldownSeconds(300); // 5 minutes = 300 seconds
      toast.success('Verification email has been sent! Please check your inbox.');
    } catch (err) {
      console.error('Resend verification error:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Success screen for registration
  if (mode === 'register' && registerSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-md p-0 overflow-hidden rounded-none' showCloseButton={true}>
          <div className='flex items-center justify-center p-6 sm:p-8 bg-white'>
            <div className='w-full space-y-4'>
              <div className='text-center'>
                <div className='w-12 h-12 bg-green-100 flex items-center justify-center mx-auto mb-3'>
                  <CheckCircle className='w-6 h-6 text-green-600' />
                </div>
                <h2 className='text-xl font-bold text-[#001e38] mb-2'>Check Your Email</h2>
                <p className='text-sm text-gray-600 mb-2'>
                  We've sent a verification email to <strong className='break-all text-[#001e38]'>{formData.email}</strong>
                </p>
                <p className='text-xs text-gray-500 mb-4'>
                  Please check your inbox and click the verification link to activate your account. You will not be able to login until you
                  verify your email.
                </p>
              </div>

              {/* Resend Verification Button */}
              <div>
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading || cooldownSeconds > 0}
                  className='w-full bg-[#3579b8] text-white py-2.5 text-sm font-semibold hover:bg-[#2a6ba5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                  {resendLoading
                    ? 'Sending...'
                    : cooldownSeconds > 0
                      ? `Resend in ${Math.floor(cooldownSeconds / 60)}:${String(cooldownSeconds % 60).padStart(2, '0')}`
                      : 'Resend Verification Email'}
                </button>
              </div>

              {onSwitchMode && (
                <div className='text-center pt-3 border-t border-gray-200'>
                  <button
                    onClick={() => {
                      onOpenChange(false);
                      onSwitchMode();
                    }}
                    className='text-[#3579b8] font-semibold hover:text-[#2a6ba5] transition-colors text-sm pt-3'>
                    Go to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='sm:max-w-md p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300 rounded-none'
        showCloseButton={true}>
        <div className='flex items-center justify-center p-6 sm:p-8 bg-white'>
          <div className='w-full space-y-4'>
            {/* Header */}
            <div className='text-center mb-4'>
              <h2 className='text-xl sm:text-2xl font-bold text-[#001e38] mb-1'>{mode === 'login' ? 'Login' : 'Create Account'}</h2>
              <p className='text-gray-600 text-sm'>
                {mode === 'login' ? 'Enter your credentials to access your account' : 'Fill in your details to create a new account'}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className='p-3 bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs'>
                <AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
                <span>{error}</span>
              </div>
            )}

            {/* Success message */}
            {success && <div className='p-3 bg-green-50 border border-green-200 text-green-700 text-xs'>{success}</div>}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className='space-y-4'>
                <div>
                  <label className='block text-xs font-medium text-[#001e38] mb-1.5'>Email Address *</label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                    <input
                      type='email'
                      value={email}
                      onChange={handleLoginEmailChange}
                      onBlur={() => {
                        const emailError = validateEmail(email);
                        setLoginErrors(prev => ({ ...prev, email: emailError }));
                      }}
                      required
                      className={`w-full pl-10 pr-3 py-2.5 text-sm border-2 focus:ring-2 focus:ring-[#3579b8] focus:border-[#3579b8] transition-all ${
                        loginErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-[#e4e4e4]'
                      }`}
                      placeholder='Enter your email address'
                    />
                  </div>
                  {loginErrors.email && (
                    <p className='mt-1.5 text-xs text-red-600 flex items-center gap-1'>
                      <AlertCircle className='w-3.5 h-3.5' />
                      {loginErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-xs font-medium text-[#001e38] mb-1.5'>Password *</label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        // Clear password error when user starts typing
                        if (loginErrors.password) {
                          setLoginErrors(prev => ({ ...prev, password: undefined }));
                        }
                      }}
                      onBlur={() => {
                        if (!password || password.length < 6) {
                          setLoginErrors(prev => ({
                            ...prev,
                            password: password.length === 0 ? 'Password is required' : 'Password must be at least 6 characters long',
                          }));
                        }
                      }}
                      required
                      className={`w-full pl-10 pr-10 py-2.5 text-sm border-2 focus:ring-2 focus:ring-[#3579b8] focus:border-[#3579b8] transition-all ${
                        loginErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-[#e4e4e4]'
                      }`}
                      placeholder='Enter your password'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3579b8] transition-colors'>
                      {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className='mt-1.5 text-xs text-red-600 flex items-center gap-1'>
                      <AlertCircle className='w-3.5 h-3.5' />
                      {loginErrors.password}
                    </p>
                  )}
                </div>

                <div className='flex items-center justify-between pt-1'>
                  <label className='flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className='w-3.5 h-3.5 border-gray-300 text-[#3579b8] focus:ring-[#3579b8] cursor-pointer'
                    />
                    <span className='ml-2 text-xs text-gray-700'>Remember me</span>
                  </label>
                  {onSwitchToForgotPassword && (
                    <button
                      type='button'
                      onClick={() => {
                        onOpenChange(false);
                        onSwitchToForgotPassword();
                      }}
                      className='text-xs text-[#3579b8] hover:text-[#2a6ba5] font-medium transition-colors'>
                      Forgot Password?
                    </button>
                  )}
                </div>

                <div className='pt-2'>
                  <button
                    type='submit'
                    disabled={loading || !!loginErrors.email || !!loginErrors.password}
                    className='w-full bg-[#001e38] text-white py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>

                {onSwitchMode && (
                  <div className='text-center pt-3 border-t border-gray-200'>
                    <p className='text-gray-600 text-xs pt-3'>
                      Don't have an account?{' '}
                      <button
                        type='button'
                        onClick={() => {
                          onSwitchMode();
                        }}
                        className='text-[#001e38] font-semibold hover:text-[#001e38] transition-colors'>
                        Register here
                      </button>
                    </p>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={handleRegister} className='space-y-4'>
                <div>
                  <label className='block text-xs font-medium text-[#001e38] mb-1.5'>Full Name *</label>
                  <div className='relative'>
                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                    <input
                      type='text'
                      name='name'
                      value={formData.name}
                      onChange={handleRegisterChange}
                      required
                      className='w-full pl-10 pr-3 py-2.5 text-sm border-2 border-[#e4e4e4] focus:ring-2 focus:ring-[#3579b8] focus:border-[#3579b8] transition-all'
                      placeholder='Enter your full name'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-medium text-[#001e38] mb-1.5'>Email Address *</label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                    <input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleRegisterChange}
                      onBlur={() => {
                        const emailError = validateEmail(formData.email);
                        setRegisterErrors(prev => ({ ...prev, email: emailError }));
                      }}
                      required
                      className={`w-full pl-10 pr-3 py-2.5 text-sm border-2 focus:ring-2 focus:ring-[#3579b8] focus:border-[#3579b8] transition-all ${
                        registerErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-[#e4e4e4]'
                      }`}
                      placeholder='Enter your email address'
                    />
                  </div>
                  {registerErrors.email && (
                    <p className='mt-1.5 text-xs text-red-600 flex items-center gap-1'>
                      <AlertCircle className='w-3.5 h-3.5' />
                      {registerErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-xs font-medium text-[#001e38] mb-1.5'>Phone Number *</label>
                  <div className='relative'>
                    <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                    <input
                      type='tel'
                      name='phone'
                      value={formData.phone}
                      onChange={handleRegisterPhoneChange}
                      onBlur={() => {
                        const phoneError = validatePhone(formData.phone);
                        setRegisterErrors(prev => ({ ...prev, phone: phoneError }));
                      }}
                      required
                      inputMode='numeric'
                      pattern='[0-9]*'
                      className={`w-full pl-10 pr-3 py-2.5 text-sm border-2 focus:ring-2 focus:ring-[#3579b8] focus:border-[#3579b8] transition-all ${
                        registerErrors.phone ? 'border-red-300 focus:ring-red-500' : 'border-[#e4e4e4]'
                      }`}
                      placeholder='Enter your phone number'
                    />
                  </div>
                  {registerErrors.phone && (
                    <p className='mt-1.5 text-xs text-red-600 flex items-center gap-1'>
                      <AlertCircle className='w-3.5 h-3.5' />
                      {registerErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-xs font-medium text-[#001e38] mb-1.5'>Password *</label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      name='password'
                      value={formData.password}
                      onChange={handleRegisterChange}
                      required
                      className='w-full pl-10 pr-10 py-2.5 text-sm border-2 border-[#e4e4e4] focus:ring-2 focus:ring-[#3579b8] focus:border-[#3579b8] transition-all'
                      placeholder='Enter your password'
                    />
                    <button
                      type='button'
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3579b8] transition-colors'>
                      {showRegisterPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-medium text-[#001e38] mb-1.5'>Confirm Password *</label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                      className='w-full pl-10 pr-10 py-2.5 text-sm border-2 border-[#e4e4e4] focus:ring-2 focus:ring-[#3579b8] focus:border-[#3579b8] transition-all'
                      placeholder='Confirm your password'
                    />
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3579b8] transition-colors'>
                      {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                    </button>
                  </div>
                </div>

                <div className='pt-2'>
                  <button
                    type='submit'
                    disabled={
                      loading ||
                      !!registerErrors.email ||
                      !!registerErrors.phone ||
                      !!registerErrors.password ||
                      !!registerErrors.confirmPassword ||
                      !!registerErrors.name
                    }
                    className='w-full bg-[#001e38] text-white py-2.5 text-sm font-semibold hover:bg-[#001e38] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>

                {onSwitchMode && (
                  <div className='text-center pt-3 border-t border-gray-200'>
                    <p className='text-gray-600 text-xs pt-3'>
                      Already have an account?{' '}
                      <button
                        type='button'
                        onClick={() => {
                          onSwitchMode();
                        }}
                        className='text-[#001e38] font-semibold hover:text-[#001e38] transition-colors'>
                        Login here
                      </button>
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
