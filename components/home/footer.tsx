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
        { label: 'Home', href: '#' },
        { label: 'Shop', href: '#' },
        { label: 'About', href: '#' },
        { label: 'Services', href: '#' },
      ],
    },
    {
      title: 'Services',
      items: [
        { label: 'Gold Jewelry', href: '#' },
        { label: 'Silver Jewelry', href: '#' },
        { label: 'Antique Jewelry', href: '#' },
      ],
    },
    {
      title: 'Community',
      items: [
        { label: 'Community Hub', href: '#' },
        { label: 'Invite a Friend', href: '#' },
        { label: 'News & Blog', href: '#' },
        { label: 'Affiliates', href: '#' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help & Support', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Trust & Safety', href: '#' },
        { label: 'Community', href: '#' },
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
      <div className='mx-auto max-w-7xl px-6 py-12'>
        <div className='flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between'>
          <div>
            <div className='mb-6 flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded bg-[#1F3B29]'>
                <span className='text-white text-xl'>✤</span>
              </div>
              <h2 className='text-xl font-semibold text-[#1F3B29]'>LuxeLoom</h2>
            </div>

            <div className='space-y-3 text-[#1C1F1A]'>
              <div className='flex items-center gap-4'>
                <Mail size={18} />
                <span className='text-sm font-semibold'>oripiostudio@gmail.com</span>
              </div>
              <div className='flex items-center gap-4'>
                <Phone size={18} />
                <span className='text-sm font-semibold'>+8801701253995</span>
              </div>
            </div>
          </div>

          <div className='flex flex-row gap-20'>
            {footerData.map(section => (
              <FooterSection key={section.title} title={section.title} items={section.items} />
            ))}
          </div>
        </div>

        <div className='my-8 border-t border-[#1F3B29]/20' />

        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <span className='text-xs font-semibold tracking-[0.3em] text-[#4F3A2E]'>WE ACCEPT</span>

          <div className='flex flex-wrap items-center gap-3'>
            <FooterPaymentItem>VISA</FooterPaymentItem>
            <FooterPaymentItem>
              <div className='flex gap-1'>
                <div className='h-3 w-3 rounded-full bg-red-600' />
                <div className='-ml-1.5 h-3 w-3 rounded-full bg-orange-500' />
              </div>
            </FooterPaymentItem>
            <FooterPaymentItem>AMEX</FooterPaymentItem>
            <FooterPaymentItem>DISCOVER</FooterPaymentItem>
            <FooterPaymentItem>PayPal</FooterPaymentItem>
          </div>
        </div>
      </div>

      <div className='bg-[#1F3B29] py-4 text-white'>
        <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-white/80 md:flex-row'>
          <p>
            Copyright ©2024 <span className='text-white'>LuxeLoom</span>. All rights reserved.
          </p>

          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-3'>
              {socialIcons.map(item => (
                <div key={item.id} className='flex h-9 w-9 items-center justify-center rounded-full border border-white/60'>
                  {item.icon}
                </div>
              ))}
            </div>

            <span className='text-white/50'>|</span>

            <button className='flex items-center gap-2 text-xs font-semibold tracking-wide text-white'>
              <Globe size={18} />
              ENGLISH
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
