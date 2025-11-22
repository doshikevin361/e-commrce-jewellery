'use client';

import { HomeHeader } from '@/components/home/header';
import { HomeFooter } from '@/components/home/footer';
import { CategoriesSidebar } from '@/components/home/CategoriesSidebar';
import { Diamond, FileText, Scale, CreditCard, Copyright, Mail } from 'lucide-react';
import Image from 'next/image';

export default function TermsAndConditionsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: FileText,
      content: [
        'By accessing and using the LuxeLoom website, you accept and agree to be bound by the terms and provisions of this agreement.',
        'If you do not agree to these Terms and Conditions, please do not use our website or services.',
        'We reserve the right to modify these terms at any time, and such modifications shall be effective immediately upon posting on the website.',
      ],
    },
    {
      title: 'Use License',
      icon: FileText,
      content: [
        'Permission is granted to temporarily view the materials on LuxeLoom\'s website for personal, non-commercial transitory viewing only.',
        'This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to decompile or reverse engineer any software contained on the website.',
        'This license shall automatically terminate if you violate any of these restrictions and may be terminated by LuxeLoom at any time.',
      ],
    },
    {
      title: 'Product Information',
      icon: Diamond,
      content: [
        'We strive to provide accurate product descriptions, images, and pricing information. However, we do not warrant that product descriptions or other content on this website is accurate, complete, reliable, current, or error-free.',
        'All jewelry items are photographed to show their beauty and craftsmanship. Colors may vary slightly due to monitor settings and lighting conditions.',
        'We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.',
      ],
    },
    {
      title: 'Pricing and Payment',
      icon: CreditCard,
      content: [
        'All prices are listed in the currency specified on the website and are subject to change without notice.',
        'Payment must be made through our accepted payment methods at the time of purchase.',
        'We reserve the right to refuse any order placed with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order.',
      ],
    },
    {
      title: 'Intellectual Property',
      icon: Copyright,
      content: [
        'All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of LuxeLoom and is protected by copyright and trademark laws.',
        'You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise use any content from this website without our express written permission.',
        'The LuxeLoom name and logo are trademarks and may not be used without our prior written consent.',
      ],
    },
    {
      title: 'Limitation of Liability',
      icon: Scale,
      content: [
        'LuxeLoom shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the website.',
        'In no event shall our total liability to you for all damages exceed the amount paid by you to us for any products or services.',
        'Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, so the above limitation may not apply to you.',
      ],
    },
    {
      title: 'Governing Law',
      icon: Scale,
      content: [
        'These Terms and Conditions shall be governed by and construed in accordance with the laws of the jurisdiction in which LuxeLoom operates.',
        'Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.',
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
              src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80'
              alt='Terms and Conditions'
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
              <Scale size={28} className='sm:w-8 sm:h-8 md:w-10 md:h-10 text-white' />
              <Diamond size={20} className='sm:w-[24px] sm:h-[24px] text-white' />
              <div className='w-8 sm:w-10 h-px bg-white/50' />
            </div>
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-5 drop-shadow-2xl'>
              TERMS AND CONDITIONS
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
                    Please read these Terms and Conditions carefully before using the LuxeLoom website. These terms govern your access to and use of our website and services. By accessing or using our website, you agree to be bound by these Terms and Conditions.
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
                    If you have any questions about these Terms and Conditions, please contact us:
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
