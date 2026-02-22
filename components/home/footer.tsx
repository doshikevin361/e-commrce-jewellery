'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Youtube, Instagram } from 'lucide-react';

type FooterPageType = 'about' | 'policies' | 'jewellery-guide' | 'customer-delight';

interface FooterPageLink {
  _id: string;
  pageName: string;
  slug: string;
  pageType: FooterPageType;
}

const SECTION_LABELS: Record<FooterPageType, string> = {
  about: 'ABOUT US',
  policies: 'POLICIES',
  'jewellery-guide': 'JEWELLERY GUIDE',
  'customer-delight': 'CUSTOMER DELIGHT',
};

interface FooterSearch {
  name: string;
  url: string;
}

interface FooterSearchesData {
  popularSearches: FooterSearch[];
  goldSearches: FooterSearch[];
  diamondSearches: FooterSearch[];
  mensSearches: FooterSearch[];
  womensSearches: FooterSearch[];
  occasionSearches: FooterSearch[];
}

export default function Footer() {
  const [footerPages, setFooterPages] = useState<FooterPageLink[]>([]);
  const [loadingFooterPages, setLoadingFooterPages] = useState(true);
  const [footerSearches, setFooterSearches] = useState<FooterSearchesData>({
    popularSearches: [],
    goldSearches: [],
    diamondSearches: [],
    mensSearches: [],
    womensSearches: [],
    occasionSearches: [],
  });
  const [loadingSearches, setLoadingSearches] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchFooterPages = async () => {
      try {
        setLoadingFooterPages(true);
        const response = await fetch('/api/public/footer-pages', { cache: 'no-store' });
        if (!response.ok) {
          setFooterPages([]);
          return;
        }
        const data = await response.json();
        setFooterPages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('[v0] Failed to fetch footer pages:', error);
        setFooterPages([]);
      } finally {
        setLoadingFooterPages(false);
      }
    };

    const fetchFooterSearches = async () => {
      try {
        setLoadingSearches(true);
        const response = await fetch('/api/public/footer-searches', { cache: 'no-store' });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setFooterSearches({
          popularSearches: data.popularSearches || [],
          goldSearches: data.goldSearches || [],
          diamondSearches: data.diamondSearches || [],
          mensSearches: data.mensSearches || [],
          womensSearches: data.womensSearches || [],
          occasionSearches: data.occasionSearches || [],
        });
      } catch (error) {
        console.error('[v0] Failed to fetch footer searches:', error);
      } finally {
        setLoadingSearches(false);
      }
    };

    fetchFooterPages();
    fetchFooterSearches();
  }, [pathname]);

  const sectionLinks = useMemo(() => {
    const grouped: Record<FooterPageType, FooterPageLink[]> = {
      about: [],
      policies: [],
      'jewellery-guide': [],
      'customer-delight': [],
    };
    footerPages.forEach(page => {
      if (grouped[page.pageType]) {
        grouped[page.pageType].push(page);
      }
    });
    return grouped;
  }, [footerPages]);

  const renderSectionLinks = (section: FooterPageType) => {
    const items = sectionLinks[section];
    if (loadingFooterPages) {
      return <p className='text-sm text-gray-400'>Loading...</p>;
    }
    if (!items || items.length === 0) {
      return <p className='text-sm text-gray-400'>No pages yet.</p>;
    }
    return (
      <ul className='space-y-2.5'>
        {items.map(item => (
          <li key={item._id}>
            <Link href={`/footer/${item.slug}`} className='text-gray-300 hover:text-white text-sm transition-colors'>
              {item.pageName}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  const renderSearchLinks = (searches: FooterSearch[]) => {
    if (loadingSearches) {
      return <p className='text-[#2c3e6f] text-sm'>Loading...</p>;
    }
    if (!searches || searches.length === 0) {
      return null;
    }
    return (
      <p className='text-[#2c3e6f] text-sm leading-relaxed'>
        {searches.map((search, index) => (
          <React.Fragment key={index}>
            <Link href={search.url} className='hover:underline'>
              {search.name}
            </Link>
            {index < searches.length - 1 && ' | '}
          </React.Fragment>
        ))}
      </p>
    );
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSubscribeMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    setSubscribing(true);
    setSubscribeMessage(null);

    try {
      const response = await fetch('/api/public/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribeMessage({ type: 'success', text: data.message || 'Successfully subscribed to newsletter!' });
        setEmail('');
        // Clear message after 5 seconds
        setTimeout(() => {
          setSubscribeMessage(null);
        }, 5000);
      } else {
        setSubscribeMessage({ type: 'error', text: data.error || 'Failed to subscribe. Please try again.' });
      }
    } catch (error) {
      console.error('[v0] Newsletter subscription error:', error);
      setSubscribeMessage({ type: 'error', text: 'An error occurred. Please try again later.' });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className='bg-web text-slate-300 text-white'>
      {/* Main Footer Content */}
      <div className='max-w-[1440px] mx-auto px-6 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12'>
          {/* About Us + Customer Delight */}
          <div>
            <h3 className='text-sm font-semibold mb-4 tracking-wide'>{SECTION_LABELS.about}</h3>
            {renderSectionLinks('about')}

            <h3 className='text-sm font-semibold mt-8 mb-4 tracking-wide'>{SECTION_LABELS['customer-delight']}</h3>
            {renderSectionLinks('customer-delight')}
          </div>

          {/* Policies Section */}
          <div>
            <h3 className='text-sm font-semibold mb-4 tracking-wide'>{SECTION_LABELS.policies}</h3>
            {renderSectionLinks('policies')}

            {/* <h3 className='text-sm font-semibold mt-8 mb-4 tracking-wide'>SHOP WITH CONFIDENCE</h3>
            <ul className='space-y-2.5'>
              <li>
                <a href='#' className='text-gray-300 hover:text-white text-sm transition-colors'>
                  Why Buy From Us?
                </a>
              </li>
              <li>
                <a href='#' className='text-gray-300 hover:text-white text-sm transition-colors'>
                  Our Certifications
                </a>
              </li>
              <li>
                <a href='#' className='text-gray-300 hover:text-white text-sm transition-colors'>
                  Press Room
                </a>
              </li>
              <li>
                <a href='#' className='text-gray-300 hover:text-white text-sm transition-colors'>
                  Testimonials
                </a>
              </li>
              <li className='pt-2'>
                <a href='#' className='text-gray-300 hover:text-white text-sm transition-colors'>
                  Corporate Gifting
                </a>
              </li>
            </ul> */}
          </div>

          {/* Jewellery Guide Section */}
          <div>
            <h3 className='text-sm font-semibold mb-4 tracking-wide'>{SECTION_LABELS['jewellery-guide']}</h3>
            {renderSectionLinks('jewellery-guide')}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className='mt-12 pt-8 border-t border-gray-600'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
            <form onSubmit={handleSubscribe} className='flex flex-col gap-2'>
            <div className='flex items-center gap-3'>
              <input
                type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter email for our newsletter'
                className='bg-transparent border border-gray-500 px-4 py-2.5 text-sm text-gray-300 placeholder-gray-400 focus:outline-none focus:border-gray-400 w-64'
                  disabled={subscribing}
                />
                <button 
                  type='submit'
                  disabled={subscribing}
                  className='bg-theme-secondary px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {subscribing ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
                </button>
            </div>
              {subscribeMessage && (
                <p className={`text-xs ${subscribeMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {subscribeMessage.text}
                </p>
              )}
            </form>

            <div className='flex items-center gap-6'>
              <span className='text-sm text-gray-400'>Follow us on</span>
              <div className='flex items-center gap-4'>
                <a href='#' className='text-gray-300 hover:text-white transition-colors'>
                  <Facebook size={20} />
                </a>
                <a href='#' className='text-gray-300 hover:text-white transition-colors'>
                  <Twitter size={20} />
                </a>
                <a href='#' className='text-gray-300 hover:text-white transition-colors'>
                  <Youtube size={20} />
                </a>
                <a href='#' className='text-gray-300 hover:text-white transition-colors'>
                  <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                  </svg>
                </a>
              </div>

              <div className='flex items-center gap-2 ml-4'>
                <div className='bg-white rounded px-2 py-1'>
                  <span className='text-[#2c3e6f] font-bold text-xs'>VISA</span>
                </div>
                <div className='bg-white rounded px-2 py-1'>
                  <span className='text-[#2c3e6f] font-bold text-xs'>MC</span>
                </div>
                <div className='bg-white rounded px-2 py-1'>
                  <span className='text-[#2c3e6f] font-bold text-xs'>AMEX</span>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-6 text-right'>
            <p className='text-xs text-gray-400'>© 2025. All Rights Reserved.</p>
            <p className='text-xs text-gray-400'>CIN: L72900KA2011DSFS59678</p>
          </div>
        </div>
      </div>

      <div className='bg-white'>
        <div className='max-w-[1440px] mx-auto px-6 py-8'>
          {/* Popular Searches */}
          {footerSearches.popularSearches.length > 0 && (
            <>
          <div className='mb-8'>
            <h4 className='text-[#2c3e6f] font-semibold text-base mb-3'>Popular Searches</h4>
                {renderSearchLinks(footerSearches.popularSearches)}
          </div>
          <hr className='border-gray-300 my-6' />
            </>
          )}

          {/* Top Searches in Gold Jewellery */}
          {footerSearches.goldSearches.length > 0 && (
            <>
          <div className='mb-8'>
            <h4 className='text-[#2c3e6f] font-semibold text-base mb-3'>Top Searches in Gold Jewellery</h4>
                {renderSearchLinks(footerSearches.goldSearches)}
          </div>
          <hr className='border-gray-300 my-6' />
            </>
          )}

          {/* Top Searches in Diamond Jewellery */}
          {footerSearches.diamondSearches.length > 0 && (
            <>
          <div className='mb-8'>
            <h4 className='text-[#2c3e6f] font-semibold text-base mb-3'>Top Searches in Diamond Jewellery</h4>
                {renderSearchLinks(footerSearches.diamondSearches)}
          </div>
          <hr className='border-gray-300 my-6' />
            </>
          )}

          {/* Men's Jewellery Collection */}
          {footerSearches.mensSearches.length > 0 && (
            <>
          <div className='mb-8'>
            <h4 className='text-[#2c3e6f] font-semibold text-base mb-3'>Men's Jewellery Collection</h4>
                {renderSearchLinks(footerSearches.mensSearches)}
          </div>
          <hr className='border-gray-300 my-6' />
            </>
          )}

          {/* Women's Jewellery Collection */}
          {footerSearches.womensSearches.length > 0 && (
            <>
          <div className='mb-8'>
            <h4 className='text-[#2c3e6f] font-semibold text-base mb-3'>Women's Jewellery Collection</h4>
                {renderSearchLinks(footerSearches.womensSearches)}
          </div>
          <hr className='border-gray-300 my-6' />
            </>
          )}

          {/* Jewellery by Occasion */}
          {footerSearches.occasionSearches.length > 0 && (
          <div>
              <h4 className='text-[#2c3e6f] font-semibold text-base mb-3'>Jewellery by Occasion</h4>
              {renderSearchLinks(footerSearches.occasionSearches)}
          </div>
          )}
        </div>
      </div>
    </footer>
  );
}
