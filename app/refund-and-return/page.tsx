'use client';

import { CategoriesSidebar } from '@/components/home/CategoriesSidebar';
import { Diamond, RefreshCw, Package, DollarSign, Repeat, AlertCircle, Mail } from 'lucide-react';
import Image from 'next/image';

export default function RefundAndReturnPage() {
  const sections = [
    {
      title: 'Return Policy',
      icon: Package,
      content: [
        'We want you to be completely satisfied with your purchase. If you are not happy with your jewelry item, you may return it within 30 days of delivery.',
        'Items must be in their original condition, unworn, and with all original packaging, tags, and certificates of authenticity included.',
        'To initiate a return, please contact our customer service team with your order number and reason for return.',
        'Custom or personalized items, items that have been worn or damaged, and items on final sale cannot be returned.',
      ],
    },
    {
      title: 'Return Process',
      icon: RefreshCw,
      content: [
        'Contact our customer service team at oripiostudio@gmail.com or call +8801701253995 within 30 days of receiving your order.',
        'Provide your order number and the reason for return. Our team will provide you with a Return Authorization (RA) number.',
        'Package the item securely in its original packaging with all tags and certificates included.',
        'Ship the item back to us using a trackable shipping method. Return shipping costs are the responsibility of the customer unless the item is defective or incorrect.',
        'Once we receive and inspect the returned item, we will process your refund within 5-10 business days.',
      ],
    },
    {
      title: 'Refund Policy',
      icon: DollarSign,
      content: [
        'Refunds will be issued to the original payment method used for the purchase.',
        'Shipping charges are non-refundable unless the item was defective or incorrect.',
        'The refund amount will reflect the original purchase price minus any applicable restocking fees.',
        'Processing time for refunds may take 5-10 business days after we receive the returned item.',
        'You will receive an email confirmation once your refund has been processed.',
      ],
    },
    {
      title: 'Exchange Policy',
      icon: Repeat,
      content: [
        'We offer exchanges for items in a different size or style, subject to availability.',
        'Exchanges must be requested within 30 days of delivery.',
        'The item must be in its original, unworn condition with all packaging and certificates.',
        'You are responsible for return shipping costs unless the item is defective or incorrect.',
        'Price differences will be charged or refunded accordingly.',
      ],
    },
    {
      title: 'Damaged or Defective Items',
      icon: AlertCircle,
      content: [
        'If you receive a damaged or defective item, please contact us immediately with photos of the damage.',
        'We will provide a prepaid return label and expedite the replacement or refund process.',
        'All shipping costs will be covered by LuxeLoom for damaged or defective items.',
        'We reserve the right to inspect returned items before processing refunds or replacements.',
      ],
    },
    {
      title: 'Late or Missing Refunds',
      icon: DollarSign,
      content: [
        'If you haven\'t received your refund within 10 business days, please check your bank account or credit card statement again.',
        'Contact your bank or credit card company as it may take some time before your refund is officially posted.',
        'If you still have not received your refund, please contact us at oripiostudio@gmail.com for assistance.',
      ],
    },
  ];

  return (
    <>
      <CategoriesSidebar />
      <div className='w-full overflow-x-hidden'>
        {/* Hero Banner */}
        <section className='relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden'>
          <div className='absolute inset-0 w-full h-full z-0'>
            <Image
              src='https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80'
              alt='Refund and Return Policy'
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
              <RefreshCw size={28} className='sm:w-8 sm:h-8 md:w-10 md:h-10 text-white' />
              <Diamond size={20} className='sm:w-[24px] sm:h-[24px] text-white' />
              <div className='w-8 sm:w-10 h-px bg-white/50' />
            </div>
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-5 drop-shadow-2xl'>
              REFUND & RETURN POLICY
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
                    At LuxeLoom, your satisfaction is our priority. We stand behind the quality of our jewelry and want you to love every piece you purchase. This policy outlines our procedures for returns, exchanges, and refunds.
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
                      Need Help?
                    </h2>
                  </div>
                  <p className='text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-4 opacity-90'>
                    If you have any questions about our return or refund policy, please don't hesitate to contact us:
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
      </div>
    </>
  );
}
