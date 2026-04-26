import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Clock,
  Store,
  LogOut,
  User,
  TruckIcon,
  Package,
  Menu,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AuthModal } from '@/components/auth/auth-modal';
import { ForgotPasswordModal } from '@/components/auth/forgot-password-modal';
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
import { useSettings } from '@/components/settings/settings-provider';
import { BRAND_LOGO_PATH } from '@/lib/site-settings';

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
  if (typeof window === 'undefined') return [] as RecentlyViewedItem[];
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getRecentlyViewedId = (item: RecentlyViewedItem) => {
  const id = item?._id ?? item?.id;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
};

const HomeHeader = () => {
  const { settings } = useSettings();
  const headerLogoSrc = settings.logo?.trim() || BRAND_LOGO_PATH;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [forgotTokenExpired, setForgotTokenExpired] = useState(false);
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
  const [searchFocused, setSearchFocused] = useState(false);

  const loadRecentlyViewed = () => {
    const items = readRecentlyViewed();
    setRecentlyViewed(items.slice(0, RECENTLY_VIEWED_LIMIT));
  };

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          } catch {
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
      if (event.key === RECENTLY_VIEWED_KEY) loadRecentlyViewed();
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
      if (!recentlyViewedOpen) return;
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
  const handleSwitchMode = () => setAuthMode(prev => (prev === 'login' ? 'register' : 'login'));
  const handleSwitchToForgotPassword = () => {
    setAuthModalOpen(false);
    setForgotTokenExpired(false);
    setForgotPasswordModalOpen(true);
  };
  const handleForgotPasswordModalOpenChange = (open: boolean) => {
    setForgotPasswordModalOpen(open);
    if (!open) setForgotTokenExpired(false);
  };
  const handleForgotSwitchToLogin = () => {
    setForgotPasswordModalOpen(false);
    setForgotTokenExpired(false);
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const open = sessionStorage.getItem('openForgotPassword');
      if (open === '1') {
        sessionStorage.removeItem('openForgotPassword');
        const expired = sessionStorage.getItem('forgotPasswordExpired') === '1';
        sessionStorage.removeItem('forgotPasswordExpired');
        setForgotTokenExpired(expired);
        setForgotPasswordModalOpen(true);
      }
    } catch {
      /* ignore */
    }
  }, [pathname]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/public/categories');
        if (!response.ok) return;
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
        const response = await fetch('/api/public/metal-prices', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setLivePrices({ gold: data.gold || 0, silver: data.silver || 0, platinum: data.platinum || 0, timestamp: data.timestamp });
        }
      } catch (error) {
        console.error('Failed to fetch live prices:', error);
      } finally {
        setLoadingPrices(false);
      }
    };
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const activeCategory = categories.find(c => c._id === openDropdown);
    if (!activeCategory?.megaMenuProductId) {
      setMegaMenuProduct(null);
      return;
    }
    const controller = new AbortController();
    const fetchMegaMenuProduct = async () => {
      try {
        setMegaMenuLoading(true);
        const response = await fetch(`/api/public/products/megamenu/${activeCategory.megaMenuProductId}`, { signal: controller.signal });
        if (!response.ok) {
          setMegaMenuProduct(null);
          return;
        }
        const data = await response.json();
        setMegaMenuProduct(data);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') console.error('Failed to fetch mega menu product:', error);
      } finally {
        setMegaMenuLoading(false);
      }
    };
    fetchMegaMenuProduct();
    return () => controller.abort();
  }, [openDropdown, categories]);

  const renderGoldRatesRows = () => {
    if (loadingPrices) return <p className='text-center text-sm text-amber-700/60 py-2'>Loading rates…</p>;
    if (!livePrices) return <p className='text-center text-sm text-amber-700/60 py-2'>Rates unavailable.</p>;
    const gold22 = Math.round((livePrices.gold * 22) / 24);
    const gold18 = Math.round((livePrices.gold * 18) / 24);
    const gold14 = Math.round((livePrices.gold * 14) / 24);
    const rows = [
      { label: '24 KT (999)', value: livePrices.gold },
      { label: '22 KT (916)', value: gold22 },
      { label: '18 KT (750)', value: gold18 },
      { label: '14 KT (585)', value: gold14 },
      { label: 'Silver', value: livePrices.silver },
      { label: 'Platinum', value: livePrices.platinum },
    ];
    return (
      <div className='space-y-1'>
        {rows.map((row, i) => (
          <div key={i} className='flex items-center justify-between rounded-lg px-3 py-2 transition-colors'>
            <span className='text-sm font-medium text-stone-700'>{row.label}</span>
            <span className='text-sm font-semibold text-amber-800'>
              ₹ {row.value.toLocaleString('en-IN')}
              <span className='text-xs font-normal text-stone-500'>/g</span>
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderGoldRatesUpdatedFooter = () => (
    <div className='border-t border-amber-100 px-4 py-2.5 text-center text-[11px] text-stone-400'>
      Updated{' '}
      {livePrices?.timestamp
        ? new Date(livePrices.timestamp).toLocaleDateString('en-GB') +
          ' · ' +
          new Date(livePrices.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : '—'}
    </div>
  );

  return (
    <>
      {/* ─── Announcement Strip ──────────────────────────────────────────────── */}
      <div className='hidden md:flex items-center justify-between bg-[var(--web-color,#a05a64)] px-6 py-2 text-[11px] text-white/70'>
        <div className='flex items-center gap-5'>
          <span className='flex items-center gap-1.5'>
            <TruckIcon className='h-3.5 w-3.5 text-white' /> Free delivery on all orders
          </span>
          <span className='h-3 w-px bg-white/20' />
          <Link href='/become-member' className='flex items-center gap-1.5 hover:text-white transition-colors'>
            <Sparkles className='h-3.5 w-3.5 text-white' /> Become a member
          </Link>
        </div>
        <div className='flex items-center gap-4'>
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='flex items-center gap-1.5 hover:text-white transition-colors focus:outline-none'>
                  <span className='h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-400 uppercase'>
                    {customerName.charAt(0)}
                  </span>
                  <span>{customerName}</span>
                  <ChevronDown className='h-3 w-3' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-52 mt-2 rounded-xl border border-stone-100 bg-white shadow-xl p-1.5'>
                <div className='px-3 py-2.5'>
                  <p className='text-[10px] text-stone-400 uppercase tracking-wider'>Signed in as</p>
                  <p className='text-sm font-semibold text-stone-800 truncate mt-0.5'>{customerName}</p>
                </div>
                <DropdownMenuSeparator className='bg-stone-100' />
                <DropdownMenuItem asChild className='rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 cursor-pointer'>
                  <Link href='/customer-profile' className='flex items-center gap-2 px-3 py-2 text-sm'>
                    <User className='h-4 w-4' /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className='rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 cursor-pointer'>
                  <Link href='/my-orders' className='flex items-center gap-2 px-3 py-2 text-sm'>
                    <Package className='h-4 w-4' /> My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className='bg-stone-100' />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className='rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer px-3 py-2 text-sm flex items-center gap-2'>
                  <LogOut className='h-4 w-4' /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className='flex items-center gap-3'>
              <button onClick={handleLoginClick} className='hover:text-white transition-colors'>
                Sign In
              </button>
              <span className='h-3 w-px bg-white/20' />
              <button
                onClick={handleSignupClick}
                className='px-3 py-1 rounded-full border border-white/20 hover:border-amber-400 hover:text-amber-400 transition-all text-[11px]'>
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Header ─────────────────────────────────────────────────────── */}
      <header
        className={`w-full bg-white transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-[0_2px_20px_rgba(0,0,0,0.08)]' : 'relative'}`}>
        <div className='mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-3 sm:gap-4 lg:gap-6 py-3 lg:py-4 min-w-0'>
            <div className='flex items-center gap-3 sm:gap-4 shrink-0 min-w-0'>
            {/* Hamburger (mobile/tablet) */}
            <div className='shrink-0 lg:hidden'>
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <button
                    type='button'
                    className='h-10 w-10 flex items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50 transition-all'
                    aria-label='Open menu'>
                    <Menu className='h-5 w-5' />
                  </button>
                </SheetTrigger>
                <SheetContent side='left' className='w-[min(100vw,22rem)] p-0 border-r border-stone-100 bg-white flex flex-col'>
                  <SheetHeader className='px-5 py-4 border-b border-stone-100 flex flex-row items-center justify-between'>
                    <div>
                      <SheetTitle className='text-base font-semibold text-stone-900'>Browse</SheetTitle>
                      <p className='text-xs text-stone-400 mt-0.5'>Categories &amp; collections</p>
                    </div>
                  </SheetHeader>
                  <nav className='flex-1 overflow-y-auto'>
                    <div className='px-3 py-4'>
                      <p className='px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400'>Categories</p>
                      <ul className='space-y-0.5'>
                        {categoriesLoading ? (
                          <li className='px-3 py-3 text-sm text-stone-400'>Loading…</li>
                        ) : (
                          categories.map(category => (
                            <li key={category._id}>
                              <Link
                                href={`/jewellery?category=${encodeURIComponent(category.slug || category.name)}`}
                                onClick={() => setMobileNavOpen(false)}
                                className='flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors'>
                                <span className='truncate'>{category.name}</span>
                                <ChevronRight className='h-4 w-4 text-stone-300' />
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    <div className='px-3 pt-2 pb-4 border-t border-stone-100'>
                      <p className='px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400'>Quick Links</p>
                      <ul className='space-y-0.5'>
                        <li>
                          <Link
                            href='/custom-jewellery'
                            onClick={() => setMobileNavOpen(false)}
                            className='flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors'>
                            <Store className='h-4 w-4 text-stone-400' /> Custom Jewellery
                          </Link>
                        </li>
                        <li>
                          <Link
                            href='/become-member'
                            onClick={() => setMobileNavOpen(false)}
                            className='flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors'>
                            <Sparkles className='h-4 w-4 text-stone-400' /> Become Member
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div className='mx-3 mb-4 overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50 to-white'>
                      <div className='px-4 py-3 border-b border-amber-100'>
                        <p className='text-xs font-semibold text-amber-800'>Today's Metal Rates</p>
                      </div>
                      <div className='py-2'>{renderGoldRatesRows()}</div>
                      {renderGoldRatesUpdatedFooter()}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <Link href='/' className='shrink-0 flex items-center gap-3'>
              <div className='flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 overflow-hidden'>
                <img src={headerLogoSrc} alt='Jewel Manas' className='h-full w-full object-contain' />
              </div>
            </Link>
            </div>

            {/* Search — centered, max 500px */}
            <div className='flex-1 min-w-0 flex justify-center px-1 sm:px-2'>
              <div className='w-full max-w-[700px] min-w-0'>
              <form
                className='relative'
                onSubmit={e => {
                  e.preventDefault();
                  const q = searchQuery.trim();
                  if (!q) return;
                  router.push(`/jewellery?search=${encodeURIComponent(q)}`);
                  setSearchOpen(false);
                }}>
                <span className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400'>
                  <Search className='h-4 w-4' strokeWidth={2} />
                </span>
                <input
                  ref={searchInputRef}
                  type='search'
                  placeholder='Search rings, necklaces, earrings…'
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => {
                    setSearchFocused(true);
                    setSearchOpen(true);
                  }}
                  onBlur={() => setSearchFocused(false)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') setSearchOpen(false);
                  }}
                  role='combobox'
                  aria-autocomplete='list'
                  aria-expanded={searchOpen}
                  aria-controls='header-search-suggestions'
                  aria-haspopup='listbox'
                  className={`w-full h-11 pl-10 pr-28 rounded-2xl border text-sm text-stone-800 placeholder:text-stone-400 transition-all outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden
                    ${
                      searchFocused
                        ? 'border-[#a05a64]/80 bg-white'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                    }`}
                />
                <button
                  type='submit'
                  className='absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 h-8 rounded-xl bg-[var(--web-color,#a05a64)] text-white text-xs font-medium  cursor-pointer transition-colors'>
                  <Search className='h-3.5 w-3.5' /> Search
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

            {/* Action Icons */}
            <div className='flex items-center gap-1 shrink-0'>
              {/* Recently Viewed */}
              <div className='relative hidden sm:block' ref={recentlyViewedRef}>
                <button
                  type='button'
                  onClick={() => setRecentlyViewedOpen(p => !p)}
                  className='flex h-10 w-10 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors'
                  aria-label='Recently viewed'>
                  <Clock className='h-5 w-5' />
                </button>
                {recentlyViewedOpen && (
                  <div className='absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-stone-100 bg-white shadow-2xl shadow-stone-200/60 overflow-hidden'>
                    <div className='px-4 py-3 border-b border-stone-100 flex items-center justify-between'>
                      <p className='text-xs font-semibold uppercase tracking-[0.1em] text-stone-500'>Recently Viewed</p>
                      <button onClick={() => setRecentlyViewedOpen(false)} className='text-stone-400 hover:text-stone-600'>
                        <X className='h-3.5 w-3.5' />
                      </button>
                    </div>
                    {recentlyViewed.length === 0 ? (
                      <div className='px-4 py-8 text-center text-sm text-stone-400'>Nothing viewed yet</div>
                    ) : (
                      <div className='max-h-80 overflow-y-auto divide-y divide-stone-50'>
                        {recentlyViewed.map(item => {
                          const itemId = getRecentlyViewedId(item);
                          if (!itemId) return null;
                          return (
                            <Link
                              key={itemId}
                              href={`/products/${item.urlSlug || itemId}`}
                              onClick={() => setRecentlyViewedOpen(false)}
                              className='flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors'>
                              <div className='h-11 w-11 rounded-lg overflow-hidden bg-stone-100 shrink-0'>
                                <img src={item.image || '/placeholder.jpg'} alt={item.name || ''} className='h-full w-full object-cover' />
                              </div>
                              <p className='text-sm font-medium text-stone-700 line-clamp-2'>{item.name || item.title || 'Product'}</p>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Custom Jewellery */}
              <Link
                href='/custom-jewellery'
                className='hidden sm:flex h-10 items-center gap-1.5 px-3 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors text-sm font-medium'
                aria-label='Custom jewellery'>
                <Store className='h-4.5 w-4.5 h-5 w-5 shrink-0' />
                <span className='hidden md:inline text-xs'>Custom</span>
              </Link>

              <div className='w-px h-6 bg-stone-200 mx-1 hidden sm:block' />

              {/* Wishlist */}
              <button
                type='button'
                onClick={() => {
                  if (!isLoggedIn) {
                    window.dispatchEvent(new Event('openLoginModal'));
                    return;
                  }
                  router.push('/wishlist');
                }}
                className='relative flex h-10 w-10 items-center justify-center rounded-xl text-stone-500 hover:bg-rose-50 hover:text-rose-500 transition-colors'
                aria-label='Wishlist'>
                <Heart className='h-5 w-5' />
                {wishlistCount > 0 && (
                  <span className='absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 h-5 min-w-5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1'>
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                type='button'
                onClick={() => {
                  if (!isLoggedIn) {
                    window.dispatchEvent(new Event('openLoginModal'));
                    return;
                  }
                  router.push('/cart');
                }}
                className='relative flex h-10 w-10 items-center justify-center rounded-xl text-stone-500 hover:bg-amber-50 hover:text-amber-600 transition-colors'
                aria-label='Cart'>
                <ShoppingCart className='h-5 w-5' />
                {cartCount > 0 && (
                  <span className='absolute -top-0.5 -right-0.5 h-5 min-w-5 flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold px-1'>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Navigation Bar ─────────────────────────────────────────────────── */}
        <div className='hidden lg:block border-t border-stone-100' onMouseLeave={() => setOpenDropdown(null)}>
          <div className='mx-auto max-w-[1440px] px-8'>
            <div className='flex items-center justify-between'>
              {/* Category Nav */}
              <div className='flex items-center overflow-x-auto scrollbar-hide'>
                {categoriesLoading ? (
                  <span className='px-4 py-3.5 text-sm text-stone-400'>Loading…</span>
                ) : (
                  categories.map(category => (
                    <button
                      key={category._id}
                      onMouseEnter={() => setOpenDropdown(category._id)}
                      onClick={() => setOpenDropdown(p => (p === category._id ? null : category._id))}
                      className={`group relative flex items-center gap-1 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors
                        ${openDropdown === category._id ? 'text-amber-700' : 'text-stone-600 hover:text-stone-900'}`}>
                      {category.name}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${openDropdown === category._id ? 'rotate-180' : ''}`}
                      />
                      {/* Active underline */}
                      <span
                        className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-amber-500 transition-all duration-200 ${openDropdown === category._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}
                      />
                    </button>
                  ))
                )}
              </div>

              {/* Right side: Gold Rate + Custom */}
              <div className='flex items-center gap-2 shrink-0'>
                <Link
                  href='/custom-jewellery'
                  className='flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors'>
                  <Store className='h-3.5 w-3.5' /> Custom Jewellery
                </Link>

                {/* Gold Rate Dropdown */}
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
                    if (liveRateCloseTimeoutRef.current) window.clearTimeout(liveRateCloseTimeoutRef.current);
                    liveRateCloseTimeoutRef.current = window.setTimeout(() => setLiveRateOpen(false), 200);
                  }}>
                  <button
                    onClick={() => setLiveRateOpen(p => !p)}
                    className='flex items-center gap-1.5 px-3 py-2 cursor-pointer rounded-xl text-xs font-medium text-amber-700 bg-[#a05a64]/10 hover:bg-[#a05a64]/20 transition-colors'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#a05a64]/80 animate-pulse' />
                    Gold Rate
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${liveRateOpen ? 'rotate-180' : ''}`} />
                  </button>
                 {liveRateOpen && (
  <div
    className="absolute right-0 top-full mt-3 w-80 z-50 animate-dropdownFade"
  >
    <div className="rounded-2xl border border-[#a05a64]/20 bg-white/70 backdrop-blur-xl 
    shadow-[0_10px_40px_rgba(160,90,100,0.25)] overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r 
      from-[#a05a64]/10 via-white/40 to-[#a05a64]/5 
      border-b border-[#a05a64]/20">
        <p className="text-[11px] font-semibold text-[#a05a64] uppercase tracking-[0.15em]">
          Live Metal Rates
        </p>
      </div>

      {/* Content */}
      <div className="py-3 px-4 space-y-2">
        {renderGoldRatesRows()}
      </div>

      {/* Footer */}
      <div className="px-4 py-1 border-t border-[#a05a64]/20 bg-white/40 backdrop-blur-sm">
        {renderGoldRatesUpdatedFooter()}
      </div>
    </div>
  </div>
)}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Mega Menu ────────────────────────────────────────────────────── */}
          {openDropdown &&
            (() => {
              const activeCategory = categories.find(c => c._id === openDropdown);
              if (!activeCategory) return null;
              const subcategories = Array.isArray(activeCategory.children) ? activeCategory.children : [];
              const occasions = Array.isArray(activeCategory.occasions) ? activeCategory.occasions : [];
              return (
                <div className='absolute left-0 right-0 z-40 border-t border-stone-100 bg-white shadow-2xl shadow-stone-200/40'>
                  <div className='mx-auto max-w-[1440px] px-8 py-8 grid grid-cols-[1.2fr_1fr_1fr] gap-10'>
                    {/* Category Info */}
                    <div>
                      <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600'>Collection</p>
                      <h3 className='mt-1.5 text-2xl font-semibold text-stone-900'>{activeCategory.name}</h3>
                      {activeCategory.shortDescription && (
                        <p className='mt-2 text-sm text-stone-500 leading-relaxed'>{activeCategory.shortDescription}</p>
                      )}
                      <Link
                        href={`/jewellery?category=${encodeURIComponent(activeCategory.slug || activeCategory.name)}`}
                        className='mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors group'>
                        View all {activeCategory.name}
                        <ArrowRight className='h-4 w-4 group-hover:translate-x-0.5 transition-transform' />
                      </Link>
                      {subcategories.length > 0 && (
                        <div className='mt-5 grid grid-cols-2 gap-x-4 gap-y-2'>
                          {subcategories.map(sub => (
                            <Link
                              key={sub._id}
                              href={`/jewellery?category=${encodeURIComponent(sub.slug || sub.name)}`}
                              className='text-sm text-stone-500 hover:text-stone-900 hover:translate-x-0.5 transition-all'>
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Occasions */}
                    <div>
                      <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-3'>By Occasion</p>
                      {occasions.length > 0 ? (
                        <div className='grid grid-cols-2 gap-2'>
                          {occasions.map((occasion, i) => (
                            <Link
                              key={`${occasion.name}-${i}`}
                              href={
                                occasion.productId
                                  ? `/products/${occasion.productId}`
                                  : `/jewellery?search=${encodeURIComponent(occasion.name)}`
                              }
                              className='flex items-center gap-2.5 rounded-xl p-2 border border-transparent hover:border-amber-100 hover:bg-amber-50 transition-all group'>
                              <div className='h-10 w-10 rounded-lg overflow-hidden bg-stone-100 shrink-0 flex items-center justify-center text-xs font-semibold text-stone-400'>
                                {occasion.image ? (
                                  <img src={occasion.image} alt={occasion.name} className='h-full w-full object-cover' />
                                ) : (
                                  occasion.name.charAt(0)
                                )}
                              </div>
                              <span className='text-sm font-medium text-stone-700 group-hover:text-amber-800 transition-colors leading-tight'>
                                {occasion.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className='text-sm text-stone-400'>No occasions configured.</p>
                      )}
                    </div>

                    {/* Featured Product */}
                    <div>
                      <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-3'>Featured</p>
                      {megaMenuLoading ? (
                        <div className='rounded-2xl bg-stone-50 border border-stone-100 h-56 animate-pulse' />
                      ) : megaMenuProduct ? (
                        <Link
                          href={`/products/${megaMenuProduct.urlSlug || megaMenuProduct._id}`}
                          className='group block rounded-2xl border border-stone-100 overflow-hidden hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/40 transition-all'>
                          <div className='aspect-[4/3] overflow-hidden bg-stone-50'>
                            <img
                              src={megaMenuProduct.mainImage || '/placeholder.jpg'}
                              alt={megaMenuProduct.name}
                              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                            />
                          </div>
                          <div className='p-4'>
                            <p className='text-sm font-semibold text-stone-900'>{megaMenuProduct.name}</p>
                            {megaMenuProduct.shortDescription && (
                              <p className='mt-1 text-xs text-stone-400 line-clamp-2'>{megaMenuProduct.shortDescription}</p>
                            )}
                            <p className='mt-3 text-xs font-semibold text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all'>
                              View product <ArrowRight className='h-3.5 w-3.5' />
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <div className='rounded-2xl border border-dashed border-stone-200 p-6 text-sm text-stone-400 text-center'>
                          No featured product selected.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
        </div>
      </header>

      {/* ─── Auth Modals ─────────────────────────────────────────────────────── */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onSwitchMode={handleSwitchMode}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
      />
      <ForgotPasswordModal
        open={forgotPasswordModalOpen}
        onOpenChange={handleForgotPasswordModalOpenChange}
        onSwitchToLogin={handleForgotSwitchToLogin}
        tokenExpired={forgotTokenExpired}
      />
    </>
  );
};

export default HomeHeader;
export { HomeHeader };
