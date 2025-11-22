'use client';

import { HomeHeader } from '@/components/home/header';
import { HomeFooter } from '@/components/home/footer';
import { CategoriesSidebar } from '@/components/home/CategoriesSidebar';
import { Diamond, Shield, Lock, Eye, FileText, Mail } from 'lucide-react';
import Image from 'next/image';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      icon: Eye,
      content: [
        'We collect information that you provide directly to us when you create an account, make a purchase, subscribe to our newsletter, or contact us for support.',
        'This includes your name, email address, phone number, shipping address, payment information, and any other information you choose to provide.',
        'We also automatically collect certain information about your device when you visit our website, including your IP address, browser type, operating system, and browsing behavior.',
      ],
    },
    {
      title: 'How We Use Your Information',
      icon: FileText,
      content: [
        'To process and fulfill your orders and manage your account.',
        'To communicate with you about your orders, products, services, and promotional offers.',
        'To improve our website, products, and services based on your feedback and usage patterns.',
        'To detect, prevent, and address technical issues and fraudulent activities.',
        'To comply with legal obligations and enforce our terms and conditions.',
      ],
    },
    {
      title: 'Information Sharing',
      icon: Shield,
      content: [
        'We do not sell, trade, or rent your personal information to third parties.',
        'We may share your information with trusted service providers who assist us in operating our website, conducting our business, or serving our customers, as long as they agree to keep this information confidential.',
        'We may disclose your information if required by law or to protect our rights, property, or safety.',
      ],
    },
    {
      title: 'Data Security',
      icon: Lock,
      content: [
        'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
        'We use encryption technologies and secure payment processing to ensure your data is protected during transmission.',
        'However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.',
      ],
    },
    {
      title: 'Your Rights',
      icon: Diamond,
      content: [
        'You have the right to access, update, or delete your personal information at any time.',
        'You can opt out of receiving promotional communications from us by following the unsubscribe instructions in our emails.',
        'You can disable cookies in your browser settings, though this may affect your ability to use certain features of our website.',
      ],
    },
    {
      title: 'Changes to This Policy',
      icon: FileText,
      content: [
        'We may update this privacy policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.',
        'We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.',
        'We encourage you to review this policy periodically to stay informed about how we collect, use, and protect your information.',
      ],
    },
  ];

  return (
    <div className='min-h-screen w-full overflow-x-hidden bg-white'>
      <HomeHeader />
      <CategoriesSidebar />
      <main className='w-full overflow-x-hidden'>
        {/* Hero Banner */}
        <section className='relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden'>
          <div className='absolute inset-0 w-full h-full z-0'>
            <Image
              src='https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1600&q=80'
              alt='Privacy Policy'
              fill
              sizes='100vw'
              className='object-cover'
              priority
              unoptimized
            />
            <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 z-10' />
          </div>
          <div className='relative z-20 h-full flex flex-col justify-center items-center text-center px-3 sm:px-4 md:px-6 text-white'>
            <div className='flex items-center justify-center gap-2 mb-4 sm:mb-5'>
              <div className='w-8 sm:w-10 h-px bg-white/50' />
              <Shield size={28} className='sm:w-8 sm:h-8 md:w-10 md:h-10 text-white' />
              <Diamond size={20} className='sm:w-[24px] sm:h-[24px] text-white' />
              <div className='w-8 sm:w-10 h-px bg-white/50' />
            </div>
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-5 drop-shadow-2xl'>
              PRIVACY POLICY
            </h1>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed drop-shadow-lg'>
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>

        <section className='mx-auto w-full max-w-[1280px] py-8 sm:py-10 md:py-12 lg:py-16 px-3 sm:px-4 md:px-6 lg:px-0'>
          {/* Content */}
          <div className='max-w-4xl mx-auto space-y-8 sm:space-y-10 md:space-y-12'>
            <div className='prose prose-lg max-w-none'>
              <div className='relative rounded-xl sm:rounded-2xl overflow-hidden mb-8 sm:mb-10'>
                <div className='absolute inset-0 bg-gradient-to-br from-[#F5EEE5] to-white z-0' />
                <div className='relative z-10 p-6 sm:p-8 md:p-10'>
                  <p className='text-sm sm:text-base md:text-lg lg:text-xl text-[#3F5C45] leading-relaxed'>
                    At LuxeLoom, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and make purchases from us. Please read this policy carefully to understand our practices regarding your personal data.
                  </p>
                </div>
              </div>

              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <div key={index} className='mb-8 sm:mb-10 md:mb-12 group'>
                    <div className='relative rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#E6D3C2]/50 bg-white hover:border-[#C8A15B] transition-all duration-300 hover:shadow-xl'>
                      <div className='p-6 sm:p-8 md:p-10'>
                        <div className='flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6'>
                          <div className='w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#F5EEE5] flex items-center justify-center group-hover:bg-[#C8A15B] transition-all duration-300'>
                            <IconComponent size={24} className='sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#C8A15B] group-hover:text-white transition-colors duration-300' />
                          </div>
                          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1F3B29]'>
                            {section.title}
                          </h2>
                        </div>
                        <ul className='space-y-3 sm:space-y-4'>
                          {section.content.map((item, itemIndex) => (
                            <li key={itemIndex} className='flex items-start gap-3 text-sm sm:text-base md:text-lg text-[#3F5C45] leading-relaxed'>
                              <span className='text-[#C8A15B] mt-1.5 sm:mt-2 font-bold'>•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className='relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl mt-8 sm:mt-10'>
                <div className='absolute inset-0 bg-gradient-to-br from-[#1F3B29] to-[#3F5C45] z-0' />
                <div className='relative z-10 p-6 sm:p-8 md:p-10 text-white'>
                  <div className='flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6'>
                    <Mail size={32} className='sm:w-10 sm:h-10 md:w-12 md:h-12' />
                    <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight'>
                      Contact Us
                    </h2>
                  </div>
                  <p className='text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-4 opacity-90'>
                    If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                  </p>
                  <div className='space-y-2 text-sm sm:text-base md:text-lg lg:text-xl opacity-90'>
                    <p><span className='font-semibold'>Email:</span> oripiostudio@gmail.com</p>
                    <p><span className='font-semibold'>Phone:</span> +8801701253995</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Separator */}
            <div className='flex items-center justify-center gap-2 pt-8 sm:pt-10'>
              <div className='w-8 sm:w-10 h-px bg-[#E6D3C2]' />
              <Diamond size={20} className='sm:w-[24px] sm:h-[24px] text-[#C8A15B]' />
              <div className='w-8 sm:w-10 h-px bg-[#E6D3C2]' />
            </div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}
