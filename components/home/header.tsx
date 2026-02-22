import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Heart, ShoppingCart, ChevronDown, Clock, Store, LogOut, User, TruckIcon, Package } from 'lucide-react';
import { AuthModal } from '@/components/auth/auth-modal';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRouter, usePathname } from 'next/navigation';
import { SearchDialog } from '@/components/home/SearchBar/SearchDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CategoryOccasion = {
  name: string;
  productId?: string;
  image?: string;
};

type CategoryItem = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  banner?: string;
  featured?: boolean;
  children?: CategoryItem[];
  occasions?: CategoryOccasion[];
  megaMenuProductId?: string;
};

type MegaMenuProduct = {
  _id: string;
  name: string;
  mainImage?: string;
  urlSlug?: string;
  shortDescription?: string;
};

type RecentlyViewedItem = {
  id?: string | number;
  _id?: string;
  name?: string;
  title?: string;
  image?: string;
  urlSlug?: string;
};

const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const RECENTLY_VIEWED_LIMIT = 8;

const readRecentlyViewed = () => {
  if (typeof window === 'undefined') {
    return [] as RecentlyViewedItem[];
  }
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse recently viewed products:', error);
    return [];
  }
};

const getRecentlyViewedId = (item: RecentlyViewedItem) => {
  const id = item?._id ?? item?.id;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
};

