import React, { useState, useEffect } from 'react';
import { Search, Phone, Video, MapPin, Heart, ShoppingCart, ChevronDown, Clock, Store, LogOut, User } from 'lucide-react';
import { AuthModal } from '@/components/auth/auth-modal';
import toast from 'react-hot-toast';

const HomeHeader = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      // When user scrolls past the main header (approximately 120px)
      if (window.scrollY > 120) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('customerToken');
        const customerData = localStorage.getItem('currentCustomer');
        
        if (token && customerData) {
          try {
            const customer = JSON.parse(customerData);
            setIsLoggedIn(true);
            setCustomerName(customer.name || customer.email || 'User');
          } catch (error) {
            console.error('Error parsing customer data:', error);
            setIsLoggedIn(false);
            setCustomerName('');
          }
        } else {
          setIsLoggedIn(false);
          setCustomerName('');
        }
      }
    };

    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  const handleLoginClick = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleSignupClick = () => {
    setAuthMode('register');
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customerToken');
      localStorage.removeItem('currentCustomer');
      setIsLoggedIn(false);
      setCustomerName('');
      window.dispatchEvent(new Event('authChange'));
      toast.success('Logged out successfully');
    }
  };

  const handleSwitchMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
  };

  const menuItems = [
    // { label: '10+1 MONTHLY PLANS', hasDropdown: true },
    { label: 'WATCH JEWELLERY', hasDropdown: true },
    { label: 'RINGS', hasDropdown: true },
    { label: 'EARRINGS', hasDropdown: true },
    { label: 'PENDANTS', hasDropdown: true },
    { label: 'SOLITAIRES', hasDropdown: true },
    { label: 'ALL JEWELLERY', hasDropdown: true },
    { label: 'GIFTS', hasDropdown: true },
    { label: 'GOLD COINS', hasDropdown: true },
  ];

  return (
    <div className='w-full'>
      {/* Top Bar */}
      <div className='bg-whit py-2 px-4'>
        <div className='max-w-[1440px] mx-auto flex items-center justify-between'>
          {/* Left - Phone */}
          <div className='flex items-center gap-2 text-gray-500 text-sm'></div>

          {/* Right - Actions */}
          <div className='flex items-center gap-4 text-[12px]'>
            <div className='flex flex-row gap-3 items-center text-gray-500'>
              {' '}
              <Phone className='w-4 h-4' />
              <span>18004190066</span>
            </div>
            <span className='h-3 w-px bg-gray-500'></span>
            <button className='flex items-center gap-1 text-[#3579b8]'>
              <Video className='w-4 h-4' />
              <span>Video Call Cart</span>
            </button>
            <span className='h-3 w-px bg-gray-500'></span>
            {isLoggedIn ? (
              <>
                <div className='flex items-center gap-2'>
                  <User className='w-4 h-4 text-[#3579b8]' />
                  <span className='text-[#3579b8] font-medium'>{customerName}</span>
                </div>
                <span className='h-3 w-px bg-gray-500'></span>
                <button 
                  onClick={handleLogout}
                  className='text-[#3579b8] hover:text-gray-900 flex items-center gap-1'
                >
                  <LogOut className='w-4 h-4' />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleLoginClick}
                  className='text-[#3579b8] hover:text-gray-900'
                >
                  Login
                </button>
                <span className='h-3 w-px bg-gray-500'></span>
                <button 
                  onClick={handleSignupClick}
                  className='text-[#3579b8] hover:text-gray-900'
                >
                  Signup
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className='bg-white border-b border-gray-200 pb-2 px-4'>
        <div className='max-w-[1440px] mx-auto flex items-center justify-between gap-8'>
          {/* Logo */}
          <div className='flex items-center gap-2 cursor-pointer'>
            <div className='w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center'>
              <img src='/logo.png' className='w-full h-full object-contain' />
            </div>
            <span className='text-2xl font-bold text-[#001e38] tracking-wide'>Jewellery</span>
          </div>

          {/* Search Bar */}
          <div className='flex-1 max-w-xl'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Search for Jewellery'
                className='w-full px-4 py-[6px] pr-12 border-3 border-[#e4e4e4] focus:outline-none'
              />
              <button className='absolute right-0 top-0 h-full border-l-0 border-3 border-[#e4e4e4]  px-6 bg-[#F05D4d] hover:bg-[#ff5533] text-white '>
                <Search className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Right Icons */}
          <div className='flex items-center gap-4'>
            <button className='flex items-center gap-2 text-gray-600 hover:text-[#001e38]'>
              <Clock className='w-6 h-6' />
              <span className='text-xs max-w-[60px] text-left'>Recently Viewed</span>
            </button>

            <span className='h-6 w-px bg-gray-500'></span>

            <button className='flex items-center gap-2 text-gray-600 hover:text-[#001e38]'>
              <Store className='w-6 h-6' />
              <span className='text-xs max-w-[60px] text-left'>Locate Our Store</span>
            </button>

            <span className='h-6 w-px bg-gray-500'></span>

            <button className='text-gray-600 hover:text-[#001e38]'>
              <Heart className='w-6 h-6' />
            </button>

            <span className='h-6 w-px bg-gray-500'></span>

            <button className='relative text-gray-600 hover:text-[#001e38]'>
              <ShoppingCart className='w-6 h-6' />
              <span className='absolute -top-2 -right-2 bg-gray-200 text-gray-700 text-xs w-5 h-5 rounded-full flex items-center justify-center'>
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Sticky */}
      <div className={`bg-[#001e38] text-white transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''}`}>
        <div className='max-w-[1440px] mx-auto'>
          <div className='flex items-center justify-between'>
            {/* Logo in Navbar - Only shows when sticky */}
            <div
              className={`flex items-center gap-2 pl-4 transition-all duration-300 ${
                isSticky ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none w-0 overflow-hidden'
              }`}>
              <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center'>
                <img src='/light_logo.png' className='w-full h-full object-contain' />
              </div>
              <span className='text-lg font-bold text-white tracking-wide'>Jewellery</span>
            </div>

            {/* Menu Items */}
            <div className='flex items-center'>
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onMouseEnter={() => item.hasDropdown && setOpenDropdown(index)}
                  onMouseLeave={() => setOpenDropdown(null)}
                  className='px-4 py-4 text-[14px] font-light leading-[20px] flex items-center gap-1 transition-colors'>
                  {item.label}
                  {item.hasDropdown && <ChevronDown className='w-4 h-4' />}
                </button>
              ))}
            </div>

            {/* Offers */}
            <button className='px-6 py-4 text-sm font-medium hover:bg-[#002e50] flex items-center gap-1'>
              OFFERS
              <ChevronDown className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onSwitchMode={handleSwitchMode}
      />
    </div>
  );
};

export default HomeHeader;
