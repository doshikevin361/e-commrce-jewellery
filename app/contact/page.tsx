'use client';

import { HomeHeader } from '@/components/home/header';
import { HomeFooter } from '@/components/home/footer';
import { CategoriesSidebar } from '@/components/home/CategoriesSidebar';
import { Diamond, Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import Image from 'next/image';

export default function ContactPage() {
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
              alt='Contact Us'
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
              <Diamond size={20} className='sm:w-[24px] sm:h-[24px] text-white' />
              <div className='w-8 sm:w-10 h-px bg-white/50' />
            </div>
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-5 drop-shadow-2xl'>
              CONTACT US
            </h1>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed drop-shadow-lg'>
              Get in touch with us. We're here to help!
            </p>
          </div>
        </section>

        <section className='mx-auto w-full max-w-[1280px] py-8 sm:py-10 md:py-12 lg:py-16 px-3 sm:px-4 md:px-6 lg:px-0'>

          <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10'>
            {/* Contact Form */}
            <div className='relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#F5EEE5] via-white to-[#F5EEE5]/30 z-0' />
              <div className='relative z-10 p-6 sm:p-8 md:p-10 lg:p-12'>
                <div className='flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8'>
                  <div className='w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#1F3B29] flex items-center justify-center'>
                    <Send size={24} className='sm:w-7 sm:h-7 md:w-8 md:h-8 text-white' />
                  </div>
                  <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#1F3B29]'>
                    Send us a Message
                  </h2>
                </div>
                <form className='space-y-4 sm:space-y-5 md:space-y-6'>
                <div>
                  <label htmlFor='name' className='block text-sm sm:text-base font-semibold text-[#1F3B29] mb-2'>
                    Your Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    className='w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg border border-[#E6D3C2] bg-white text-sm sm:text-base text-[#1F3B29] focus:outline-none focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent transition-all duration-300'
                    placeholder='Enter your name'
                  />
                </div>
                <div>
                  <label htmlFor='email' className='block text-sm sm:text-base font-semibold text-[#1F3B29] mb-2'>
                    Your Email
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    className='w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg border border-[#E6D3C2] bg-white text-sm sm:text-base text-[#1F3B29] focus:outline-none focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent transition-all duration-300'
                    placeholder='Enter your email'
                  />
                </div>
                <div>
                  <label htmlFor='subject' className='block text-sm sm:text-base font-semibold text-[#1F3B29] mb-2'>
                    Subject
                  </label>
                  <input
                    type='text'
                    id='subject'
                    name='subject'
                    className='w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg border border-[#E6D3C2] bg-white text-sm sm:text-base text-[#1F3B29] focus:outline-none focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent transition-all duration-300'
                    placeholder='Enter subject'
                  />
                </div>
                <div>
                  <label htmlFor='message' className='block text-sm sm:text-base font-semibold text-[#1F3B29] mb-2'>
                    Message
                  </label>
                  <textarea
                    id='message'
                    name='message'
                    rows={6}
                    className='w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg border border-[#E6D3C2] bg-white text-sm sm:text-base text-[#1F3B29] focus:outline-none focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent transition-all duration-300 resize-none'
                    placeholder='Enter your message'></textarea>
                </div>
                  <button
                    type='submit'
                    className='w-full flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 md:py-4 rounded-lg bg-[#1F3B29] text-white font-bold text-sm sm:text-base md:text-lg hover:bg-[#1F3B29]/90 transition-all duration-300 hover:scale-105 active:scale-95 tracking-wide uppercase shadow-lg hover:shadow-xl'>
                    <Send size={20} />
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className='space-y-6 sm:space-y-8'>
              <div>
                <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1F3B29] mb-6 sm:mb-8'>
                  Contact Information
                </h2>
                <div className='space-y-4 sm:space-y-6'>
                  <div className='group flex items-start gap-4 sm:gap-5 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 border-[#E6D3C2]/50 bg-white hover:border-[#C8A15B] transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
                    <div className='flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#1F3B29] flex items-center justify-center group-hover:bg-[#C8A15B] transition-all duration-300'>
                      <Mail size={24} className='sm:w-6 sm:h-6 md:w-7 md:h-7 text-white' />
                    </div>
                    <div>
                      <h3 className='text-base sm:text-lg md:text-xl font-bold text-[#1F3B29] mb-1 sm:mb-2'>Email</h3>
                      <p className='text-sm sm:text-base md:text-lg text-[#3F5C45]'>oripiostudio@gmail.com</p>
                    </div>
                  </div>
                  <div className='group flex items-start gap-4 sm:gap-5 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 border-[#E6D3C2]/50 bg-white hover:border-[#C8A15B] transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
                    <div className='flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#1F3B29] flex items-center justify-center group-hover:bg-[#C8A15B] transition-all duration-300'>
                      <Phone size={24} className='sm:w-6 sm:h-6 md:w-7 md:h-7 text-white' />
                    </div>
                    <div>
                      <h3 className='text-base sm:text-lg md:text-xl font-bold text-[#1F3B29] mb-1 sm:mb-2'>Phone</h3>
                      <p className='text-sm sm:text-base md:text-lg text-[#3F5C45]'>+8801701253995</p>
                    </div>
                  </div>
                  <div className='group flex items-start gap-4 sm:gap-5 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 border-[#E6D3C2]/50 bg-white hover:border-[#C8A15B] transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
                    <div className='flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#1F3B29] flex items-center justify-center group-hover:bg-[#C8A15B] transition-all duration-300'>
                      <MapPin size={24} className='sm:w-6 sm:h-6 md:w-7 md:h-7 text-white' />
                    </div>
                    <div>
                      <h3 className='text-base sm:text-lg md:text-xl font-bold text-[#1F3B29] mb-1 sm:mb-2'>Address</h3>
                      <p className='text-sm sm:text-base md:text-lg text-[#3F5C45]'>123 Jewelry Street, Gold City, GC 12345</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className='relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl'>
                <div className='absolute inset-0 bg-gradient-to-br from-[#F5EEE5] to-white z-0' />
                <div className='relative z-10 p-6 sm:p-8 md:p-10'>
                  <div className='flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6'>
                    <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#C8A15B] flex items-center justify-center'>
                      <Clock size={24} className='sm:w-7 sm:h-7 text-white' />
                    </div>
                    <h3 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F3B29]'>
                      Business Hours
                    </h3>
                  </div>
                  <div className='space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg text-[#3F5C45]'>
                    <div className='flex justify-between items-center p-2 sm:p-3 rounded-lg bg-white/50'>
                      <span className='font-semibold text-[#1F3B29]'>Monday - Friday:</span>
                      <span className='font-medium'>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className='flex justify-between items-center p-2 sm:p-3 rounded-lg bg-white/50'>
                      <span className='font-semibold text-[#1F3B29]'>Saturday:</span>
                      <span className='font-medium'>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className='flex justify-between items-center p-2 sm:p-3 rounded-lg bg-white/50'>
                      <span className='font-semibold text-[#1F3B29]'>Sunday:</span>
                      <span className='font-medium'>Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Separator */}
          <div className='flex items-center justify-center gap-2 mt-12 sm:mt-16'>
            <div className='w-8 sm:w-10 h-px bg-[#E6D3C2]' />
            <Diamond size={20} className='sm:w-[24px] sm:h-[24px] text-[#C8A15B]' />
            <div className='w-8 sm:w-10 h-px bg-[#E6D3C2]' />
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}

