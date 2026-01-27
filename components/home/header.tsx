import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Phone, MapPin, Heart, ShoppingCart, ChevronDown, Clock, Store, LogOut, User } from 'lucide-react';
import { AuthModal } from '@/components/auth/auth-modal';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRouter } from 'next/navigation';
import { SearchDialog } from '@/components/home/SearchBar/SearchDialog';

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
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [megaMenuProduct, setMegaMenuProduct] = useState<MegaMenuProduct | null>(null);
  const [megaMenuLoading, setMegaMenuLoading] = useState(false);

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
            <Link href='/become-vendor' className='flex items-center gap-1 text-[#3579b8] hover:text-gray-900'>
              <User className='w-4 h-4' />
              <span>Become Member</span>
            </Link>
            <span className='h-3 w-px bg-gray-500'></span>
            {isLoggedIn ? (
              <>
                <div className='flex items-center gap-2'>
                  <User className='w-4 h-4 text-[#3579b8]' />
                  <span className='text-[#3579b8] font-medium'>{customerName}</span>
                </div>
                <span className='h-3 w-px bg-gray-500'></span>
                <button onClick={handleLogout} className='text-[#3579b8] hover:text-gray-900 flex items-center gap-1'>
                  <LogOut className='w-4 h-4' />
                  <span>Logout</span>
                </button>
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
            <span className='text-2xl font-bold text-[#001e38] tracking-wide'>Jewellery</span>
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
                className='absolute right-0 top-0 h-full border-l-0 border-3 border-[#e4e4e4] px-6 bg-emerald-400 hover:bg-[#ff5533] text-white'>
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
            <button className='flex items-center gap-2 text-gray-600 hover:text-[#001e38]'>
              <Clock className='w-6 h-6' />
              <span className='text-xs max-w-[60px] text-left'>Recently Viewed</span>
            </button>

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
                <span className='absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-semibold text-white'>
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
                <span className='absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-semibold text-white'>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Sticky */}
      <div
        className={`bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900
 text-white transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''}`}
        onMouseLeave={() => setOpenDropdown(null)}>
        <div className='max-w-[1440px] mx-auto relative'>
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

            {/* All Jewellery */}
            <Link href='/jewellery' className='px-6 py-4 text-sm font-medium hover:bg-[#002e50]'>
              Shop All Jewellery
            </Link>
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
