'use client';

import { Diamond, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import SearchBar from './SearchBar/SearchBar';
import Link from 'next/link';
import { useState, useEffect, useRef, useContext } from 'react';
import { CategoriesContext } from '@/contexts/CategoriesContext';

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

// Menu items with submenus for jewelry e-commerce
const menuItems = [
  { name: 'Home', href: '/' },
  {
    name: 'Shop',
    href: '#shop',
    submenu: ['All Jewelry', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Anklets', 'Brooches'],
  },
  {
    name: 'Collections',
    href: '#collections',
    submenu: ['New Arrivals', 'Best Sellers', 'Limited Edition', 'Vintage Collection', 'Custom Designs'],
  },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
];

export function HomeHeader() {
  // Get categories context if available (only on home page)
  const categoriesContext = useContext(CategoriesContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 1024);
    }
  }, []);

  // Handle resize and close menus
  useEffect(() => {
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
  }, [categoriesContext]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <header className='bg-white sticky top-0 z-50 shadow-sm'>
      {/* Top bar with logo, search, and account/cart */}
      <div className='mx-auto mb-2 sm:mb-3 md:mb-4 flex w-full max-w-[1400px] items-center justify-between gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-2.5 md:py-3 pt-3 sm:pt-4 md:pt-6 lg:pt-8'>
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
          <button
            className='flex items-center gap-0.5 sm:gap-1 font-semibold px-1 sm:px-1.5 md:px-2 transition-all duration-300 hover:scale-110 active:scale-95 whitespace-nowrap'
            aria-label='Account'>
            <User size={15} className='sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0' />
            <span className='hidden sm:inline text-xs sm:text-sm whitespace-nowrap'>Your Account</span>
          </button>
          <button
            className='flex items-center gap-1 sm:gap-1.5 font-semibold px-1 sm:px-1.5 md:px-2 transition-all duration-300 hover:scale-110 active:scale-95 relative'
            aria-label='Cart'>
            <div className='relative flex-shrink-0'>
              <ShoppingCart size={15} className='sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] text-[#1F3B29]' />
              <span className='absolute -top-1 -right-1 bg-[#C8A15B] text-white text-[9px] sm:text-[10px] font-bold rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center shadow-sm leading-none'>
                0
              </span>
            </div>
            <span className='hidden sm:inline text-xs sm:text-sm whitespace-nowrap text-[#1F3B29]'>Your Cart</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className='sm:hidden px-4 sm:px-6 pb-2 sm:pb-3'>
        <SearchBar />
      </div>

      {/* Navigation Menu Bar - Exact style from hero section */}
      <nav className='w-full bg-[#1F3B29] text-white duration-700 relative'>
        <div className='mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-2.5 md:py-3 lg:py-4'>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-95'
            aria-label='Menu'>
            {mobileMenuOpen ? <X size={20} className='text-white' /> : <Menu size={20} className='text-white' />}
          </button>

          {/* Desktop Categories Button */}
          <div className='hidden md:flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-8 min-w-0 flex-1'>
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
              className='flex w-auto md:w-[200px] lg:w-[270px] items-center gap-1.5 md:gap-2 cursor-pointer transition-all duration-300 hover:bg-white/10 active:scale-95 px-3 md:px-4 py-2 rounded-lg font-medium flex-shrink-0 group'
              aria-label='Categories'>
              <Grid2x2CheckIcon
                size={17}
                className='md:w-[17px] md:h-[17px] lg:w-[18px] lg:h-[18px] flex-shrink-0 transition-transform duration-300 group-hover:rotate-90'
              />
              <span className='text-xs md:text-sm whitespace-nowrap'>Categories</span>
            </button>

            <ul className='hidden lg:flex items-center gap-1 lg:gap-2 xl:gap-3 text-xs md:text-sm' ref={dropdownRef}>
              {menuItems.map((item, index) => (
                <li
                  key={item.name}
                  className='relative'
                  onMouseEnter={() => item.submenu && setOpenDropdown(item.name)}
                  onMouseLeave={() => item.submenu && setOpenDropdown(null)}
                  style={{ animationDelay: `${index * 100}ms` }}>
                  <a
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
        absolute bottom-0 left-0 right-0 
        h-[2px] bg-white 
        scale-x-0 origin-left
        group-hover:scale-x-100 
        transition-transform duration-300
      '
                    />
                  </a>

                  {/* Dropdown Menu */}
                  {item.submenu && openDropdown === item.name && (
                    <div
                      className='
        absolute top-full left-0 mt-2 w-56
        bg-white rounded-lg shadow-xl
        border border-gray-100 py-2 z-50
        animate-in fade-in slide-in-from-top-2 duration-200
      '>
                      {item.submenu.map(subItem => (
                        <a
                          key={subItem}
                          href={`#${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                          className='
              block px-4 py-2.5 text-sm text-[#1F3B29]
              hover:bg-[#F5EEE5]/60
              transition-colors duration-200
              font-medium
            '
                          onClick={() => setOpenDropdown(null)}>
                          {subItem}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
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
              {menuItems.map(item => (
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
                          {item.submenu.map(subItem => (
                            <li key={subItem}>
                              <a
                                href={`#${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setOpenDropdown(null);
                                }}
                                className='block px-4 py-2 rounded-lg text-sm font-normal transition-all duration-300 hover:bg-white/10 hover:translate-x-2 active:bg-white/15 text-white/90'>
                                {subItem}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className='block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:translate-x-2 active:bg-white/15'>
                      {item.name}
                    </a>
                  )}
                </li>
              ))}
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
  );
}