const HomeHeader = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState<string>('');
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [megaMenuProduct, setMegaMenuProduct] = useState<MegaMenuProduct | null>(null);
  const [megaMenuLoading, setMegaMenuLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [recentlyViewedOpen, setRecentlyViewedOpen] = useState(false);
  const recentlyViewedRef = useRef<HTMLDivElement>(null);
  const [liveRateOpen, setLiveRateOpen] = useState(false);
  const liveRateCloseTimeoutRef = useRef<number | null>(null);
  const [livePrices, setLivePrices] = useState<{
    gold: number;
    silver: number;
    platinum: number;
    timestamp?: string;
  } | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(true);

  const loadRecentlyViewed = () => {
    const items = readRecentlyViewed();
    setRecentlyViewed(items.slice(0, RECENTLY_VIEWED_LIMIT));
  };

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

  useEffect(() => {
    const handleOpenLoginModal = () => {
      setAuthMode('login');
      setAuthModalOpen(true);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    return () => window.removeEventListener('openLoginModal', handleOpenLoginModal);
  }, []);

  useEffect(() => {
    loadRecentlyViewed();
  }, [pathname]);

  useEffect(() => {
    const handleRecentlyViewedChange = () => loadRecentlyViewed();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === RECENTLY_VIEWED_KEY) {
        loadRecentlyViewed();
      }
    };
    window.addEventListener('recentlyViewedChange', handleRecentlyViewedChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('recentlyViewedChange', handleRecentlyViewedChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!recentlyViewedOpen) {
        return;
      }
      if (recentlyViewedRef.current && !recentlyViewedRef.current.contains(event.target as Node)) {
        setRecentlyViewedOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [recentlyViewedOpen]);

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
    setAuthMode(prev => (prev === 'login' ? 'register' : 'login'));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/public/categories');
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        setLoadingPrices(true);
        const response = await fetch('/api/public/metal-prices', {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          setLivePrices({
            gold: data.gold || 0,
            silver: data.silver || 0,
            platinum: data.platinum || 0,
            timestamp: data.timestamp,
          });
        }
      } catch (error) {
        console.error('Failed to fetch live prices:', error);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchLivePrices();
    // Refresh prices every 30 seconds for real-time feel
    const interval = setInterval(fetchLivePrices, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const activeCategory = categories.find(category => category._id === openDropdown);
    if (!activeCategory?.megaMenuProductId) {
      setMegaMenuProduct(null);
      return;
    }

    const controller = new AbortController();
    const fetchMegaMenuProduct = async () => {
      try {
        setMegaMenuLoading(true);
        const response = await fetch(`/api/public/products/megamenu/${activeCategory.megaMenuProductId}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setMegaMenuProduct(null);
          return;
        }
        const data = await response.json();
        setMegaMenuProduct(data);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to fetch mega menu product:', error);
        }
      } finally {
        setMegaMenuLoading(false);
      }
    };

    fetchMegaMenuProduct();
    return () => controller.abort();
  }, [openDropdown, categories]);

  return (
    <div className='w-full'>
      {/* Top Bar */}
      <div className='bg-whit py-2 px-4'>
        <div className='max-w-[1440px] mx-auto flex items-center justify-end'>
          <div className='flex items-center gap-4 text-[12px]'>
            <div className='flex items-center text-[#3579b8] gap-1'>
              <TruckIcon className='w-4 h-4' />
              Free Delivery
            </div>
            <span className='h-3 w-px bg-gray-500'></span>
            <Link href='/become-vendor' className='flex items-center gap-1 text-[#3579b8] hover:text-gray-900'>
              <User className='w-4 h-4' />
              <span>Become Member</span>
            </Link>
            <span className='h-3 w-px bg-gray-500'></span>
            {isLoggedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className='flex items-center gap-2 text-[#3579b8] hover:text-gray-900 focus:outline-none'>
                      <User className='w-4 h-4' />
                      <span className='font-medium'>{customerName}</span>
                      <ChevronDown className='w-3 h-3' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='end'
                    className='w-56 rounded-xl border border-[#E6D3C2] bg-white p-2 shadow-lg'
                  >
                    <div className='px-3 py-2'>
                      <p className='text-xs text-gray-500'>Signed in as</p>
                      <p className='truncate text-sm font-semibold text-[#001e38]'>{customerName}</p>
                    </div>
                    <DropdownMenuSeparator className='bg-[#E6D3C2]' />
                      <DropdownMenuItem asChild className='text-[#001e38] hover:bg-gray-100 hover:text-[#001e38] focus:bg-gray-100 focus:text-[#001e38]'>
                      <Link href='/customer-profile' className='text-[#001e38] flex items-center gap-2 cursor-pointer rounded-lg px-2 py-2 text-sm'>
                        <User className='w-4 h-4' />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                      <DropdownMenuItem asChild className='text-[#001e38] hover:bg-gray-100 hover:text-[#001e38] focus:bg-gray-100 focus:text-[#001e38]'>
                      <Link href='/my-orders' className=' text-[#001e38] flex items-center gap-2 cursor-pointer rounded-lg px-2 py-2 text-sm'>
                        <Package className='w-4 h-4' />
                        <span>My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className='cursor-pointer text-[#001e38] rounded-lg px-2 py-2 text-sm hover:bg-gray-100 hover:text-[#001e38] focus:bg-gray-100 focus:text-[#001e38]'
                    >
                      <LogOut className='w-4 h-4' />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <button onClick={handleLoginClick} className='text-[#3579b8] hover:text-gray-900'>
                  Login
                </button>
                <span className='h-3 w-px bg-gray-500'></span>
                <button onClick={handleSignupClick} className='text-[#3579b8] hover:text-gray-900'>
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
          <Link href='/' className='flex items-center gap-2 cursor-pointer'>
            <div className='w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center'>
              <img src='/logo.png' className='w-full h-full object-contain' />
            </div>
            <span className='text-2xl font-bold text-[#001e38] tracking-wide'>Jewel Manas</span>
          </Link>

          {/* Search Bar */}
          <div className='flex-1 max-w-xl'>
            <form
              className='relative'
              onSubmit={event => {
                event.preventDefault();
                const trimmedQuery = searchQuery.trim();
                if (!trimmedQuery) {
                  return;
                }
                router.push(`/jewellery?search=${encodeURIComponent(trimmedQuery)}`);
                setSearchOpen(false);
              }}>
              <input
                ref={searchInputRef}
                type='text'
                placeholder='Search for Jewellery'
                value={searchQuery}
                onChange={event => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={event => {
                  if (event.key === 'Escape') {
                    setSearchOpen(false);
                  }
                }}
                role='combobox'
                aria-autocomplete='list'
                aria-expanded={searchOpen}
                aria-controls='header-search-suggestions'
                aria-haspopup='listbox'
                className='w-full px-4 py-[6px] pr-12 border-3 border-[#e4e4e4] focus:outline-none'
              />
              <button
                type='submit'
                className='absolute right-0 top-0 cursor-pointer h-full border-l-0 border-3 border-[#e4e4e4] px-6 bg-theme-secondary text-white'>
                <Search className='w-5 h-5' />
              </button>
              <SearchDialog
                open={searchOpen}
                onOpenChange={setSearchOpen}
                query={searchQuery}
                inputRef={searchInputRef}
                listboxId='header-search-suggestions'
              />
            </form>
          </div>

          {/* Right Icons */}
          <div className='flex items-center gap-4'>
            <div className='relative' ref={recentlyViewedRef}>
              <button
                type='button'
                onClick={() => setRecentlyViewedOpen(prev => !prev)}
                className='flex cursor-pointer items-center gap-2 text-gray-600 hover:text-[#001e38]'
                aria-haspopup='menu'
                aria-expanded={recentlyViewedOpen}>
                <Clock className='w-6 h-6' />
                <span className='text-xs max-w-[60px] text-left'>Recently Viewed</span>
              </button>
              {recentlyViewedOpen && (
                <div className='absolute right-0 mt-3 w-80 rounded-2xl border border-[#E6D3C2]/60 bg-white shadow-xl z-50'>
                  <div className='px-4 py-3 border-b border-[#E6D3C2]/40'>
                    <p className='text-xs uppercase tracking-[0.1em] text-black font-semibold'>Recently Viewed</p>
                  </div>
                  {recentlyViewed.length === 0 ? (
                    <div className='px-4 py-6 text-sm text-[#4F3A2E]/70'>No products viewed yet.</div>
                  ) : (
                    <div className='max-h-80 overflow-y-auto'>
                      {recentlyViewed.map(item => {
                        const itemId = getRecentlyViewedId(item);
                        if (!itemId) {
                          return null;
                        }
                        const itemName = item.name || item.title || 'Untitled product';
                        const itemImage = item.image || '/placeholder.jpg';
                        const itemSlug = item.urlSlug || itemId;
                        return (
                          <Link
                            key={itemId}
                            href={`/products/${itemSlug}`}
                            onClick={() => setRecentlyViewedOpen(false)}
                            className='flex items-center gap-3 px-4 py-3 hover:bg-[#F5EEE5] transition-colors'>
                            <div className='h-12 w-12 rounded-lg overflow-hidden bg-[#F5EEE5] flex items-center justify-center'>
                              <img src={itemImage} alt={itemName} className='h-full w-full object-cover' />
                            </div>
                            <div className='flex-1'>
                              <p className='text-sm font-medium text-[#1F3B29] line-clamp-2'>{itemName}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className='h-6 w-px bg-gray-500'></span>

            <Link href='/custom-jewellery' className='flex items-center gap-2 text-gray-600 hover:text-[#001e38]'>
              <Store className='w-6 h-6' />
              <span className='text-xs max-w-[60px] text-left'>Custom Jewellery</span>
            </Link>

            <span className='h-6 w-px bg-gray-500'></span>

            <button
              type='button'
              onClick={() => {
                if (!isLoggedIn) {
                  window.dispatchEvent(new Event('openLoginModal'));
                  return;
                }
                router.push('/wishlist');
              }}
              className='relative text-gray-600 hover:text-[#001e38]'
              aria-label='Wishlist'>
              <Heart className='w-6 h-6' />
              {wishlistCount > 0 && (
                <span className='absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-theme-secondary px-1 text-[10px] font-semibold text-white'>
                  {wishlistCount}
                </span>
              )}
            </button>

            <span className='h-6 w-px bg-gray-500'></span>

            <button
              type='button'
              onClick={() => {
                if (!isLoggedIn) {
                  window.dispatchEvent(new Event('openLoginModal'));
                  return;
                }
                router.push('/cart');
              }}
              className='relative text-gray-600 hover:text-[#001e38]'
              aria-label='Cart'>
              <ShoppingCart className='w-6 h-6' />
              {cartCount > 0 && (
                <span className='absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-theme-secondary px-1 text-[10px] font-semibold text-white'>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Sticky */}
      <div
        className={`bg-web
 text-white transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''}`}
        onMouseLeave={() => setOpenDropdown(null)}>
        <div className='max-w-[1440px] mx-auto relative'>
          <div className='flex items-center justify-between'>
            {/* Logo in Navbar - Only shows when sticky */}
            <div
              className={`flex items-center gap-2 pl-4 transition-all duration-300 ${
                isSticky ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none w-0 overflow-hidden'
              }`}>
              <Link href='/'>
                <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center'>
                  <img src='/light_logo.png' className='w-full h-full object-contain' />
                </div>
              </Link>
              <span className='text-lg font-bold text-white tracking-wide'>Jewel Manas</span>
            </div>

            {/* Menu Items */}
            <div className='flex items-center'>
              {categoriesLoading ? (
                <span className='px-4 py-4 text-sm text-white/70'>Loading...</span>
              ) : (
                categories.map(category => (
                  <button
                    key={category._id}
                    onMouseEnter={() => setOpenDropdown(category._id)}
                    onClick={() => setOpenDropdown(prev => (prev === category._id ? null : category._id))}
                    className={`px-4 py-4 text-[14px] font-light leading-[20px] flex items-center gap-1 transition-colors hover:text-emerald-400 ${
                      openDropdown === category._id ? 'text-emerald-400' : ''
                    }`}>
                    {category.name}
                    <ChevronDown className='w-4 h-4' />
                  </button>
                ))
              )}
            </div>

            {/* Live Rate */}
            <div
              className='relative'
              onMouseEnter={() => {
                if (liveRateCloseTimeoutRef.current) {
                  window.clearTimeout(liveRateCloseTimeoutRef.current);
                  liveRateCloseTimeoutRef.current = null;
                }
                setLiveRateOpen(true);
                setOpenDropdown(null);
              }}
              onMouseLeave={() => {
                if (liveRateCloseTimeoutRef.current) {
                  window.clearTimeout(liveRateCloseTimeoutRef.current);
                }
                liveRateCloseTimeoutRef.current = window.setTimeout(() => {
                  setLiveRateOpen(false);
                }, 200);
              }}>
              <button
                onClick={() => setLiveRateOpen(prev => !prev)}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2`}>
                Gold Rate
                <ChevronDown className='w-4 h-4' />
              </button>
              {liveRateOpen && (
                <div className='absolute right-0 top-full mt-2 w-72 rounded-xl border border-[#D7C4B3] bg-[#F6EBDD] shadow-lg z-50'>
                  <div className='px-4 py-3 border-b border-[#D7C4B3] bg-[#F1E2D2] text-center'>
                    <p className='text-sm font-semibold text-[#1F3B29]'>Today&apos;s Gold Rate</p>
                  </div>
                  <div className='p-4 space-y-3 text-sm'>
                    {loadingPrices ? (
                      <p className='text-center text-[#4F3A2E]/70'>Loading rates...</p>
                    ) : livePrices ? (
                      <>
                        {(() => {
                          const gold22 = Math.round((livePrices.gold * 22) / 24);
                          const gold18 = Math.round((livePrices.gold * 18) / 24);
                          const gold14 = Math.round((livePrices.gold * 14) / 24);
                          return (
                            <>
                              <div className='flex items-center justify-between border-b border-[#D7C4B3] pb-2'>
                                <span className='font-semibold text-[#1F3B29]'>22 KT (916)</span>
                                <span className='text-[#1F3B29]'>₹ {gold22.toLocaleString('en-IN')}/g</span>
                              </div>
                              <div className='flex items-center justify-between border-b border-[#D7C4B3] pb-2'>
                                <span className='font-semibold text-[#1F3B29]'>18 KT (750)</span>
                                <span className='text-[#1F3B29]'>₹ {gold18.toLocaleString('en-IN')}/g</span>
                              </div>
                              <div className='flex items-center justify-between border-b border-[#D7C4B3] pb-2'>
                                <span className='font-semibold text-[#1F3B29]'>14 KT (585)</span>
                                <span className='text-[#1F3B29]'>₹ {gold14.toLocaleString('en-IN')}/g</span>
                              </div>
                              <div className='flex items-center justify-between border-b border-[#D7C4B3] pb-2'>
                                <span className='font-semibold text-[#1F3B29]'>Silver</span>
                                <span className='text-[#1F3B29]'>₹ {livePrices.silver.toLocaleString('en-IN')}/g</span>
                              </div>
                              <div className='flex items-center justify-between'>
                                <span className='font-semibold text-[#1F3B29]'>Platinum</span>
                                <span className='text-[#1F3B29]'>₹ {livePrices.platinum.toLocaleString('en-IN')}/g</span>
                              </div>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <p className='text-center text-[#4F3A2E]/70'>Rates unavailable.</p>
                    )}
                  </div>
                  <div className='px-4 py-3 border-t border-[#D7C4B3] bg-[#F1E2D2] text-center text-[11px] text-[#4F3A2E]'>
                    Updated on -{' '}
                    {livePrices?.timestamp
                      ? new Date(livePrices.timestamp).toLocaleDateString('en-GB') +
                        ' ' +
                        new Date(livePrices.timestamp).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {openDropdown && (
            <div className='absolute left-0 right-0 top-full bg-white text-[#1F3B29] shadow-xl border-t border-[#E6D3C2]/40 z-40'>
              {(() => {
                const activeCategory = categories.find(category => category._id === openDropdown);
                if (!activeCategory) {
                  return null;
                }

                const subcategories = Array.isArray(activeCategory.children) ? activeCategory.children : [];
                const occasions = Array.isArray(activeCategory.occasions) ? activeCategory.occasions : [];

                return (
                  <div className='px-6 sm:px-8 lg:px-12 py-8 grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-8'>
                    <div className='space-y-4'>
                      <div>
                        <p className='text-xs uppercase tracking-[0.3em] text-emerald-400 font-semibold'>Shop by Category</p>
                        <h3 className='mt-2 text-xl font-semibold text-[#001e38]'>{activeCategory.name}</h3>
                        {activeCategory.shortDescription && (
                          <p className='mt-2 text-sm text-[#4F3A2E]'>{activeCategory.shortDescription}</p>
                        )}
                        <Link
                          href={`/jewellery?category=${encodeURIComponent(activeCategory.slug || activeCategory.name)}`}
                          className='mt-4 inline-flex text-sm font-semibold text-[#001e38] hover:text-emerald-400 transition-colors'>
                          View all
                        </Link>
                      </div>

                      {subcategories.length > 0 && (
                        <div className='grid grid-cols-2 gap-3'>
                          {subcategories.map(sub => (
                            <Link
                              key={sub._id}
                              href={`/jewellery?category=${encodeURIComponent(sub.slug || sub.name)}`}
                              className='text-sm text-[#4F3A2E] hover:text-[#001e38] transition-colors'>
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className='space-y-4'>
                      <h4 className='text-sm font-semibold text-[#001e38]'>Shop by Occasion</h4>
                      {occasions.length > 0 ? (
                        <div className='grid grid-cols-2 gap-3'>
                          {occasions.map((occasion, index) => (
                            <Link
                              key={`${occasion.name}-${index}`}
                              href={
                                occasion.productId
                                  ? `/products/${occasion.productId}`
                                  : `/jewellery?search=${encodeURIComponent(occasion.name)}`
                              }
                              className='flex items-center gap-3 rounded-lg border border-[#E6D3C2]/40 p-2 hover:border-emerald-400 hover:bg-[#F5EEE5] transition-colors'>
                              <div className='h-12 w-12 rounded-md overflow-hidden bg-[#F5EEE5] flex items-center justify-center text-xs text-emerald-400'>
                                {occasion.image ? (
                                  <img src={occasion.image} alt={occasion.name} className='h-full w-full object-cover' />
                                ) : (
                                  occasion.name.charAt(0)
                                )}
                              </div>
                              <span className='text-sm font-medium text-[#1F3B29]'>{occasion.name}</span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className='text-sm text-[#4F3A2E]/70'>No occasions configured.</p>
                      )}
                    </div>

                    <div className='space-y-4'>
                      <h4 className='text-sm font-semibold text-[#001e38]'>Featured</h4>
                      {megaMenuLoading ? (
                        <p className='text-sm text-[#4F3A2E]/70'>Loading...</p>
                      ) : megaMenuProduct ? (
                        <Link
                          href={`/products/${megaMenuProduct.urlSlug || megaMenuProduct._id}`}
                          className='group block rounded-xl border border-[#E6D3C2]/40 overflow-hidden hover:border-emerald-400 hover:shadow-md transition-all'>
                          <div className='aspect-[4/3] bg-[#F5EEE5] overflow-hidden'>
                            <img
                              src={megaMenuProduct.mainImage || '/placeholder.jpg'}
                              alt={megaMenuProduct.name}
                              className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                            />
                          </div>
                          <div className='p-4'>
                            <p className='text-sm font-semibold text-[#001e38]'>{megaMenuProduct.name}</p>
                            {megaMenuProduct.shortDescription && (
                              <p className='mt-1 text-xs text-[#4F3A2E]/70 line-clamp-2'>{megaMenuProduct.shortDescription}</p>
                            )}
                          </div>
                        </Link>
                      ) : (
                        <div className='rounded-xl border border-dashed border-[#E6D3C2]/50 p-4 text-sm text-[#4F3A2E]/70'>
                          No featured product selected.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} mode={authMode} onSwitchMode={handleSwitchMode} />
    </div>
  );
};

export default HomeHeader;
