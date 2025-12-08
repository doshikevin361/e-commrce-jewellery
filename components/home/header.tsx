'use client';

import { Diamond, ShoppingCart, User, Menu, X, ChevronDown, Heart, List, LogOut, Settings } from 'lucide-react';
import SearchBar from './SearchBar/SearchBar';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, useContext, Suspense } from 'react';
import { CategoriesContext } from '@/contexts/CategoriesContext';
import { CategoriesDropdown } from './CategoriesDropdown';
import { LoginModal } from '@/components/auth/login-modal';
import { RegisterModal } from '@/components/auth/register-modal';
import { ForgotPasswordModal } from '@/components/auth/forgot-password-modal';
import { ResetPasswordModal } from '@/components/auth/reset-password-modal';

// Grid2x2CheckIcon component (same as hero section)
const Grid2x2CheckIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}>
    <path d='M12 3v6m6-6h-6M3 12h6m-6 6h6m6 0v-6m0 6h-6' />
    <path d='M8 8h8v8H8z' fill='currentColor' opacity='0.3' />
    <path d='M8 16l4-4 4 4' stroke='currentColor' strokeWidth='2' />
  </svg>
);

// Common jewelry types for submenus
const jewelryTypes = ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Bangle', 'Chain', 'Mangalsutra', 'Pendant'];

// Function to generate menu items dynamically based on available product types
const generateMenuItems = (availableProductTypes: string[]) => {
  const baseMenuItems = [
    { name: 'Home', href: '/' },
  ];

  // Generate menu items for each available product type
  const productTypeMenus = availableProductTypes.map(productType => {
    const typeName = productType === 'Gold' ? 'Gold' : 
                     productType === 'Silver' ? 'Silver' : 
                     productType === 'Platinum' ? 'Platinum' : 
                     productType === 'Diamond' ? 'Diamond' : 
                     productType === 'Gemstone' ? 'Gemstone' : productType;
    
    const submenu = [
      ...jewelryTypes.map(jType => ({
        name: `${typeName} ${jType}s`,
        href: `/products?product_type=${productType}&jewelryType=${jType}`,
      })),
      { name: `All ${typeName} Jewelry`, href: `/products?product_type=${productType}` },
    ];

    return {
      name: typeName,
      href: `/products?product_type=${productType}`,
      submenu,
    };
  });

  return [
    ...baseMenuItems,
    ...productTypeMenus,
    {
      name: 'Collections',
      href: '#collections',
      submenu: [
        { name: 'New Arrivals', href: '/products?featured=true' },
        { name: 'Best Sellers', href: '/products?featured=true' },
        { name: 'Trending Now', href: '/products?trending=true' },
        { name: 'Limited Edition', href: '/products' },
      ],
    },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
  ];
};

