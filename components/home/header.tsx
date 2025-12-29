'use client';

import {
  Diamond,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Heart,
  LogOut,
  Settings,
  ShoppingBag,
  Store,
  Circle,
  Gift,
  MoreHorizontal,
  Star,
  Zap,
  Gem,
  Coffee,
  Loader2,
} from 'lucide-react';
import SearchBar from './SearchBar/SearchBar';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { AuthModal } from '@/components/auth/auth-modal';
import { ForgotPasswordModal } from '@/components/auth/forgot-password-modal';
import { ResetPasswordModal } from '@/components/auth/reset-password-modal';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

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

import { useMenuItems } from './navigation-menu';

function HomeHeaderContent() {
  const router = useRouter();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetToken, setResetToken] = useState<string | undefined>(undefined);
  const { menuItems, menuLoading } = useMenuItems();
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<
    Array<{ _id: string; name: string; slug: string; children?: Array<{ _id: string; name: string; slug: string }> }>
  >([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState<string | null>(null);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<Set<string>>(new Set());
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Record<string, any>>({});
  const [hoveredSubcategory, setHoveredSubcategory] = useState<{ category: string; subcategory: string } | null>(null);
  const [styleImages, setStyleImages] = useState<Record<string, string>>({});
  const [materialImages, setMaterialImages] = useState<Record<string, string>>({});
  const [occasionImages, setOccasionImages] = useState<Record<string, string>>({});
  const [fetchingProducts, setFetchingProducts] = useState<Set<string>>(new Set());
  const [megaMenuProducts, setMegaMenuProducts] = useState<Record<string, any>>({});
  const [logo, setLogo] = useState<{ imageUrl: string; altText: string; width: number; height: number } | null>(null);

  const PRODUCT_TYPE_ICONS: Record<string, JSX.Element> = {
    Diamonds: <Diamond size={16} className='text-blue-500' strokeWidth={1.5} />,
    Gold: <Star size={16} className='text-yellow-400' strokeWidth={1.5} />,
    Silver: <Circle size={16} className='text-gray-400' strokeWidth={1.5} />,
    Platinum: <Zap size={16} className='text-gray-300' strokeWidth={1.5} />,
    Gemstone: <Gem size={16} className='text-purple-500' strokeWidth={1.5} />,
    Imitation: <Coffee size={16} className='text-pink-400' strokeWidth={1.5} />,
  };

  // Helper function to get icon for category
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    // Use Circle with decorative styling for earrings
    if (name.includes('earring'))
      return <Circle size={16} className='text-gray-700' strokeWidth={2} fill='currentColor' fillOpacity={0.2} />;
    if (name.includes('ring')) return <Ring size={16} className='text-gray-700' strokeWidth={1.5} />;
    if (name.includes('gift') || name.includes('gifting')) return <Gift size={16} className='text-gray-700' strokeWidth={1.5} />;
    if (name.includes('diamond')) return <Diamond size={16} className='text-gray-700' strokeWidth={1.5} />;
    if (name.includes('gold')) return <Star size={16} className='text-gray-700' strokeWidth={1.5} />;
    return <Diamond size={16} className='text-gray-700' strokeWidth={1.5} />;
  };

  // Helper function to get icon for menu item
  const getMenuItemIcon = (itemName: string) => {
    const name = itemName.toLowerCase();
    if (name.includes('all jewellery') || name.includes('all')) return <Grid2x2CheckIcon size={16} className='text-gray-700' />;
    if (name.includes('collection')) return <Grid2x2CheckIcon size={16} className='text-gray-700' />;
    if (name.includes('wedding')) return <Ring size={16} className='text-gray-700' strokeWidth={1.5} />;
    if (name.includes('gift') || name.includes('gifting')) return <Gift size={16} className='text-gray-700' strokeWidth={1.5} />;
    return null;
  };
  // Your existing product types array
  const PRODUCT_TYPES = ['Gold', 'Silver', 'Diamonds', 'Platinum', 'Gemstone', 'Imitation'];

  const GENDERS = ['Man', 'Women', 'Unisex'];

  // Shop By Style options (these would be subcategories or design types)
  const SHOP_BY_STYLE = [
    'Engagement',
    'Solitaire',
    'Casual',
    'Classic',
    'Navratna',
    'Mangalsutra Ring',
    'Couple Bands',
    'Eternity',
    'Three Stone',
  ];

  // Price ranges
  const PRICE_RANGES = [
    { label: 'UNDER ₹10K', value: '0-10000' },
    { label: '₹10K - ₹20K', value: '10000-20000' },
    { label: '₹20K - ₹30K', value: '20000-30000' },
    { label: '₹30K - ₹50K', value: '30000-50000' },
    { label: '₹50K - ₹75K', value: '50000-75000' },
    { label: 'ABOVE ₹75K', value: '75000-999999999' },
  ];

  // Occasions - now fetched dynamically from category data

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
    // Listen for open login modal event
    const handleOpenLoginModal = () => {
      setAuthMode('login');
      setAuthModalOpen(true);
    };
    window.addEventListener('openLoginModal', handleOpenLoginModal);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
    };
  }, []);

  // Fetch categories for navbar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/public/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch active logo
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch('/api/public/logo');
        if (response.ok) {
          const data = await response.json();
          if (data.logo) {
            setLogo(data.logo);
          }
        }
      } catch (error) {
        console.error('Failed to fetch logo:', error);
      }
    };

    fetchLogo();
  }, []);

  // Fetch featured product for a category/subcategory/productType/gender combination
  const fetchFeaturedProduct = useCallback(
    async (category: string, subcategory?: string, productType?: string, gender?: string) => {
      const key = `${category}-${subcategory || 'all'}-${productType || 'all'}-${gender || 'all'}`;

      // Already fetched or currently fetching
      if (featuredProducts[key] || fetchingProducts.has(key)) return;

      // Mark as fetching
      setFetchingProducts(prev => new Set(prev).add(key));

      try {
        const params = new URLSearchParams({ category });
        if (subcategory) params.append('subcategory', subcategory);
        if (productType) params.append('productType', productType);
        if (gender) params.append('gender', gender);

        const response = await fetch(`/api/public/products/featured?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setFeaturedProducts(prev => ({
            ...prev,
            [key]: data.product,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch featured product:', error);
      } finally {
        // Remove from fetching set
        setFetchingProducts(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [featuredProducts, fetchingProducts]
  );

  // Fetch image for style/subcategory - only when needed
  const fetchStyleImage = async (category: string, styleName: string) => {
    const key = `${category}-${styleName}`;
    if (styleImages[key]) return; // Already fetched

    try {
      const params = new URLSearchParams({ category, subcategory: styleName, limit: '1' });
      const response = await fetch(`/api/public/products/menu-images?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.products && data.products.length > 0 && data.products[0].mainImage) {
          setStyleImages(prev => ({
            ...prev,
            [key]: data.products[0].mainImage,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch style image:', error);
    }
  };

  // Fetch image for material/product type - only when needed
  const fetchMaterialImage = async (category: string, material: string) => {
    const key = `${category}-${material}`;
    if (materialImages[key]) return; // Already fetched

    try {
      const params = new URLSearchParams({ category, productType: material, limit: '1' });
      const response = await fetch(`/api/public/products/menu-images?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.products && data.products.length > 0 && data.products[0].mainImage) {
          setMaterialImages(prev => ({
            ...prev,
            [key]: data.products[0].mainImage,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch material image:', error);
    }
  };

  // Fetch image for occasion - only when needed
  const fetchOccasionImage = async (category: string, occasion: string) => {
    const key = `${category}-${occasion}`;
    if (occasionImages[key]) return; // Already fetched

    try {
      // Occasions might be in tags or we can search by category
      const params = new URLSearchParams({ category, limit: '1' });
      const response = await fetch(`/api/public/products/menu-images?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.products && data.products.length > 0 && data.products[0].mainImage) {
          setOccasionImages(prev => ({
            ...prev,
            [key]: data.products[0].mainImage,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch occasion image:', error);
    }
  };

  // Fetch megaMenu product
  const fetchMegaMenuProduct = useCallback(
    async (productId: string) => {
      if (!productId || megaMenuProducts[productId]) return;

      try {
        // Use the megamenu-specific endpoint that doesn't check status
        const response = await fetch(`/api/public/products/megamenu/${productId}`);
        if (response.ok) {
          const product = await response.json();
          setMegaMenuProducts(prev => ({
            ...prev,
            [productId]: product,
          }));
        } else {
          console.error('Failed to fetch megaMenu product:', response.status);
        }
      } catch (error) {
        console.error('Error fetching megaMenu product:', error);
      }
    },
    [megaMenuProducts]
  );

  // Get active category from URL
  const activeCategory = searchParams.get('category');

  // Fetch default featured product and megaMenu product when dropdown opens
  useEffect(() => {
    if (!openCategoryDropdown) return;

    const category = categories.find(cat => cat._id === openCategoryDropdown);
    if (!category) return;

    const productKey =
      category.children && category.children.length > 0
        ? `${category.name}-${category.children[0]?.name || 'all'}-${PRODUCT_TYPES[0]}-${GENDERS[0]}`
        : `${category.name}-all-${PRODUCT_TYPES[0]}-${GENDERS[0]}`;

    // Only fetch if not already loaded
    if (!featuredProducts[productKey] && !fetchingProducts.has(productKey)) {
      if (category.children && category.children.length > 0) {
        fetchFeaturedProduct(category.name, category.children[0]?.name, PRODUCT_TYPES[0], GENDERS[0]);
      } else {
        fetchFeaturedProduct(category.name, undefined, PRODUCT_TYPES[0], GENDERS[0]);
      }
    }

    // Fetch megaMenu product if set
    const megaMenuProductId = (category as any).megaMenuProductId;
    if (megaMenuProductId && !megaMenuProducts[megaMenuProductId]) {
      fetchMegaMenuProduct(megaMenuProductId);
    }
  }, [openCategoryDropdown, categories, fetchMegaMenuProduct, megaMenuProducts]);

  // Check for reset password token in URL (only on home page, not on verify-email page)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      // Only check for reset password token if we're NOT on the verify-email page
      if (pathname !== '/verify-email') {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
          setResetToken(token);
          setResetPasswordModalOpen(true);
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, []);

  // Handle resize and close menus (only after mount)
  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    if (accountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accountDropdownOpen]);

  // Toggle mobile category expansion
  const toggleMobileCategory = (categoryId: string) => {
    setExpandedMobileCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('currentCustomer');
    setIsLoggedIn(false);
    setCustomerName('');
    setAccountDropdownOpen(false);
    // Trigger custom event for header update
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
    toast.success('Logout successful!');
  };

  return (
    <React.Fragment>
      {/* Top bar with logo, search, and account/cart - Fixed Sticky */}
      <div className='fixed top-0 left-0 right-0 bg-white z-50'>
        <div className='mx-auto flex w-full max-w-[1440px] items-center justify-between gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-3.5 md:py-4'>
          {/* Mobile Menu Button - In top bar for better visibility, hidden on desktop (1024px+) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='flex lg:hidden items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-all duration-300 hover:bg-[#1F3B29]/10 active:scale-95 bg-[#1F3B29] text-white shadow-lg flex-shrink-0'
            aria-label='Menu'
            type='button'>
            {mobileMenuOpen ? (
              <X size={20} className='sm:w-6 sm:h-6 text-white flex-shrink-0 font-bold stroke-[2.5]' />
            ) : (
              <Menu size={20} className='sm:w-6 sm:h-6 text-white flex-shrink-0 font-bold stroke-[2.5]' />
            )}
          </button>

          {/* Logo */}
          <Link
            href='/'
            className='flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0 transition-all duration-300 hover:opacity-80 active:scale-95 cursor-pointer'>
            {logo ? (
              <img
                src={logo.imageUrl}
                alt={logo.altText}
                className='object-contain'
                style={{
                  width: `${logo.width}px`,
                  height: `${logo.height}px`,
                  maxWidth: '180px',
                  maxHeight: '50px',
                }}
              />
            ) : (
              <>
                <Diamond size={18} className='sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#1F3B29]' />
                <span className='text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-wide text-[#1F3B29] whitespace-nowrap'>
                  Jewellery
                </span>
              </>
            )}
          </Link>

          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className='hidden sm:flex mx-2 sm:mx-3 md:mx-4 lg:mx-5 flex-1 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl'>
            <SearchBar />
          </div>

          {/* Right Side Icons - Tanishq Style */}
          <div className='flex items-center gap-2 sm:gap-3 md:gap-4 text-[#1F3B29]'>
            {/* Diamond Icon */}
            <Link
              href='/jewellery?productType=Diamonds'
              className='hidden md:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:bg-gray-100 active:scale-95'
              aria-label='Diamonds'>
              <Diamond size={20} className='sm:w-5 sm:h-5 text-[#1F3B29]' />
            </Link>

            {/* Store Icon */}
            <Link
              href='/contact'
              className='hidden md:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:bg-gray-100 active:scale-95'
              aria-label='Stores'>
              <Store size={20} className='sm:w-5 sm:h-5 text-[#1F3B29]' />
            </Link>

            {/* Wishlist */}
            <Link
              href='/wishlist'
              className='flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:bg-gray-100 active:scale-95 relative'
              aria-label='Wishlist'>
              <div className='relative flex-shrink-0'>
                <Heart size={20} className='sm:w-5 sm:h-5 text-[#1F3B29]' />
                {wishlistCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-sm leading-none'>
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </div>
            </Link>
            {/* Account Dropdown */}
            <div className='relative' ref={accountDropdownRef}>
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className='flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:bg-gray-100 active:scale-95'
                    aria-label='Account'>
                    <User size={20} className='sm:w-5 sm:h-5 text-[#1F3B29] flex-shrink-0' />
                  </button>
                  {accountDropdownOpen && (
                    <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
                      <div className='px-4 py-2 border-b border-gray-100'>
                        <p className='text-sm font-semibold text-[#1F3B29] truncate'>{customerName || 'My Account'}</p>
                      </div>
                      <Link
                        href='/customer-profile'
                        onClick={() => setAccountDropdownOpen(false)}
                        className='flex items-center gap-2 px-4 py-2.5 text-sm text-[#1F3B29] hover:bg-gray-50 transition-colors duration-200 font-medium'>
                        <Settings size={16} />
                        My Profile
                      </Link>
                      <Link
                        href='/my-orders'
                        onClick={() => setAccountDropdownOpen(false)}
                        className='flex items-center gap-2 px-4 py-2.5 text-sm text-[#1F3B29] hover:bg-gray-50 transition-colors duration-200 font-medium'>
                        <ShoppingBag size={16} />
                        My Orders
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
                    className='flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:bg-gray-100 active:scale-95'
                    aria-label='Login'>
                    <User size={20} className='sm:w-5 sm:h-5 text-[#1F3B29] flex-shrink-0' />
                  </button>
                  {accountDropdownOpen && (
                    <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          setAuthMode('login');
                          setAuthModalOpen(true);
                        }}
                        className='w-full text-left block px-4 py-2.5 text-sm text-[#1F3B29] hover:bg-gray-50 transition-colors duration-200 font-medium'>
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          setAuthMode('register');
                          setAuthModalOpen(true);
                        }}
                        className='w-full text-left block px-4 py-2.5 text-sm text-[#1F3B29] hover:bg-gray-50 transition-colors duration-200 font-medium'>
                        Create Account
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            {/* Cart */}
            <Link
              href='/cart'
              className='flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:bg-gray-100 active:scale-95 relative'
              aria-label='Cart'>
              <div className='relative flex-shrink-0'>
                <ShoppingCart size={20} className='sm:w-5 sm:h-5 text-[#1F3B29]' />
                {cartCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-sm leading-none'>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
        {/* Mobile Search Bar - Below main bar */}
        <div className='sm:hidden border-t border-gray-100 px-4 py-2.5'>
          <SearchBar />
        </div>

        {/* Mobile/Tablet Menu Dropdown - Positioned from top bar, hidden on desktop (1024px+) */}
        {mobileMenuOpen && (
          <div className='lg:hidden fixed top-[70px] sm:top-[75px] md:top-[80px] left-0 right-0 w-full bg-[#1F3B29] border-t-2 border-white/20 shadow-2xl z-50 max-h-[75vh] overflow-y-auto'>
            <div className='px-4 sm:px-6 md:px-8 py-4 sm:py-5'>
              <ul className='flex flex-col gap-1 sm:gap-2'>
                {menuLoading || categoriesLoading ? (
                  // Skeleton loading for mobile menu
                  <>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <li key={i} className='mb-1 sm:mb-2'>
                        <div className='block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg animate-pulse'>
                          <div className='h-4 sm:h-5 w-24 sm:w-32 bg-white/20 rounded'></div>
                        </div>
                      </li>
                    ))}
                  </>
                ) : (
                  <>
                    {menuItems.map(item => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className='block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 hover:bg-white/10 hover:translate-x-2 active:bg-white/15'>
                          {item.name}
                        </Link>
                      </li>
                    ))}
                    {/* Categories in mobile menu */}
                    {categories.length > 0 && (
                      <li className='pt-2 sm:pt-3 border-t border-white/10 mt-2 sm:mt-3'>
                        <p className='px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white/70 uppercase tracking-wider'>
                          Categories
                        </p>
                      </li>
                    )}
                    {categories.map(category => {
                      const isActive = activeCategory === category.name;
                      const hasSubcategories = category.children && category.children.length > 0;
                      const isExpanded = expandedMobileCategories.has(category._id);
                      return (
                        <li key={category._id}>
                          <div className='flex items-center'>
                            <Link
                              href={`/jewellery?category=${encodeURIComponent(category.name)}`}
                              onClick={() => {
                                if (!hasSubcategories) {
                                  setMobileMenuOpen(false);
                                }
                              }}
                              className={cn(
                                'flex-1 block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 hover:bg-white/15 hover:translate-x-2 active:bg-white/20',
                                isActive && 'bg-white/25 font-semibold shadow-sm',
                                hasSubcategories && isExpanded && 'bg-white/15'
                              )}>
                              {category.name}
                            </Link>
                            {hasSubcategories && (
                              <button
                                onClick={() => toggleMobileCategory(category._id)}
                                className='px-2 sm:px-3 py-2.5 sm:py-3 flex items-center justify-center transition-all duration-300 hover:bg-white/15 active:bg-white/20 rounded-lg'
                                aria-label='Toggle subcategories'>
                                {isExpanded ? (
                                  <ChevronDown size={18} className='sm:w-5 sm:h-5 text-white transition-transform duration-300' />
                                ) : (
                                  <ChevronRight size={18} className='sm:w-5 sm:h-5 text-white/80 transition-transform duration-300' />
                                )}
                              </button>
                            )}
                          </div>
                          {hasSubcategories && isExpanded && (
                            <ul className='ml-3 sm:ml-4 mt-2 mb-2 space-y-1.5 border-l-2 border-[#C8A15B]/40 pl-3 sm:pl-4 animate-in slide-in-from-top-2 duration-300'>
                              {category.children?.map(subcategory => {
                                const isSubActive = activeCategory === subcategory.name;
                                return (
                                  <li key={subcategory._id} className='animate-in fade-in slide-in-from-left-2 duration-300'>
                                    <Link
                                      href={`/jewellery?category=${encodeURIComponent(subcategory.name)}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className={cn(
                                        'group/sub-mobile flex items-center gap-2 w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 hover:bg-white/15 hover:translate-x-2 active:bg-white/20 relative',
                                        isSubActive && 'bg-white/25 font-semibold shadow-sm'
                                      )}>
                                      <span className='w-1.5 h-1.5 rounded-full bg-[#C8A15B] opacity-60 group-hover/sub-mobile:opacity-100 transition-opacity duration-200 flex-shrink-0'></span>
                                      <span className='flex-1'>{subcategory.name}</span>
                                      <ChevronRight
                                        size={14}
                                        className='text-white/60 group-hover/sub-mobile:text-white opacity-0 group-hover/sub-mobile:opacity-100 -translate-x-1 group-hover/sub-mobile:translate-x-0 transition-all duration-200'
                                      />
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Main Header with Navigation */}
      <header className='bg-white'>
        {/* Spacer to account for fixed header */}
        <div className='h-[70px] sm:h-[75px] md:h-[80px] lg:h-[85px]' />

        {/* Navigation Menu Bar - Hidden on mobile/tablet, shown on desktop */}
        <nav className='hidden lg:block w-full bg-white border-b border-gray-200 text-gray-700 duration-700 relative z-40 min-h-[56px]'>
          <div className='mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-3.5 md:py-4 lg:py-4'>
            {/* Desktop Navigation */}
            <ul className='flex items-center gap-1 lg:gap-2 xl:gap-3 text-xs md:text-sm flex-wrap'>
              {menuLoading || categoriesLoading ? (
                // Skeleton loading for desktop menu
                <>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <li key={i} className='relative'>
                      <div className='flex items-center gap-1 px-3 md:px-4 lg:px-5 py-2 rounded-lg animate-pulse'>
                        <div className='h-4 w-16 bg-white/20 rounded'></div>
                      </div>
                    </li>
                  ))}
                </>
              ) : (
                <>
                  {categories.map((category, index) => {
                    const isActive = activeCategory === category.name;
                    const hasSubcategories = category.children && category.children.length > 0;
                    const isDropdownOpen = openCategoryDropdown === category._id;
                    return (
                      <li
                        key={category._id}
                        className='relative'
                        style={{ animationDelay: `${(menuItems.length + index) * 50}ms` }}
                        onMouseEnter={() => {
                          // Clear any pending close timeout
                          if (closeTimeoutRef.current) {
                            clearTimeout(closeTimeoutRef.current);
                            closeTimeoutRef.current = null;
                          }
                          setOpenCategoryDropdown(category._id);
                        }}
                        onMouseLeave={() => {
                          // Add a small delay before closing to allow mouse to move to mega menu
                          closeTimeoutRef.current = setTimeout(() => {
                            setOpenCategoryDropdown(null);
                            closeTimeoutRef.current = null;
                          }, 150);
                        }}>
                        <Link
                          href={`/jewellery?category=${encodeURIComponent(category.name)}`}
                          className={cn(
                            'relative flex items-center gap-1.5 px-3 md:px-4 lg:px-5 py-2 rounded-lg cursor-pointer transition-all duration-300 whitespace-nowrap font-medium group',
                            isActive && 'bg-gray-100 shadow-sm',
                            isDropdownOpen && 'bg-gray-50'
                          )}>
                          {getCategoryIcon(category.name)}
                          <span className='relative z-10 text-gray-700'>{category.name}</span>
                          {hasSubcategories && (
                            <ChevronDown
                              size={14}
                              className={cn(
                                'transition-all duration-300 text-gray-500 group-hover:text-gray-700',
                                isDropdownOpen && 'rotate-180 text-gray-700'
                              )}
                            />
                          )}

                          {/* Animated underline - always visible if active */}
                          <span
                            className={cn(
                              'pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] bg-[#1F3B29] transition-transform duration-300',
                              isActive ? 'scale-x-100' : 'scale-x-0 origin-left group-hover:scale-x-100'
                            )}
                          />
                        </Link>
                      </li>
                    );
                  })}
                  {menuItems.map((item, index) => {
                    const itemIcon = getMenuItemIcon(item.name);
                    return (
                      <li key={item.name} className='relative' style={{ animationDelay: `${index * 50}ms` }}>
                        <Link
                          href={item.href}
                          className='relative flex items-center gap-1.5 px-3 md:px-4 lg:px-5 py-2 rounded-lg cursor-pointer transition-all duration-300 whitespace-nowrap font-medium group'>
                          {itemIcon}
                          <span className='relative z-10 text-gray-700'>{item.name}</span>

                          {/* Animated underline */}
                          <span className='pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] bg-[#1F3B29] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300' />
                        </Link>
                      </li>
                    );
                  })}
                  {/* More menu item */}
                  <li className='relative'>
                    <Link
                      href='/jewellery'
                      className='relative flex items-center gap-1.5 px-3 md:px-4 lg:px-5 py-2 rounded-lg cursor-pointer transition-all duration-300 whitespace-nowrap font-medium group'>
                      <MoreHorizontal size={16} className='text-gray-700' strokeWidth={1.5} />
                      <span className='relative z-10 text-gray-700'>More</span>
                      <span className='pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] bg-[#1F3B29] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300' />
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Full Width Mega Menu - Positioned relative to nav container */}
          {categories.map(category => {
            const isDropdownOpen = openCategoryDropdown === category._id;
            if (!isDropdownOpen) return null;

            return (
              <div
                key={category._id}
                className='absolute top-full left-0 right-0 w-full bg-white shadow-2xl border-t border-gray-200/60 z-50 animate-in fade-in slide-in-from-top-3 duration-300'
                style={{ marginTop: '-1px' }}
                onMouseEnter={() => {
                  // Clear any pending close timeout
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current);
                    closeTimeoutRef.current = null;
                  }
                  setOpenCategoryDropdown(category._id);
                }}
                onMouseLeave={() => {
                  // Add a small delay before closing
                  closeTimeoutRef.current = setTimeout(() => {
                    setOpenCategoryDropdown(null);
                    closeTimeoutRef.current = null;
                  }, 150);
                }}>
                <div className='mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 lg:py-8'>
                  <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8'>
                    {/* Column 1: SHOP BY STYLE - Only show if subcategories exist */}
                    {category.children && category.children.length > 0 && (
                      <div className='lg:col-span-3 xl:col-span-4'>
                        <p className='text-[11px] font-semibold text-[#1F3B29] mb-4 uppercase tracking-wider'>SHOP BY STYLE</p>
                        <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-2.5'>
                          {category.children.slice(0, 12).map((item, idx) => {
                            const styleName = item.name;
                            const styleId = item._id;
                            const imageKey = `${category.name}-${styleName}`;
                            // First check if subcategory has its own image, then check fetched product images
                            const subcategoryImage = (item as any).image;
                            const fetchedImage = styleImages[imageKey];
                            const hasImage = subcategoryImage || fetchedImage;

                            return (
                              <Link
                                key={styleId || idx}
                                href={`/jewellery?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(
                                  styleName
                                )}`}
                                onMouseEnter={() => {
                                  setHoveredSubcategory({ category: category.name, subcategory: styleName });
                                  fetchFeaturedProduct(category.name, styleName, PRODUCT_TYPES[0], GENDERS[0]);
                                  // Only fetch from products if subcategory doesn't have its own image
                                  if (!subcategoryImage && !fetchedImage) {
                                    fetchStyleImage(category.name, styleName);
                                  }
                                }}
                                className='group/style flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-[#F5EEE5]/50 transition-all duration-200'>
                                <div className='relative w-16 h-16 sm:w-20 sm:h-20 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-lg overflow-hidden bg-[#F5EEE5] border border-[#C8A15B]/20'>
                                  {hasImage ? (
                                    <img src={hasImage} alt={styleName} className='w-full h-full object-cover' />
                                  ) : (
                                    <div className='w-full h-full flex items-center justify-center'>
                                      <Diamond size={20} className='text-[#C8A15B]/60' strokeWidth={1.5} />
                                    </div>
                                  )}
                                </div>
                                <span className='text-[11px] sm:text-[12px] lg:text-[10px] xl:text-[11px] font-medium text-[#1F3B29] text-center leading-tight group-hover/style:text-[#C8A15B] transition-colors duration-200'>
                                  {styleName}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Column 2: SHOP BY MATERIAL */}
                    <div className='lg:col-span-2'>
                      <p className='text-[11px] font-semibold text-[#1F3B29] mb-4 uppercase tracking-wider'>SHOP BY MATERIAL</p>
                      <div className='flex flex-col gap-3'>
                        {PRODUCT_TYPES.map(material => {
                          const imageKey = `${category.name}-${material}`;
                          const hasImage = materialImages[imageKey]; // only dynamic images

                          return (
                            <Link
                              key={material}
                              href={`/jewellery?category=${encodeURIComponent(category.name)}&productType=${encodeURIComponent(material)}`}
                              onMouseEnter={() => {
                                if (!materialImages[imageKey]) {
                                  fetchMaterialImage(category.name, material); // fetch only if not loaded
                                }
                              }}
                              className='group/material flex items-center gap-3 p-2 rounded-lg hover:bg-[#F5EEE5]/50 transition-all duration-200'>
                              <div
                                className={cn(
                                  'w-8 h-8 sm:w-9 sm:h-9 lg:w-7 lg:h-7 rounded-full flex items-center justify-center flex-shrink-0',
                                  material === 'Diamonds' && 'bg-blue-50',
                                  material === 'Platinum' && 'bg-gray-100',
                                  material === 'Gemstone' && 'bg-purple-50',
                                  material === 'Gold' && 'bg-yellow-50',
                                  material === 'Silver' && 'bg-gray-50',
                                  material === 'Imitation' && 'bg-pink-50',
                                  !['Diamonds', 'Platinum', 'Gemstone', 'Gold', 'Silver', 'Imitation'].includes(material) && 'bg-gray-50'
                                )}>
                                {hasImage ? (
                                  <img
                                    src={hasImage}
                                    alt={material}
                                    className='w-5 h-5 sm:w-6 sm:h-6 lg:w-16 lg:h-10 rounded-full object-cover'
                                  />
                                ) : (
                                  PRODUCT_TYPE_ICONS[material] || <div className='w-4 h-4 rounded-full bg-gray-200' />
                                )}
                              </div>

                              <span className='text-[12px] sm:text-[13px] lg:text-[11px] font-medium text-[#1F3B29] group-hover/material:text-[#C8A15B] transition-colors duration-200'>
                                {material}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Column 3: SHOP FOR */}
                    <div className='lg:col-span-2'>
                      <p className='text-[11px] font-semibold text-[#1F3B29] mb-4 uppercase tracking-wider'>SHOP FOR</p>
                      <div className='flex flex-col gap-2 mb-4'>
                        {PRICE_RANGES.map(range => (
                          <Link
                            key={range.value}
                            href={`/jewellery?category=${encodeURIComponent(category.name)}&minPrice=${
                              range.value.split('-')[0]
                            }&maxPrice=${range.value.split('-')[1]}`}
                            className='text-[12px] sm:text-[13px] lg:text-[11px] font-medium text-[#1F3B29] hover:text-[#C8A15B] transition-colors duration-200'>
                            {range.label}
                          </Link>
                        ))}
                      </div>
                      <div className='flex flex-col gap-2 pt-3 border-t border-gray-100'>
                        {GENDERS.map(gender => (
                          <Link
                            key={gender}
                            href={`/jewellery?category=${encodeURIComponent(category.name)}&gender=${encodeURIComponent(gender)}`}
                            className='text-[12px] sm:text-[13px] lg:text-[11px] font-medium text-[#1F3B29] hover:text-[#C8A15B] transition-colors duration-200'>
                            {gender.toUpperCase()}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Column 4: SHOP BY OCCASION */}
                    <div className='lg:col-span-2'>
                      <p className='text-[11px] font-semibold text-[#1F3B29] mb-4 uppercase tracking-wider'>SHOP BY OCCASION</p>
                      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3'>
                        {((category as any).occasions &&
                        Array.isArray((category as any).occasions) &&
                        (category as any).occasions.length > 0
                          ? (category as any).occasions
                          : []
                        ).map((occasion: any, index: number) => {
                          const occasionName = occasion.name;
                          const occasionProductId = occasion.productId;
                          const occasionImage = occasion.image || (occasionProductId && occasionImages[`${category.name}-${occasionName}`]);
                          const hasImage = occasionImage;

                          return (
                            <Link
                              key={`${occasionName}-${index}`}
                              href={
                                occasionProductId
                                  ? `/products/${occasionProductId}`
                                  : `/jewellery?category=${encodeURIComponent(category.name)}&occasion=${encodeURIComponent(occasionName)}`
                              }
                              onMouseEnter={() => {
                                setHoveredSubcategory({ category: category.name, subcategory: occasionName });
                                fetchFeaturedProduct(category.name, occasionName, PRODUCT_TYPES[0], GENDERS[0]);
                                // Only fetch image on hover if not already loaded and no product image
                                if (!hasImage && !occasionProductId) {
                                  fetchOccasionImage(category.name, occasionName);
                                }
                              }}
                              className='group/occasion flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-[#F5EEE5]/50 transition-all duration-200'>
                              <div className='relative w-14 h-14 sm:w-16 sm:h-16 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-lg overflow-hidden bg-[#F5EEE5] border border-[#C8A15B]/20'>
                                {hasImage ? (
                                  <img src={hasImage} alt={occasionName} className='w-full h-full object-cover' />
                                ) : (
                                  <div className='w-full h-full flex items-center justify-center'>
                                    <Diamond size={18} className='text-[#C8A15B]/60' strokeWidth={1.5} />
                                  </div>
                                )}
                              </div>
                              <span className='text-[11px] sm:text-[12px] lg:text-[10px] xl:text-[11px] font-medium text-[#1F3B29] text-center leading-tight group-hover/occasion:text-[#C8A15B] transition-colors duration-200'>
                                {occasionName}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Column 5: Featured Product (Rightmost) */}
                    <div className='lg:col-span-3 xl:col-span-2'>
                      {(() => {
                        // Check if megaMenuProductId is set and product is loaded
                        const megaMenuProductId = (category as any).megaMenuProductId;
                        const megaMenuProduct = megaMenuProductId ? megaMenuProducts[megaMenuProductId] : null;

                        if (megaMenuProduct) {
                          return (
                            <div>
                              <Link
                                href={`/products/${megaMenuProduct.urlSlug || megaMenuProduct._id}`}
                                className='block group/product mb-3'>
                                <div className='relative w-full aspect-square rounded-lg overflow-hidden bg-[#1F3B29] mb-3'>
                                  {megaMenuProduct.mainImage ? (
                                    <img
                                      src={megaMenuProduct.mainImage}
                                      alt={megaMenuProduct.name || 'Featured Product'}
                                      className='w-full h-full object-cover group-hover/product:scale-110 transition-transform duration-300'
                                      onError={e => {
                                        console.error('Failed to load product image:', megaMenuProduct.mainImage);
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className='w-full h-full flex items-center justify-center'>
                                      <Diamond size={50} className='text-white/20' />
                                    </div>
                                  )}
                                </div>
                                <p className='text-sm sm:text-base lg:text-xs xl:text-sm font-medium text-[#1F3B29] mb-3 text-center leading-snug'>
                                  {megaMenuProduct.shortDescription || megaMenuProduct.name || 'Featured Product'}
                                </p>
                              </Link>
                            </div>
                          );
                        }

                        // Fallback to original featured product logic
                        const activeSubcategory =
                          hoveredSubcategory?.category === category.name
                            ? hoveredSubcategory.subcategory
                            : category.children && category.children.length > 0
                            ? category.children[0]?.name
                            : PRODUCT_TYPES[0];
                        const firstProductType = category.children && category.children.length > 0 ? PRODUCT_TYPES[0] : activeSubcategory;
                        const firstGender = GENDERS[0];
                        const productKey =
                          category.children && category.children.length > 0
                            ? `${category.name}-${activeSubcategory || 'all'}-${firstProductType}-${firstGender}`
                            : `${category.name}-all-${activeSubcategory || PRODUCT_TYPES[0]}-${firstGender}`;
                        const featuredProduct = featuredProducts[productKey];

                        return featuredProduct ? (
                          <div>
                            <Link href={`/products/${featuredProduct.urlSlug || featuredProduct._id}`} className='block group/product mb-3'>
                              <div className='relative w-full aspect-square rounded-lg overflow-hidden bg-[#1F3B29] mb-3'>
                                {featuredProduct.mainImage ? (
                                  <img
                                    src={featuredProduct.mainImage}
                                    alt={featuredProduct.name}
                                    className='w-full h-full object-cover group-hover/product:scale-110 transition-transform duration-300'
                                  />
                                ) : (
                                  <div className='w-full h-full flex items-center justify-center'>
                                    <Diamond size={50} className='text-white/20' />
                                  </div>
                                )}
                              </div>
                              <p className='text-sm sm:text-base lg:text-xs xl:text-sm font-medium text-[#1F3B29] mb-3 text-center leading-snug'>
                                Give your wrists the much-needed makeover.
                              </p>
                            </Link>
                          </div>
                        ) : (
                          <div>
                            <div className='relative w-full aspect-square rounded-lg overflow-hidden bg-[#1F3B29] mb-3 animate-pulse'>
                              <div className='w-full h-full flex items-center justify-center'>
                                <Diamond size={50} className='text-white/15' />
                              </div>
                            </div>
                            <div className='h-4 bg-gray-200 rounded mb-3 animate-pulse'></div>
                            <div className='flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2'>
                              <Link
                                href={`/jewellery?category=${encodeURIComponent(category.name)}`}
                                className='block w-full text-center text-xs sm:text-sm lg:text-xs xl:text-sm font-semibold text-[#1F3B29] hover:text-[#C8A15B] underline transition-colors duration-200'>
                                VIEW ALL BANGLES
                              </Link>
                              <Link
                                href={`/jewellery?category=${encodeURIComponent(category.name)}`}
                                className='block w-full text-center text-xs sm:text-sm lg:text-xs xl:text-sm font-semibold text-[#1F3B29] hover:text-[#C8A15B] underline transition-colors duration-200'>
                                VIEW ALL BRACELETS
                              </Link>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </header>

      {/* Auth Modals */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onSwitchMode={() => {
          setAuthMode(authMode === 'login' ? 'register' : 'login');
        }}
        onSwitchToForgotPassword={() => {
          setAuthModalOpen(false);
          setForgotPasswordModalOpen(true);
        }}
      />
      <ForgotPasswordModal
        open={forgotPasswordModalOpen}
        onOpenChange={setForgotPasswordModalOpen}
        onSwitchToLogin={() => {
          setForgotPasswordModalOpen(false);
          setAuthMode('login');
          setAuthModalOpen(true);
        }}
      />
      <ResetPasswordModal
        open={resetPasswordModalOpen}
        onOpenChange={setResetPasswordModalOpen}
        token={resetToken}
        onSwitchToLogin={() => {
          setResetPasswordModalOpen(false);
          setAuthMode('login');
          setAuthModalOpen(true);
        }}
        onSwitchToForgotPassword={() => {
          setResetPasswordModalOpen(false);
          setForgotPasswordModalOpen(true);
        }}
      />
    </React.Fragment>
  );
}

export function HomeHeader() {
  return (
    <Suspense
      fallback={
        <div className='fixed top-0 left-0 right-0 bg-white z-50 shadow-sm h-[60px] sm:h-[70px] md:h-[80px] lg:h-[90px] flex items-center justify-center'>
          <Loader2 className='w-6 h-6 text-[#1F3B29] animate-spin' />
        </div>
      }>
      <HomeHeaderContent />
    </Suspense>
  );
}
