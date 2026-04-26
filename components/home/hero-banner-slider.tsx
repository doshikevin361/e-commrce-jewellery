'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useRouter } from 'next/navigation';

// Hero Banner Component

const slides = [
  '/uploads/hero-image.png',
  '/uploads/hero-image2.png',
  '/uploads/hero-image3.png',
];

export const HeroBanner = () => {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative h-[52vh] sm:h-[62vh] lg:h-[80vh] w-full overflow-hidden">
      
      {/* SLIDES */}
      <div
        className="flex h-full w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((img, index) => (
          <div
            key={index}
            className="min-w-full h-full cursor-pointer"
            onClick={() => router.push('/products')}
          >
            <img
              src={img}
              className="w-full object-contain"
              alt="hero"
            />
          </div>
        ))}
      </div>

      {/* LEFT BUTTON */}
      <button
        onClick={prevSlide}
        className="absolute cursor-pointer
         left-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white text-black rounded-full p-2"
      >
        ‹
      </button>

      {/* RIGHT BUTTON */}
      <button
        onClick={nextSlide}
        className="absolute  cursor-pointer right-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white text-black rounded-full p-2"
      >
        ›
      </button>

      {/* DOT INDICATORS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              current === index ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const categories = [
  { label: "Wedding",   image: "/uploads/grid1.webp" },
  { label: "Diamond",   image: "/uploads/grid2.webp" },
  { label: "Gold",      image: "/uploads/grid3.webp" },
  { label: "Dailywear", image: "/uploads/grid4.webp" },
];


export const CategoryGrid = () => {
  return (
    <section className="w-full px-4 py-6">
      <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
        {categories.map((cat) => (
          <div
            key={cat.label}
            className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[4/3]"
          >
            <img
              src={cat.image}
              alt={cat.label}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(100,10,30,0.65)] via-transparent to-transparent group-hover:from-[rgba(100,10,30,0.8)] transition-all duration-300" />
            {/* label */}
            <p className="absolute bottom-4 left-0 right-0 text-center text-white text-xl font-semibold font-serif tracking-wide drop-shadow-md">
              {cat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
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
