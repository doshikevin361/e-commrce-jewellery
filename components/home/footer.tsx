'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Youtube, Instagram, Linkedin } from 'lucide-react';

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

interface FooterSocialLinks {
  facebook: string;
  twitter: string;
  youtube: string;
  instagram: string;
  linkedin: string;
}

const emptySocial: FooterSocialLinks = {
  facebook: '',
  twitter: '',
  youtube: '',
  instagram: '',
  linkedin: '',
};

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
  const [socialLinks, setSocialLinks] = useState<FooterSocialLinks>(emptySocial);
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

    const fetchFooterSocial = async () => {
      try {
        const response = await fetch('/api/public/footer-social', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        setSocialLinks({
          facebook: typeof data.facebook === 'string' ? data.facebook : '',
          twitter: typeof data.twitter === 'string' ? data.twitter : '',
          youtube: typeof data.youtube === 'string' ? data.youtube : '',
          instagram: typeof data.instagram === 'string' ? data.instagram : '',
          linkedin: typeof data.linkedin === 'string' ? data.linkedin : '',
        });
      } catch {
        setSocialLinks(emptySocial);
      }
    };

    fetchFooterPages();
    fetchFooterSearches();
    fetchFooterSocial();
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
      return <p className='text-muted-foreground text-sm'>Loading...</p>;
    }
    if (!searches || searches.length === 0) {
      return null;
    }
    return (
      <p className='text-web/80 text-sm leading-relaxed'>
        {searches.map((search, index) => (
          <React.Fragment key={index}>
            <Link href={search.url} className='hover:underline hover:text-theme-secondary transition-colors'>
              {search.name}
            </Link>
            {index < searches.length - 1 && ' | '}
          </React.Fragment>
        ))}
      </p>
    );
  };

  const hasAnySocial =
    [socialLinks.facebook, socialLinks.twitter, socialLinks.youtube, socialLinks.instagram, socialLinks.linkedin].some(
      (u) => typeof u === 'string' && u.trim().length > 0
    );

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
    <footer className='bg-web text-white'>
      {/* Main Footer Content */}
      <div className='mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12'>
          {/* About Us + Customer Delight */}
          <div>
            <h3 className='text-sm font-semibold mb-4 tracking-wide'>{SECTION_LABELS.about}</h3>
            {renderSectionLinks('about')}
            <ul className='space-y-2.5 mt-2'>
              <li>
                <Link href='/partner-stores' className='text-gray-300 hover:text-white text-sm transition-colors'>
                  Partner Stores
                </Link>
              </li>
            </ul>

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
        <div className='mt-10 border-t border-white/15 pt-6 sm:mt-12 sm:pt-8'>
          <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
            <form onSubmit={handleSubscribe} className='flex flex-col gap-2'>
            <div className='flex flex-col items-stretch gap-3 sm:flex-row sm:items-center'>
              <input
                type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter email for our newsletter'
                className='w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white/85 placeholder:text-white/50 backdrop-blur focus:border-[color-mix(in_srgb,var(--theme-secondary)_55%,transparent)] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-theme-primary sm:w-72'
                  disabled={subscribing}
                />
                <button 
                  type='submit'
                  disabled={subscribing}
                  className='rounded-lg bg-theme-secondary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:brightness-[0.98] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50'
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

            <div className='flex flex-wrap items-center gap-4 sm:gap-6'>
              {hasAnySocial && (
                <>
                  <span className='text-sm text-gray-400'>Follow us on</span>
                  <div className='flex items-center gap-3 sm:gap-4'>
                    {socialLinks.facebook.trim() && (
                      <a
                        href={socialLinks.facebook.trim()}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-gray-300 hover:text-white transition-colors'
                        aria-label='Facebook'
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                    {socialLinks.twitter.trim() && (
                      <a
                        href={socialLinks.twitter.trim()}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-gray-300 hover:text-white transition-colors'
                        aria-label='X (Twitter)'
                      >
                        <Twitter size={20} />
                      </a>
                    )}
                    {socialLinks.youtube.trim() && (
                      <a
                        href={socialLinks.youtube.trim()}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-gray-300 hover:text-white transition-colors'
                        aria-label='YouTube'
                      >
                        <Youtube size={20} />
                      </a>
                    )}
                    {socialLinks.instagram.trim() && (
                      <a
                        href={socialLinks.instagram.trim()}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-gray-300 hover:text-white transition-colors'
                        aria-label='Instagram'
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {socialLinks.linkedin.trim() && (
                      <a
                        href={socialLinks.linkedin.trim()}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-gray-300 hover:text-white transition-colors'
                        aria-label='LinkedIn'
                      >
                        <Linkedin size={20} />
                      </a>
                    )}
                  </div>
                </>
              )}

              <div className={`ml-0 flex items-center gap-2 ${hasAnySocial ? 'sm:ml-4' : ''}`}>
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

          <div className='mt-6 text-center md:text-right'>
            <p className='text-xs text-gray-400'>© 2025. All Rights Reserved.</p>
            <p className='text-xs text-gray-400'>CIN: L72900KA2011DSFS59678</p>
          </div>
        </div>
      </div>

      <div className='bg-background'>
        <div className='mx-auto max-w-[1440px] px-4 py-8 sm:px-6'>
          {/* Popular Searches */}
          {footerSearches.popularSearches.length > 0 && (
            <>
          <div className='mb-8'>
            <h4 className='mb-3 font-serif text-lg font-semibold text-web'>Popular Searches</h4>
                {renderSearchLinks(footerSearches.popularSearches)}
          </div>
          <hr className='border-gray-300 my-6' />
            </>
          )}

          {/* Top Searches in Gold Jewellery */}
          {footerSearches.goldSearches.length > 0 && (
            <>
          <div className='mb-8'>
            <h4 className='mb-3 font-serif text-lg font-semibold text-web'>Top Searches in Gold Jewellery</h4>
                {renderSearchLinks(footerSearches.goldSearches)}
          </div>
          <hr className='border-gray-300 my-6' />
            </>
          )}

          {/* Top Searches in Diamond Jewellery */}
          {footerSearches.diamondSearches.length > 0 && (
            <>
          <div className='mb-8'>
            <h4 className='mb-3 font-serif text-lg font-semibold text-web'>Top Searches in Diamond Jewellery</h4>
                {renderSearchLinks(footerSearches.diamondSearches)}
          </div>
          <hr className='border-gray-300 my-6' />
            </>
          )}

          {/* Men's Jewellery Collection */}
          {footerSearches.mensSearches.length > 0 && (
            <>
          <div className='mb-8'>
            <h4 className='mb-3 font-serif text-lg font-semibold text-web'>Men&apos;s Jewellery Collection</h4>
                {renderSearchLinks(footerSearches.mensSearches)}
          </div>
          <hr className='border-gray-300 my-6' />
            </>
          )}

          {/* Women's Jewellery Collection */}
          {footerSearches.womensSearches.length > 0 && (
            <>
          <div className='mb-8'>
            <h4 className='mb-3 font-serif text-lg font-semibold text-web'>Women&apos;s Jewellery Collection</h4>
                {renderSearchLinks(footerSearches.womensSearches)}
          </div>
          <hr className='border-gray-300 my-6' />
            </>
          )}

          {/* Jewellery by Occasion */}
          {footerSearches.occasionSearches.length > 0 && (
          <div>
              <h4 className='mb-3 font-serif text-lg font-semibold text-web'>Jewellery by Occasion</h4>
              {renderSearchLinks(footerSearches.occasionSearches)}
          </div>
          )}
        </div>
      </div>
    </footer>
  );
}
