'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Hero Banner Component
export const HeroBanner = () => {
  return (
    <div className='relative h-[52vh] w-full overflow-hidden bg-black sm:h-[62vh] lg:h-[80vh]'>
      {/* VIDEO */}
      <video src='/uploads/banner_vi.mov' autoPlay loop muted playsInline className='w-full h-full object-cover' />

      {/* 🔥 BOTTOM FADE SHADOW (THIS FIXES IT) */}
      <div
        className='
          pointer-events-none 
          absolute bottom-0 left-0 
          w-full h-40 
          bg-gradient-to-t 
          from-white 
          via-white/50 
          to-transparent
          z-20
        '
      />
    </div>
  );
};

// Categories Component
const categories = [
  { name: 'Solitaires', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400' },
  { name: 'Watch Jewellery', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
  { name: 'Mangalsutras', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400' },
  { name: 'Nose Pins', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400' },
  { name: 'Gold Coins', image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400' },
  { name: 'Anklets', image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400' },
  { name: 'Pendants', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400' },
  { name: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400' },
  { name: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400' },
  { name: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400' },
  { name: 'Bangles', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400' },
  { name: 'Bracelets', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400' },
  { name: 'Gold Chains', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400' },
];

export default function Categories() {
  return (
    <div className='relative w-full bg-gradient-to-b from-white to-pink-50/30 py-8 sm:py-10 lg:py-12'>
      <div className='relative z-20 mx-auto max-w-[1440px] px-4 sm:px-6'>
        <div className='flex flex-row flex-wrap place-items-center justify-center gap-4 sm:gap-5 lg:gap-6'>
          {categories.map((category, index) => (
            <div key={index} className='group flex w-[46%] max-w-[140px] cursor-pointer flex-col items-center gap-2.5 sm:w-auto sm:gap-3'>
              <div
                className='
              w-full aspect-square
              bg-gradient-to-br from-pink-50 to-purple-50
              rounded-3xl
              border border-pink-100
              overflow-hidden
              transition-all duration-300
              group-hover:shadow-xl
              group-hover:border-pink-200
              relative
            '>
                <div className='absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                <img
                  src={category.image}
                  alt={category.name}
                  className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
                />
              </div>

              <span className='text-center text-xs font-medium text-gray-500 transition-colors duration-300 group-hover:text-[#001e38] sm:text-sm'>
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const banners = [
  {
    image: '/slider/banner1.jpg',
  },

  {
    image: '/slider/banner3.png',
  },
    {
    image: '/slider/banner4.webp',
  },
];

export const Slider = () => {
  return (
    <div className='h-[42vh] w-full sm:h-[55vh] lg:h-[75vh]'>
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        navigation
        loop
        className='w-full h-full'>
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <div className='w-full h-full relative flex'>
              {/* LEFT IMAGE */}
              <div className='w-full h-full relative'>
                <img src={banner.image} alt={banner.title} className='h-[42vh] w-full object-cover sm:h-[55vh] lg:h-[70vh]' />
                {/* subtle overlay */}{' '}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export const ScrollingOffer = () => {
  return (
    <div className='w-full bg-pink-50 border-y border-pink-200 overflow-hidden relative'>
      <div className='absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-pink-50 to-transparent z-10 pointer-events-none'></div>
      <div className='absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-pink-50 to-transparent z-10 pointer-events-none'></div>
      <div className='relative flex'>
        <style>{`
          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className='flex items-center gap-16 animate-marquee py-3 px-8'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='flex items-center gap-6 shrink-0'>
              <span className='text-base text-gray-800'>
                Gold Mine <span className='text-orange-500 font-semibold'>10+1</span> Monthly Plan
                <span className='ml-2 text-sm text-gray-600'>(Pay 10 installments & enjoy 100% savings on the 11th month!)</span>
              </span>

              <button className='px-5 py-1.5 bg-pink-200 text-gray-800 rounded text-sm font-medium hover:bg-pink-300 transition-colors whitespace-nowrap'>
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
