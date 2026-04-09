import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Heart, ShoppingCart, ChevronDown, ChevronRight, Clock, Store, LogOut, User, TruckIcon, Package, Menu } from 'lucide-react';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  const renderGoldRatesRows = () => {
    if (loadingPrices) {
      return <p className='text-center text-[#4F3A2E]/70'>Loading rates...</p>;
    }
    if (!livePrices) {
      return <p className='text-center text-[#4F3A2E]/70'>Rates unavailable.</p>;
    }
    const gold22 = Math.round((livePrices.gold * 22) / 24);
    const gold18 = Math.round((livePrices.gold * 18) / 24);
    const gold14 = Math.round((livePrices.gold * 14) / 24);
    return (
      <>
        <div className='flex items-center justify-between border-b border-[#D7C4B3] pb-2'>
          <span className='font-semibold text-[#1F3B29]'>24 KT (999)</span>
          <span className='text-[#1F3B29]'>₹ {livePrices.gold.toLocaleString('en-IN')}/g</span>
        </div>
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
  };

  const renderGoldRatesUpdatedFooter = () => (
    <div className='border-t border-[#D7C4B3] bg-[#F1E2D2] px-4 py-3 text-center text-[11px] text-[#4F3A2E]'>
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
  );

  return (
    <div className='w-full'>
      {/* Top Bar */}
      <div className='bg-whit hidden px-4 py-2 md:block'>
        <div className='mx-auto flex max-w-[1440px] items-center justify-end'>
          <div className='flex items-center gap-4 text-[12px]'>
            <div className='flex items-center text-[#3579b8] gap-1'>
              <TruckIcon className='w-4 h-4' />
              Free Delivery
            </div>
            <span className='h-3 w-px bg-gray-500'></span>
            <Link href='/become-member' className='flex items-center gap-1 text-[#3579b8] hover:text-gray-900'>
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
                  <DropdownMenuContent align='end' className='w-56 rounded-xl border border-[#E6D3C2] bg-white p-2 shadow-lg'>
                    <div className='px-3 py-2'>
                      <p className='text-xs text-gray-500'>Signed in as</p>
                      <p className='truncate text-sm font-semibold text-[#001e38]'>{customerName}</p>
                    </div>
                    <DropdownMenuSeparator className='bg-[#E6D3C2]' />
                    <DropdownMenuItem
                      asChild
                      className='text-[#001e38] hover:bg-gray-100 hover:text-[#001e38] focus:bg-gray-100 focus:text-[#001e38]'>
                      <Link
                        href='/customer-profile'
                        className='text-[#001e38] flex items-center gap-2 cursor-pointer rounded-lg px-2 py-2 text-sm'>
                        <User className='w-4 h-4' />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className='text-[#001e38] hover:bg-gray-100 hover:text-[#001e38] focus:bg-gray-100 focus:text-[#001e38]'>
                      <Link
                        href='/my-orders'
                        className=' text-[#001e38] flex items-center gap-2 cursor-pointer rounded-lg px-2 py-2 text-sm'>
                        <Package className='w-4 h-4' />
                        <span>My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className='cursor-pointer text-[#001e38] rounded-lg px-2 py-2 text-sm hover:bg-gray-100 hover:text-[#001e38] focus:bg-gray-100 focus:text-[#001e38]'>
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

      {/* Main Header — mobile: menu + logo + icons, then search; tablet: same two rows; desktop: single row */}
      <div className='border-b border-gray-200 bg-white shadow-sm'>
        <div className='mx-auto max-w-[1440px] px-3 pb-3 pt-3 sm:px-4 lg:py-2'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8'>
            {/* Mobile / tablet: toolbar row (becomes flex contents on lg so logo + icons + search order correctly) */}
            <div className='flex w-full items-center justify-between gap-2 lg:contents'>
              {/* Hamburger — mobile & tablet only */}
              <div className='shrink-0 lg:hidden'>
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                  <SheetTrigger asChild>
                    <button
                      type='button'
                      className='inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#001e38] shadow-sm transition-colors hover:border-[#001e38]/20 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001e38]/30'
                      aria-label='Open menu'>
                      <Menu className='h-5 w-5' strokeWidth={2} />
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side='left'
                    className='flex w-[min(100vw,20rem)] flex-col border-r border-gray-200 bg-white p-0 sm:max-w-sm'>
                    <SheetHeader className='border-b border-gray-100 px-4 py-4 text-left'>
                      <SheetTitle className='font-serif text-lg text-[#001e38]'>Menu</SheetTitle>
                      <p className='text-xs font-normal text-gray-500'>Shop categories &amp; more</p>
                    </SheetHeader>
                    <nav className='flex-1 overflow-y-auto px-2 py-3'>
                      <p className='px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400'>Categories</p>
                      <ul className='space-y-0.5'>
                        {categoriesLoading ? (
                          <li className='px-3 py-3 text-sm text-gray-500'>Loading…</li>
                        ) : (
                          categories.map(category => (
                            <li key={category._id}>
                              <Link
                                href={`/jewellery?category=${encodeURIComponent(category.slug || category.name)}`}
                                onClick={() => setMobileNavOpen(false)}
                                className='flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-[#001e38] transition-colors hover:bg-[#f5f7fa]'>
                                <span className='truncate'>{category.name}</span>
                                <ChevronRight className='h-4 w-4 shrink-0 text-gray-400' />
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                      <div className='mt-4 border-t border-gray-100 pt-4'>
                        <p className='px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400'>Quick links</p>
                        <ul className='space-y-0.5'>
                          <li>
                            <Link
                              href='/custom-jewellery'
                              onClick={() => setMobileNavOpen(false)}
                              className='flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-[#001e38] hover:bg-[#f5f7fa]'>
                              <Store className='h-4 w-4 text-gray-500' />
                              Custom Jewellery
                            </Link>
                          </li>
                          <li>
                            <Link
                              href='/become-member'
                              onClick={() => setMobileNavOpen(false)}
                              className='flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-[#001e38] hover:bg-[#f5f7fa]'>
                              <User className='h-4 w-4 text-gray-500' />
                              Become Member
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div className='mt-4 overflow-hidden rounded-xl border border-[#D7C4B3] bg-[#F6EBDD]'>
                        <p className='border-b border-[#D7C4B3] bg-[#F1E2D2] px-3 py-2.5 text-center text-xs font-semibold text-[#1F3B29]'>
                          Today&apos;s gold &amp; metal rates
                        </p>
                        <div className='max-h-[220px] space-y-3 overflow-y-auto p-4 text-sm'>{renderGoldRatesRows()}</div>
                        {renderGoldRatesUpdatedFooter()}
                      </div>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Logo */}
              <Link
                href='/'
                className='flex min-w-0 flex-1 items-center justify-center gap-2 sm:justify-start lg:flex-none lg:shrink-0 lg:justify-start'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-gray-100 sm:h-[52px] sm:w-[52px] lg:h-[70px] lg:w-[70px] lg:ring-0'>
                  <img src='/logo.png' alt='Jewel Manas' className='h-full w-full object-contain' />
                </div>
                <span className='truncate font-serif text-base font-bold tracking-wide text-[#001e38] sm:text-lg lg:text-2xl'>
                  Jewel Manas
                </span>
              </Link>

              {/* Action icons — compact on phone, labels from sm on tablet */}
              <div className='flex shrink-0 items-center gap-1 sm:gap-2 lg:order-3 lg:gap-4'>
                <div className='relative' ref={recentlyViewedRef}>
                  <button
                    type='button'
                    onClick={() => setRecentlyViewedOpen(prev => !prev)}
                    className='flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#001e38] sm:min-w-0 sm:px-2 lg:gap-2'
                    aria-haspopup='menu'
                    aria-expanded={recentlyViewedOpen}
                    aria-label='Recently viewed'>
                    <Clock className='h-5 w-5 shrink-0 lg:h-6 lg:w-6' />
                    <span className='hidden max-w-18 truncate text-left text-[11px] font-medium sm:block lg:max-w-[60px] lg:text-xs'>
                      Recent
                    </span>
                  </button>
                  {recentlyViewedOpen && (
                    <div className='absolute right-0 z-50 mt-2 w-[min(calc(100vw-1.5rem),20rem)] max-w-80 rounded-2xl border border-[#E6D3C2]/60 bg-white shadow-xl'>
                      <div className='border-b border-[#E6D3C2]/40 px-4 py-3'>
                        <p className='text-xs font-semibold uppercase tracking-widest text-black'>Recently Viewed</p>
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
                                className='flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#F5EEE5]'>
                                <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-[#F5EEE5]'>
                                  <img src={itemImage} alt={itemName} className='h-full w-full object-cover' />
                                </div>
                                <div className='min-w-0 flex-1'>
                                  <p className='line-clamp-2 text-sm font-medium text-[#1F3B29]'>{itemName}</p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <span className='hidden h-6 w-px bg-gray-200 sm:block lg:bg-gray-500' />

                <Link
                  href='/custom-jewellery'
                  className='flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#001e38] sm:min-w-0 sm:px-2 lg:gap-2'
                  aria-label='Custom jewellery'>
                  <Store className='h-5 w-5 shrink-0 lg:h-6 lg:w-6' />
                  <span className='hidden max-w-18 truncate text-left text-[11px] font-medium sm:block lg:max-w-[60px] lg:text-xs'>
                    Custom
                  </span>
                </Link>

                <span className='hidden h-6 w-px bg-gray-200 sm:block lg:bg-gray-500' />

                <button
                  type='button'
                  onClick={() => {
                    if (!isLoggedIn) {
                      window.dispatchEvent(new Event('openLoginModal'));
                      return;
                    }
                    router.push('/wishlist');
                  }}
                  className='relative flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#001e38]'
                  aria-label='Wishlist'>
                  <Heart className='h-5 w-5 lg:h-6 lg:w-6' />
                  {wishlistCount > 0 && (
                    <span className='absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-theme-secondary px-1 text-[10px] font-semibold text-white'>
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  type='button'
                  onClick={() => {
                    if (!isLoggedIn) {
                      window.dispatchEvent(new Event('openLoginModal'));
                      return;
                    }
                    router.push('/cart');
                  }}
                  className='relative flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#001e38]'
                  aria-label='Cart'>
                  <ShoppingCart className='h-5 w-5 lg:h-6 lg:w-6' />
                  {cartCount > 0 && (
                    <span className='absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-theme-secondary px-1 text-[10px] font-semibold text-white'>
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Search — full width below md–lg; sits between logo and icons on desktop via order */}
            <div className='w-full min-w-0 lg:order-2 lg:max-w-xl lg:flex-1'>
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
                {/* Leading icon — always visible on light field (Lucide uses stroke = currentColor) */}
                <span
                  className='pointer-events-none absolute left-3 top-1/2 z-1 -translate-y-1/2 text-[#001e38]/50 lg:left-3.5'
                  aria-hidden>
                  <Search className='h-5 w-5 shrink-0' strokeWidth={2.25} />
                </span>
                <input
                  ref={searchInputRef}
                  type='search'
                  placeholder='Search jewellery…'
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
                  className='h-11 w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2 pl-11 pr-15 text-sm text-[#001e38] scheme-light placeholder:text-gray-400 focus:border-[#001e38]/25 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001e38]/15 lg:h-auto lg:rounded-none lg:border-3 lg:border-[#e4e4e4] lg:bg-white lg:py-[6px] lg:pl-11 lg:pr-18 lg:focus:ring-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden'
                />
                <button
                  type='submit'
                  aria-label='Search'
                  className='absolute right-1 top-1/2 z-2 flex h-9 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-theme-secondary text-white shadow-sm transition-colors hover:opacity-95 lg:right-0 lg:top-0 lg:h-full lg:w-auto lg:translate-y-0 lg:rounded-none lg:border-3 lg:border-[#e4e4e4] lg:border-l-0 lg:px-6'>
                  <Search className='h-4 w-4 shrink-0 stroke-[2.25] text-white lg:h-5 lg:w-5' strokeWidth={2.25} />
                </button>
                <SearchDialog
                  open={searchOpen}
                  onOpenChange={setSearchOpen}
                  query={searchQuery}
                  inputRef={searchInputRef as React.RefObject<HTMLInputElement>}
                  listboxId='header-search-suggestions'
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Sticky */}
      <div
        className={`bg-web
 text-white transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''}`}
        onMouseLeave={() => setOpenDropdown(null)}>
        <div className='hidden lg:block relative mx-auto max-w-[1440px] px-1 sm:px-2 md:px-3 lg:px-0'>
          <div className='flex min-h-[52px] items-center justify-between gap-1 sm:gap-2 md:min-h-14'>
            {/* Logo in Navbar - Only shows when sticky */}
            <div
              className={`hidden items-center gap-2 pl-4 transition-all duration-300 lg:flex ${
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
            <div className='scrollbar-hide flex min-w-0 flex-1 items-center overflow-x-auto overscroll-x-contain whitespace-nowrap [-webkit-overflow-scrolling:touch]'>
              {categoriesLoading ? (
                <span className='px-3 py-3 text-sm text-white/70 md:px-4 md:py-4'>Loading...</span>
              ) : (
                categories.map(category => (
                  <button
                    key={category._id}
                    onMouseEnter={() => setOpenDropdown(category._id)}
                    onClick={() => setOpenDropdown(prev => (prev === category._id ? null : category._id))}
                    className={`flex shrink-0 items-center gap-1 px-2.5 py-3 text-[12px] font-light leading-[18px] transition-colors hover:text-emerald-400 sm:px-3 md:px-4 md:py-3.5 md:text-[13px] lg:py-4 lg:text-[14px] lg:leading-[20px] ${
                      openDropdown === category._id ? 'text-emerald-400' : ''
                    }`}>
                    <span className='max-w-30 truncate sm:max-w-40 md:max-w-none'>{category.name}</span>
                    <ChevronDown className='h-3.5 w-3.5 shrink-0 md:h-4 md:w-4' />
                  </button>
                ))
              )}
            </div>

            {/* Live Rate — tablet + desktop */}
            <div
              className='relative hidden shrink-0 md:block'
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
                className='flex items-center gap-1.5 px-3 py-3 text-xs font-medium sm:gap-2 sm:px-4 sm:text-sm md:px-5 lg:px-6 lg:py-4'>
                <span className='hidden sm:inline'>Gold Rate</span>
                <span className='sm:hidden'>Gold</span>
                <ChevronDown className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              </button>
              {liveRateOpen && (
                <div className='absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#D7C4B3] bg-[#F6EBDD] shadow-lg'>
                  <div className='border-b border-[#D7C4B3] bg-[#F1E2D2] px-4 py-3 text-center'>
                    <p className='text-sm font-semibold text-[#1F3B29]'>Today&apos;s Gold Rate</p>
                  </div>
                  <div className='space-y-3 p-4 text-sm'>{renderGoldRatesRows()}</div>
                  {renderGoldRatesUpdatedFooter()}
                </div>
              )}
            </div>
          </div>

          {openDropdown && (
            <div className='absolute left-0 right-0 top-full z-40 hidden max-h-[70vh] overflow-y-auto border-t border-[#E6D3C2]/40 bg-white text-[#1F3B29] shadow-xl md:block'>
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
                          <div className='aspect-4/3 overflow-hidden bg-[#F5EEE5]'>
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
export { HomeHeader };
