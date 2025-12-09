'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface HeroBanner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  buttonText?: string;
  backgroundColor?: string;
  displayOrder?: number;
}

interface HeroBannerSliderProps {
  banners?: HeroBanner[];
  isLoading?: boolean;
}

export function HeroBannerSlider({ banners = [], isLoading = false }: HeroBannerSliderProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Filter only active banners and sort by displayOrder
  const activeBanners = banners
    .filter(banner => banner.image) // Only show banners with images
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  useEffect(() => {
    if (swiper && prevButtonRef.current && nextButtonRef.current) {
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, [swiper, activeBanners.length]);

  if (isLoading && activeBanners.length === 0) {
    return (
      <div className='w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl bg-gray-100 flex items-center justify-center'>
        <p className='text-gray-500'>Loading banners...</p>
      </div>
    );
  }

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div className='relative w-full rounded-2xl overflow-hidden bg-white'>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={activeBanners.length > 1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: false,
        }}
        navigation={{
          prevEl: prevButtonRef.current,
          nextEl: nextButtonRef.current,
        }}
        onSwiper={setSwiper}
        onSlideChange={swiper => setActiveIndex(swiper.realIndex)}
        className='hero-banner-swiper w-full h-[400px] md:h-[450px]'>
        {activeBanners.map(banner => (
          <SwiperSlide key={banner._id}>
            <div className='relative w-full h-full'>
              {/* Full Background Image */}
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes='100vw'
                className='object-cover'
                priority={activeBanners.indexOf(banner) === 0}
              />

              {/* Overlay for better text readability */}
              <div className='absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent' />

              {/* Right Side - Text Content Overlay */}
              <div className='relative h-full flex flex-col justify-center items-end px-6 md:px-12 lg:px-16 xl:px-20 py-8 md:py-12'>
                <div className='w-full sm:pl-10 flex flex-col justify-center text-right md:text-left'>
                  {/* Brand/Logo Area - Optional */}
                  {banner.subtitle && (
                    <p className='text-xs md:text-sm font-semibold text-white/90 mb-2 uppercase tracking-wider'>{banner.subtitle}</p>
                  )}

                  {/* Main Title */}
                  <h1 className='text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight drop-shadow-lg'>
                    {banner.title}
                  </h1>

                  {/* Description */}
                  {banner.description && (
                    <p className='text-sm md:text-base lg:text-lg text-white/90 mb-6 md:mb-8 max-w-2xl drop-shadow-md'>
                      {banner.description}
                    </p>
                  )}

                  {/* CTA Button */}
                  {banner.buttonText && (
                    <Link
                      href={banner.link || '/products'}
                      className='inline-flex items-center justify-center bg-white text-web px-6 md:px-8 lg:px-10 py-3  rounded-full font-semibold text-sm md:text-base  transition-colors duration-200 w-fit shadow-lg'>
                      {banner.buttonText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            ref={prevButtonRef}
            className='cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white hover:border-[#1F3B29] transition-all shadow-lg'
            aria-label='Previous slide'>
            <ChevronLeft className='w-5 h-5 md:w-6 md:h-6 text-[#1F3B29]' />
          </button>
          <button
            ref={nextButtonRef}
            className='cursour-pointer absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white hover:border-[#1F3B29] transition-all shadow-lg'
            aria-label='Next slide'>
            <ChevronRight className='w-5 h-5 md:w-6 md:h-6 text-[#1F3B29]' />
          </button>
        </>
      )}
    </div>
  );
}