export function HomeHeader() {
  // Get categories context if available (only on home page)
  const categoriesContext = useContext(CategoriesContext);
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetToken, setResetToken] = useState<string | undefined>(undefined);
  const [availableProductTypes, setAvailableProductTypes] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState(generateMenuItems([]));
  const [menuLoading, setMenuLoading] = useState(true);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Set initial mobile state after mount to avoid hydration mismatch
    const checkMobile = () => window.innerWidth < 1024;
    setIsMobile(checkMobile());

    // Check if customer is logged in
    const checkAuth = () => {
      const token = localStorage.getItem('customerToken');
      const customer = localStorage.getItem('currentCustomer');
      if (token && customer) {
        setIsLoggedIn(true);
        try {
          const customerData = JSON.parse(customer);
          setCustomerName(customerData.name || customerData.firstName || '');
        } catch (e) {
          console.error('Error parsing customer data:', e);
        }
      } else {
        setIsLoggedIn(false);
        setCustomerName('');
      }
    };

    checkAuth();
    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener('storage', checkAuth);
    // Listen for custom auth events (same tab login/logout)
    window.addEventListener('authChange', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  // Fetch available product types
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        setMenuLoading(true);
        // Show default menu items immediately for better UX
        const defaultTypes = ['Gold', 'Silver', 'Platinum', 'Diamond', 'Gemstone'];
        setAvailableProductTypes(defaultTypes);
        setMenuItems(generateMenuItems(defaultTypes));
        
        const response = await fetch('/api/public/products?limit=1000');
        if (response.ok) {
          const data = await response.json();
          const products = data.products || [];
          // Extract unique product types
          const types = [...new Set(products.map((p: any) => p.product_type).filter(Boolean))];
          
          // Only update if we got actual types, otherwise keep defaults
          if (types.length > 0) {
            setAvailableProductTypes(types);
            setMenuItems(generateMenuItems(types));
          }
        }
      } catch (error) {
        console.error('Error fetching product types:', error);
        // Keep default types on error
      } finally {
        setMenuLoading(false);
      }
    };
    fetchProductTypes();
  }, []);

  // Check for reset password token in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        setResetToken(token);
        setResetPasswordModalOpen(true);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // Handle resize and close menus (only after mount)
  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
      if (window.innerWidth >= 1024) {
        if (categoriesContext) {
          categoriesContext.setMobileCategoriesOpen(false);
        }
        setOpenDropdown(null);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categoriesContext, mounted]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
      // Close categories dropdown when clicking outside
      if (categoriesContext) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-categories-dropdown]') && !target.closest('[data-categories-button]')) {
          categoriesContext.setSidebarOpen(false);
        }
      }
    };
    if (openDropdown || accountDropdownOpen || (categoriesContext && categoriesContext.sidebarOpen)) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown, accountDropdownOpen, categoriesContext]);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('currentCustomer');
    setIsLoggedIn(false);
    setCustomerName('');
    setAccountDropdownOpen(false);
    // Trigger custom event for header update
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
  };

  return (
    <React.Fragment>
      {/* Top bar with logo, search, and account/cart - Fixed Sticky */}
      <div className='fixed top-0 left-0 right-0 bg-white z-50 shadow-sm'>
        <div className='mx-auto mb-2 sm:mb-3 md:mb-4 flex w-full max-w-[1440px] items-center justify-between gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-2.5 md:py-3 pt-3 sm:pt-4 md:pt-6 lg:pt-8'>
          <Link
            href='/'
            className='flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer'>
            <Diamond size={16} className='sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px] text-[#1F3B29]' />
            <span className='text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-[0.08em] sm:tracking-[0.1em] md:tracking-[0.15em] lg:tracking-[0.2em] text-[#1F3B29] whitespace-nowrap'>
              LuxeLoom
            </span>
          </Link>

          <div className='hidden sm:flex mx-2 sm:mx-3 md:mx-4 lg:mx-5 flex-1 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl'>
            <SearchBar />
          </div>

          <div className='flex items-center gap-1.5 sm:gap-2 md:gap-4 lg:gap-6 text-xs sm:text-sm text-[#1F3B29]'>
            <Link
              href='/wishlist'
              className='hidden sm:flex items-center gap-1 font-semibold px-1 sm:px-1.5 md:px-2 transition-all duration-300 hover:scale-110 active:scale-95 relative'
              aria-label='Wishlist'>
              <Heart size={15} className='sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0' />
              <span className='hidden md:inline text-xs sm:text-sm whitespace-nowrap'>Wishlist</span>
            </Link>
            {/* Account Dropdown */}
            <div className='relative' ref={accountDropdownRef}>
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className='flex items-center gap-0.5 sm:gap-1 font-semibold px-1 sm:px-1.5 md:px-2 transition-all duration-300 hover:scale-110 active:scale-95 whitespace-nowrap'
                    aria-label='Account'>
                    <User size={15} className='sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0' />
                    <span className='hidden sm:inline text-xs sm:text-sm whitespace-nowrap'>
                      {customerName || 'My Account'}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-300 ${accountDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {accountDropdownOpen && (
                    <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
                      <Link
                        href='/customer-profile'
                        onClick={() => setAccountDropdownOpen(false)}
                        className='flex items-center gap-2 px-4 py-2.5 text-sm text-[#1F3B29] hover:bg-[#F5EEE5]/60 transition-colors duration-200 font-medium'>
                        <Settings size={16} />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className='w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium'>
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className='flex items-center gap-0.5 sm:gap-1 font-semibold px-1 sm:px-1.5 md:px-2 transition-all duration-300 hover:scale-110 active:scale-95 whitespace-nowrap'
                    aria-label='Login'>
                    <User size={15} className='sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0' />
                    <span className='hidden sm:inline text-xs sm:text-sm whitespace-nowrap'>Login</span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-300 ${accountDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {accountDropdownOpen && (
                    <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          setLoginModalOpen(true);
                        }}
                        className='w-full text-left block px-4 py-2.5 text-sm text-[#1F3B29] hover:bg-[#F5EEE5]/60 transition-colors duration-200 font-medium'>
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          setRegisterModalOpen(true);
                        }}
                        className='w-full text-left block px-4 py-2.5 text-sm text-[#1F3B29] hover:bg-[#F5EEE5]/60 transition-colors duration-200 font-medium'>
                        Create Account
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <Link
              href='/cart'
              className='flex items-center gap-1 sm:gap-1.5 font-semibold px-1 sm:px-1.5 md:px-2 transition-all duration-300 hover:scale-110 active:scale-95 relative'
              aria-label='Cart'>
              <div className='relative flex-shrink-0'>
                <ShoppingCart size={15} className='sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] text-[#1F3B29]' />
                <span className='absolute -top-1 -right-1 bg-[#C8A15B] text-white text-[9px] sm:text-[10px] font-bold rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center shadow-sm leading-none'>
                  0
                </span>
              </div>
              <span className='hidden sm:inline text-xs sm:text-sm whitespace-nowrap text-[#1F3B29]'>Your Cart</span>
            </Link>
          </div>
          {/* Mobile Search Bar */}
          <div className='sm:hidden px-4 sm:px-6 pb-2 sm:pb-3'>
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Main Header with Navigation */}
      <header className='bg-white'>
        {/* Spacer to account for fixed header */}
        <div className='h-[80px] sm:h-[90px] md:h-[100px] lg:h-[110px]' />

        {/* Navigation Menu Bar - Not sticky */}
        <nav className='w-full bg-[#1F3B29] text-white duration-700 relative'>
          <div className='mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 md:px-8  py-2 sm:py-2.5 md:py-3 lg:py-4'>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-95'
              aria-label='Menu'>
              {mobileMenuOpen ? <X size={20} className='text-white' /> : <Menu size={20} className='text-white' />}
            </button>

            {/* Desktop Categories Button */}
            <div className='hidden md:flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-8 min-w-0 flex-1 relative'>
              <button
                data-categories-button
                onClick={() => {
                  if (categoriesContext) {
                    if (isMobile) {
                      categoriesContext.setMobileCategoriesOpen(!categoriesContext.mobileCategoriesOpen);
                    } else {
                      categoriesContext.setSidebarOpen(!categoriesContext.sidebarOpen);
                    }
                  }
                }}
                className='flex w-auto md:w-[200px] lg:w-[270px] items-center gap-1.5 md:gap-2 cursor-pointer transition-all duration-300 hover:bg-white/10 active:scale-95 px-3 md:px-4 py-2 rounded-lg font-medium flex-shrink-0 group'
                aria-label='Categories'>
                <List
                  size={17}
                  className='md:w-[17px] md:h-[17px] lg:w-[18px] lg:h-[18px] flex-shrink-0 transition-transform duration-300 group-hover:rotate-90'
                />
                <span className='text-xs md:text-sm whitespace-nowrap'>Categories</span>
              </button>
              {/* Categories Dropdown */}
              {/* {categoriesContext && !isMobile && (
              <div data-categories-dropdown>
                <CategoriesDropdown
                  isOpen={categoriesContext.sidebarOpen}
                  onClose={() => categoriesContext.setSidebarOpen(false)}
                  position="left"
                />
              </div>
            )} */}

              <ul className='hidden lg:flex items-center gap-1 lg:gap-2 xl:gap-3 text-xs md:text-sm' ref={dropdownRef}>
                {menuLoading ? (
                  // Skeleton loading for desktop menu
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <li key={i} className='relative'>
                        <div className='flex items-center gap-1 px-3 md:px-4 lg:px-5 py-2 rounded-lg animate-pulse'>
                          <div className='h-4 w-16 bg-white/20 rounded'></div>
                          <div className='h-3 w-3 bg-white/20 rounded'></div>
                        </div>
                      </li>
                    ))}
                  </>
                ) : (
                  menuItems.map((item, index) => (
                    <li
                      key={item.name}
                      className='relative'
                      onMouseEnter={() => item.submenu && setOpenDropdown(item.name)}
                      onMouseLeave={() => item.submenu && setOpenDropdown(null)}
                      style={{ animationDelay: `${index * 100}ms` }}>
                    <Link
                      href={item.href}
                      className='
        relative flex items-center gap-1
        px-3 md:px-4 lg:px-5 py-2
        rounded-lg cursor-pointer
        transition-all duration-300
        whitespace-nowrap font-medium
        group
      '>
                      <span className='relative z-10'>{item.name}</span>

                      {item.submenu && (
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-300 ${openDropdown === item.name ? 'rotate-180' : ''}`}
                        />
                      )}

                      {/* White animated underline */}
                      <span
                        className='
        pointer-events-none
        absolute bottom-0 left-4 right-4 
        h-[2px] bg-white 
        scale-x-0 origin-left
        group-hover:scale-x-100 
        transition-transform duration-300
      '
                      />
                    </Link>

                    {/* Dropdown Menu */}
                    {item.submenu && openDropdown === item.name && (
                      <div
                        className='
        absolute top-full left-0 mt-2 w-56
        bg-white rounded-lg shadow-xl
        border border-gray-100 py-2 z-50
        animate-in fade-in slide-in-from-top-2 duration-200
      '>
                        {item.submenu.map((subItem: any) => {
                          const subItemName = typeof subItem === 'string' ? subItem : subItem.name;
                          const subItemHref = typeof subItem === 'string' ? `#` : subItem.href;
                          return (
                            <Link
                              key={subItemName}
                              href={subItemHref}
                              className='
              block px-4 py-2.5 text-sm text-[#1F3B29]
              hover:bg-[#F5EEE5]/60
              transition-colors duration-200
              font-medium
            '
                              onClick={() => setOpenDropdown(null)}>
                              {subItemName}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </li>
                  ))
                )}
              </ul>
            </div>

            {/* Desktop Contact Button - Last */}
            <div className='hidden lg:flex items-center ml-auto'>
              <Link
                href='/contact'
                className='flex items-center text-xs sm:text-sm transition-all duration-300 hover:text-gray-200 px-4 md:px-5 py-2 font-medium whitespace-nowrappl-4 md:pl-5'>
                Contact Us
              </Link>
            </div>

            {/* Mobile/Tablet Categories Button */}
            <button
              onClick={() => {
                if (categoriesContext) {
                  if (isMobile) {
                    categoriesContext.setMobileCategoriesOpen(!categoriesContext.mobileCategoriesOpen);
                  } else {
                    categoriesContext.setSidebarOpen(!categoriesContext.sidebarOpen);
                  }
                }
              }}
              className='lg:hidden flex items-center gap-1.5 cursor-pointer transition-all duration-300 hover:bg-white/10 active:scale-95 px-3 py-2 rounded-lg font-medium flex-shrink-0 group'
              aria-label='Categories'>
              <Grid2x2CheckIcon size={18} className='flex-shrink-0 transition-transform duration-300 group-hover:rotate-90' />
              <span className='text-sm whitespace-nowrap hidden sm:inline'>Categories</span>
            </button>

            {/* Mobile Contact Button */}
            <Link
              href='/contact'
              className='lg:hidden text-xs sm:text-sm transition-all duration-300 hover:text-gray-200 hover:bg-white/10 px-2 sm:px-3 py-1.5 rounded-lg font-medium whitespace-nowrap'>
              Contact
            </Link>
          </div>

          {/* Mobile/Tablet Menu Dropdown */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
            <div className='px-4 sm:px-6 py-3 bg-[#1F3B29] border-t border-white/10'>
              <ul className='flex flex-col gap-1'>
                {menuLoading ? (
                  // Skeleton loading for mobile menu
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <li key={i} className='mb-2'>
                        <div className='block w-full text-left px-4 py-3 rounded-lg animate-pulse'>
                          <div className='h-5 w-24 bg-white/20 rounded'></div>
                        </div>
                      </li>
                    ))}
                  </>
                ) : (
                  menuItems.map(item => (
                    <li key={item.name}>
                    {item.submenu ? (
                      <div>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                          className='flex items-center justify-between w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:translate-x-2 active:bg-white/15'>
                          <span>{item.name}</span>
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${openDropdown === item.name ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {openDropdown === item.name && (
                          <ul className='pl-4 mt-1 space-y-1'>
                            {item.submenu.map((subItem: any) => {
                              const subItemName = typeof subItem === 'string' ? subItem : subItem.name;
                              const subItemHref = typeof subItem === 'string' ? `#` : subItem.href;
                              return (
                                <li key={subItemName}>
                                  <Link
                                    href={subItemHref}
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setOpenDropdown(null);
                                    }}
                                    className='block px-4 py-2 rounded-lg text-sm font-normal transition-all duration-300 hover:bg-white/10 hover:translate-x-2 active:bg-white/15 text-white/90'>
                                    {subItemName}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className='block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:translate-x-2 active:bg-white/15'>
                        {item.name}
                      </Link>
                    )}
                  </li>
                  ))
                )}
                {/* Contact Us - Always Last */}
                <li className='mt-2 pt-2 border-t border-white/20'>
                  <Link
                    href='/contact'
                    onClick={() => setMobileMenuOpen(false)}
                    className='block w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-white/10 hover:translate-x-2 active:bg-white/15 bg-white/5'>
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Auth Modals */}
      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onSwitchToRegister={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
        onSwitchToForgotPassword={() => {
          setLoginModalOpen(false);
          setForgotPasswordModalOpen(true);
        }}
      />
      <RegisterModal
        open={registerModalOpen}
        onOpenChange={setRegisterModalOpen}
        onSwitchToLogin={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
      <ForgotPasswordModal
        open={forgotPasswordModalOpen}
        onOpenChange={setForgotPasswordModalOpen}
        onSwitchToLogin={() => {
          setForgotPasswordModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
      <ResetPasswordModal
        open={resetPasswordModalOpen}
        onOpenChange={setResetPasswordModalOpen}
        token={resetToken}
        onSwitchToLogin={() => {
          setResetPasswordModalOpen(false);
          setLoginModalOpen(true);
        }}
        onSwitchToForgotPassword={() => {
          setResetPasswordModalOpen(false);
          setForgotPasswordModalOpen(true);
        }}
      />
    </React.Fragment>
  );
}
