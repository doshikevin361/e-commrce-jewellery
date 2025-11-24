'use client';

import { Mail, Phone, Globe, Twitter, Linkedin, Instagram, Facebook, Youtube } from 'lucide-react';

const FooterSection = ({ title, items }: { title: string; items: { label: string; href: string }[] }) => (
  <div>
    <h3 className='mb-4 font-semibold text-[#1C1F1A]'>{title}</h3>
    <ul className='space-y-2'>
      {items.map(item => (
        <li key={item.label}>
          <a href={item.href} className='text-sm text-[#4F3A2E] transition hover:text-[#1C1F1A]'>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const FooterPaymentItem = ({ children }: { children: React.ReactNode }) => (
  <div className='flex items-center rounded border border-[#E6D3C2] bg-white px-3 py-1.5 text-xs uppercase text-[#1F3B29]'>{children}</div>
);

export function HomeFooter() {
  const footerData = [
    {
      title: 'Quick Links',
      items: [
        { label: 'Home', href: '/' },
        { label: 'Shop', href: '#shop' },
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Customer Service',
      items: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'Shipping Policy', href: '/shipping-policy' },
        { label: 'Refund & Return', href: '/refund-and-return' },
        { label: 'Cancellation Policy', href: '/cancellation-policy' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms & Conditions', href: '/terms-and-conditions' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', href: '/contact' },
        { label: 'FAQs', href: '/contact' },
        { label: 'Track Order', href: '/contact' },
      ],
    },
  ];

  const socialIcons = [
    { id: 'twitter', icon: <Twitter size={18} /> },
    { id: 'linkedin', icon: <Linkedin size={18} /> },
    { id: 'instagram', icon: <Instagram size={18} /> },
    { id: 'facebook', icon: <Facebook size={18} /> },
    { id: 'youtube', icon: <Youtube size={18} /> },
  ];

  return (
    <footer className='bg-white'>
      <div className='mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12'>
        <div className='flex flex-col gap-8 sm:gap-10 lg:flex-row lg:items-start lg:justify-between'>
          <div className='w-full sm:w-auto'>
            <div className='mb-4 sm:mb-5 md:mb-6 flex items-center gap-2'>
              <div className='flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded bg-[#1F3B29]'>
                <span className='text-white text-base sm:text-lg md:text-xl'>✤</span>
              </div>
              <h2 className='text-lg sm:text-xl font-semibold text-[#1F3B29]'>LuxeLoom</h2>
            </div>

            <div className='space-y-2 sm:space-y-3 text-[#1C1F1A]'>
              <div className='flex items-center gap-3 sm:gap-4'>
                <Mail size={16} className='sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px] flex-shrink-0' />
                <span className='text-xs sm:text-sm font-semibold break-all'>oripiostudio@gmail.com</span>
              </div>
              <div className='flex items-center gap-3 sm:gap-4'>
                <Phone size={16} className='sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px] flex-shrink-0' />
                <span className='text-xs sm:text-sm font-semibold'>+8801701253995</span>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:flex lg:flex-row gap-6 sm:gap-8 md:gap-12 lg:gap-16 xl:gap-20'>
            {footerData.map(section => (
              <FooterSection key={section.title} title={section.title} items={section.items} />
            ))}
          </div>
        </div>

        <div className='my-6 sm:my-7 md:my-8 border-t border-[#1F3B29]/20' />

        <div className='flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between'>
          <span className='text-[10px] sm:text-xs font-semibold tracking-[0.2em] sm:tracking-[0.3em] text-[#4F3A2E] uppercase'>WE ACCEPT</span>

          <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
            <FooterPaymentItem>VISA</FooterPaymentItem>
            <FooterPaymentItem>
              <div className='flex gap-1'>
                <div className='h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-600' />
                <div className='-ml-1.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-orange-500' />
              </div>
            </FooterPaymentItem>
            <FooterPaymentItem>AMEX</FooterPaymentItem>
            <FooterPaymentItem>DISCOVER</FooterPaymentItem>
            <FooterPaymentItem>PayPal</FooterPaymentItem>
          </div>
        </div>
      </div>

      <div className='bg-[#1F3B29] py-3 sm:py-4 text-white'>
        <div className='mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 lg:px-12 text-xs sm:text-sm text-white/80 md:flex-row'>
          <p className='text-center md:text-left'>
            Copyright ©2024 <span className='text-white'>LuxeLoom</span>. All rights reserved.
          </p>

          <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
            <div className='flex items-center gap-2 sm:gap-3'>
              {socialIcons.map(item => (
                <div key={item.id} className='flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 items-center justify-center rounded-full border border-white/60 transition-all duration-300 hover:bg-white/10 hover:scale-110 cursor-pointer'>
                  {item.icon}
                </div>
              ))}
            </div>

            <span className='hidden sm:inline text-white/50'>|</span>

            <button className='flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold tracking-wide text-white transition-all duration-300 hover:scale-110'>
              <Globe size={14} className='sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px]' />
              ENGLISH
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
