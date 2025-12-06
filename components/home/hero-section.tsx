'use client';

import { useScrollAnimation } from './use-scroll-animation';

export function HeroSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className='max-w-[1440px] mx-auto px-4 py-8'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Side - 2 Images (Big + Small) */}
        <div className='lg:col-span-2 space-y-4'>
          {/* First - Big Image - Girl on Chair */}
          <div
            ref={ref}
            className={`relative overflow-hidden rounded-lg h-[400px] bg-gray-200 transform transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
            <div className='absolute inset-0 bg-[url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800")] bg-cover bg-center group-hover:scale-110 transition-transform duration-700'></div>
            <div className='absolute inset-0 bg-gradient-to-r from-black/20 to-transparent'></div>
            <div className='relative h-full flex flex-col justify-end items-start p-8 text-white'>
              <p
                className={`text-sm mb-2 font-medium text-white/90 transform transition-all duration-700 delay-200 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}>
                Holiday &apos;25 Collection
              </p>
              <h2
                className={`text-5xl font-bold mb-6 text-white transform transition-all duration-700 delay-300 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}>
                Relic Relaxed
              </h2>
              <button
                className={`bg-white text-[#6B46C1] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300 delay-400 transform ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                Shop Collection
              </button>
            </div>
          </div>

          {/* Second - Small Image - Vintage Hats */}
          <div
            className={`relative overflow-hidden rounded-lg h-[190px] bg-[#6B46C1] transform transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>
            <div className='absolute inset-0 bg-[url("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400")] bg-cover bg-right opacity-40 group-hover:scale-110 transition-transform duration-700'></div>
            <div className='relative h-full flex flex-col justify-center items-start p-6 text-white'>
              <p className='text-sm mb-1 text-white/90'>New Arrivals</p>
              <h3 className='text-2xl font-bold mb-4 text-white'>Vintage Hats</h3>
              <button className='bg-white text-[#6B46C1] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300 text-sm'>
                Shop Now
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - 2 Small Images (Top + Bottom) */}
        <div className='space-y-4'>
          {/* Top Small Image - Woman Dress (Pink Bg) */}
          <div
            className={`relative overflow-hidden rounded-lg h-[290px] bg-[#EC4899] transform transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
            <div className='absolute inset-0 bg-[url("https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400")] bg-cover bg-right opacity-40 group-hover:scale-110 transition-transform duration-700'></div>
            <div className='relative h-full flex flex-col justify-center items-start p-6 text-white'>
              <h3 className='text-2xl font-bold mb-2 text-white'>Save 40% on Surfing</h3>
              <p className='text-base mb-4 text-white/90'>Starting at $100</p>
              <button className='bg-white text-[#6B46C1] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300 text-sm'>
                Shop Now
              </button>
            </div>
          </div>

          {/* Bottom Small Image - Blue Bag (Maroon Bg) */}
          <div
            className={`relative overflow-hidden rounded-lg h-[290px] bg-[#991B1B] transform transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
            <div className='absolute inset-0 bg-[url("https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400")] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700'></div>
            <div className='relative h-full flex flex-col justify-center items-start p-6 text-white'>
              <h3 className='text-2xl font-bold mb-2 text-white'>Save 40% on Surfing</h3>
              <p className='text-base mb-4 text-white/90'>Starting at $100</p>
              <button className='bg-white text-[#6B46C1] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300 text-sm'>
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
