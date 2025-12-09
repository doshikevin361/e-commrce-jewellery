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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    if (showSuccessMessage) {
      setSuccess(showSuccessMessage);
    }
  }, [showSuccessMessage]);

  // Reset form when modal closes or mode changes
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setError('');
      setSuccess('');
      setRegisterSuccess(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

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
      setTimeout(() => {
        onOpenChange(false);
        if (onSwitchMode) {
          onSwitchMode();
        }
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Registration failed');
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen for registration
  if (mode === 'register' && registerSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-4xl p-0 overflow-hidden' showCloseButton={true}>
          <div className='grid md:grid-cols-2 min-h-[500px]'>
            {/* Left side - Image */}
            <div className='hidden md:block relative bg-gradient-to-br from-[#F5EEE5] to-[#E8D5C4]'>
              <div
                className='absolute inset-0 bg-cover bg-center opacity-20'
                style={{
                  backgroundImage: "url('/login.jpg')",
                }}></div>
              <div className='relative h-full flex items-center justify-center p-8'>
                <div className='text-center text-[#1F3B29]'>
                  <CheckCircle className='w-20 h-20 mx-auto mb-4 text-[#C8A15B]' />
                  <h3 className='text-2xl font-bold mb-2'>Welcome to LuxeLoom</h3>
                  <p className='text-lg'>Your journey to elegance begins here</p>
                </div>
              </div>
            </div>

            {/* Right side - Success message */}
            <div className='flex items-center justify-center p-8 md:p-12 bg-white'>
              <div className='w-full max-w-md text-center'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <CheckCircle className='w-8 h-8 text-green-600' />
                </div>
                <h2 className='text-2xl font-bold text-[#1F3B29] mb-2'>Registration Successful!</h2>
                <p className='text-gray-600 mb-4'>
                  We've sent a verification email to <strong>{formData.email}</strong>
                </p>
                <p className='text-sm text-gray-500'>Please check your inbox and click the verification link to activate your account.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='sm:max-w-5xl p-0 overflow-hidden max-h-[90vh] animate-in fade-in-0 zoom-in-95 duration-300'
        showCloseButton={true}>
        <div className='grid md:grid-cols-2 min-h-[600px]'>
          {/* Left side - Image */}
          <div className='hidden md:block relative bg-gradient-to-br from-[#F5EEE5] to-[#E8D5C4] overflow-hidden'>
            <div
              className='absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105'
              style={{
                backgroundImage: "url('/login.jpg')",
              }}>
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent'></div>
            </div>
            <div className='relative h-full flex flex-col justify-end p-8 text-white animate-in slide-in-from-left-5 duration-500'>
              <div className='space-y-4'>
                <h2 className='text-3xl font-bold'>{mode === 'login' ? 'Welcome Back' : 'Join LuxeLoom'}</h2>
                <p className='text-lg opacity-90'>
                  {mode === 'login' ? 'Discover timeless elegance in every piece' : 'Experience luxury jewelry crafted with passion'}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className='flex items-center justify-center p-6 md:p-12 bg-white overflow-y-auto max-h-[90vh] animate-in slide-in-from-right-5 duration-500'>
            <div className='w-full max-w-md space-y-6'>
              {/* Mobile header */}
              <div className='md:hidden text-center mb-6'>
                <h2 className='text-2xl font-bold text-[#1F3B29]'>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                <p className='text-gray-600 mt-1'>{mode === 'login' ? 'Login to your LuxeLoom account' : 'Join LuxeLoom Jewelry today'}</p>
              </div>

              {/* Error message */}
              {error && (
                <div className='p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm'>
                  <AlertCircle className='w-5 h-5 flex-shrink-0 mt-0.5' />
                  <span>{error}</span>
                </div>
              )}

              {/* Success message */}
              {success && <div className='p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm'>{success}</div>}

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address *</label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                      <input
                        type='email'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent transition-all'
                        placeholder='Enter your email'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Password *</label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className='w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent transition-all'
                        placeholder='Enter your password'
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'>
                        {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                      </button>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className='rounded border-gray-300 text-[#C8A15B] focus:ring-[#C8A15B]'
                      />
                      <span className='ml-2 text-sm text-gray-600'>Remember me</span>
                    </label>
                    {onSwitchToForgotPassword && (
                      <button
                        type='button'
                        onClick={() => {
                          onOpenChange(false);
                          onSwitchToForgotPassword();
                        }}
                        className='text-sm text-[#C8A15B] hover:underline font-medium'>
                        Forgot Password?
                      </button>
                    )}
                  </div>

                  <div className='pt-2'>
                    <button
                      type='submit'
                      disabled={loading}
                      className='w-full bg-[#1F3B29] text-white py-3 rounded-lg font-semibold hover:bg-[#2a4d3a] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg'>
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                  </div>

                  {onSwitchMode && (
                    <div className='text-center pt-2'>
                      <p className='text-gray-600 text-sm'>
                        Don't have an account?{' '}
                        <button
                          type='button'
                          onClick={() => {
                            onOpenChange(false);
                            onSwitchMode();
                          }}
                          className='text-[#C8A15B] font-semibold hover:underline'>
                          Register here
                        </button>
                      </p>
                    </div>
                  )}
                </form>
              ) : (
                <form onSubmit={handleRegister} className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name *</label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                      <input
                        type='text'
                        name='name'
                        value={formData.name}
                        onChange={handleRegisterChange}
                        required
                        className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent transition-all'
                        placeholder='Enter your full name'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address *</label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                      <input
                        type='email'
                        name='email'
                        value={formData.email}
                        onChange={handleRegisterChange}
                        required
                        className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent transition-all'
                        placeholder='Enter your email'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Phone Number *</label>
                    <div className='relative'>
                      <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                      <input
                        type='tel'
                        name='phone'
                        value={formData.phone}
                        onChange={handleRegisterChange}
                        required
                        className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent transition-all'
                        placeholder='Enter your phone number'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Password *</label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name='password'
                        value={formData.password}
                        onChange={handleRegisterChange}
                        required
                        className='w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent transition-all'
                        placeholder='Enter your password'
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'>
                        {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Confirm Password *</label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name='confirmPassword'
                        value={formData.confirmPassword}
                        onChange={handleRegisterChange}
                        required
                        className='w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent transition-all'
                        placeholder='Confirm your password'
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'>
                        {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                      </button>
                    </div>
                  </div>

                  <div className='pt-2'>
                    <button
                      type='submit'
                      disabled={loading}
                      className='w-full bg-[#1F3B29] text-white py-3 rounded-lg font-semibold hover:bg-[#2a4d3a] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg'>
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>

                  {onSwitchMode && (
                    <div className='text-center pt-2'>
                      <p className='text-gray-600 text-sm'>
                        Already have an account?{' '}
                        <button
                          type='button'
                          onClick={() => {
                            onOpenChange(false);
                            onSwitchMode();
                          }}
                          className='text-[#C8A15B] font-semibold hover:underline'>
                          Login here
                        </button>
                      </p>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
