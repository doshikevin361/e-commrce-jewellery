'use client';

import { CategoriesSidebar } from '@/components/home/CategoriesSidebar';
import { Diamond, Truck, Package, Clock, Globe, MapPin, AlertCircle, Mail, DollarSign } from 'lucide-react';
import Image from 'next/image';

export default function ShippingPolicyPage() {
  const sections = [
    {
      title: 'Shipping Methods',
      icon: Truck,
      content: [
        'We offer multiple shipping options to suit your needs, including standard shipping, express shipping, and overnight delivery.',
        'Shipping times are calculated from the date your order is processed and shipped, not from the date you place the order.',
        'All orders are carefully packaged to ensure your jewelry arrives in perfect condition.',
        'We use secure and insured shipping methods for all valuable items.',
      ],
    },
    {
      title: 'Processing Time',
      icon: Clock,
      content: [
        'Orders are typically processed within 1-2 business days after payment confirmation.',
        'Custom or personalized items may take 5-7 business days to process before shipping.',
        'During peak seasons or sale periods, processing times may be extended.',
        'You will receive a shipping confirmation email with tracking information once your order has been shipped.',
      ],
    },
    {
      title: 'Shipping Costs',
      icon: DollarSign,
      content: [
        'Shipping costs are calculated at checkout based on your location and selected shipping method.',
        'Free standard shipping is available on orders over $100.',
        'Express and overnight shipping options are available for an additional fee.',
        'International shipping rates vary by destination and are calculated at checkout.',
      ],
    },
    {
      title: 'Delivery Times',
      icon: Clock,
      content: [
        'Standard Shipping: 5-7 business days',
        'Express Shipping: 2-3 business days',
        'Overnight Shipping: Next business day (if ordered before 2 PM EST)',
        'International Shipping: 10-21 business days depending on destination',
        'Delivery times are estimates and may vary based on your location and shipping carrier.',
      ],
    },
    {
      title: 'International Shipping',
      icon: Globe,
      content: [
        'We ship to most countries worldwide. International shipping rates and delivery times vary by destination.',
        'Customs duties, taxes, and fees may apply for international orders and are the responsibility of the customer.',
        'International orders may be subject to customs clearance delays beyond our control.',
        'Please ensure your shipping address is correct, as we are not responsible for orders shipped to incorrect addresses.',
      ],
    },
    {
      title: 'Order Tracking',
      icon: MapPin,
      content: [
        'Once your order ships, you will receive a tracking number via email.',
        'You can track your order status using the tracking number provided.',
        'If you have not received tracking information within 3 business days of placing your order, please contact us.',
      ],
    },
    {
      title: 'Lost or Stolen Packages',
      icon: AlertCircle,
      content: [
        'We are not responsible for packages that are lost or stolen after delivery confirmation.',
        'If your package shows as delivered but you have not received it, please contact us immediately.',
        'We will work with the shipping carrier to investigate and assist in resolving the issue.',
        'We recommend using a secure delivery location or requiring a signature for valuable packages.',
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
              src='https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1600&q=80'
              alt='Shipping Policy'
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
              <Truck size={28} className='sm:w-8 sm:h-8 md:w-10 md:h-10 text-white' />
              <Diamond size={20} className='sm:w-[24px] sm:h-[24px] text-white' />
              <div className='w-8 sm:w-10 h-px bg-white/50' />
            </div>
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-5 drop-shadow-2xl'>
              SHIPPING POLICY
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
                    At LuxeLoom, we strive to deliver your jewelry safely and promptly. This policy outlines our shipping procedures, timelines, and what you can expect when placing an order with us.
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
                    If you have any questions about our shipping policy, please contact us:
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
