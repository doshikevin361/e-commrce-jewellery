'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { HeroBannerSkeleton } from './common/skeleton-loaders';

import 'swiper/css';

interface HeroBanner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  buttonText?: string;
  displayOrder?: number;
}

interface HeroBannerSliderProps {
  banners?: HeroBanner[];
  isLoading?: boolean;
}

export function HeroBannerSlider({ banners = [], isLoading = false }: HeroBannerSliderProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeBanners = useMemo(
    () => banners.filter(b => b.image).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [banners]
  );

  if (isLoading) {
    return <HeroBannerSkeleton />;
  }

  if (!activeBanners.length) return null;

  return (
    <div className='relative w-full h-[480px] md:h-[540px] lg:h-[620px]'>
      {/* ================= SWIPER ================= */}
      <Swiper
        modules={[Autoplay]}
        slidesPerView='auto'
        centeredSlides
        spaceBetween={32}
        loop={activeBanners.length > 1}
        speed={700}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        onSwiper={setSwiper}
        onSlideChange={s => setActiveIndex(s.realIndex)}
        className='w-full h-full px-6 lg:px-12 overflow-hidden'>
        {activeBanners.map((banner, index) => (
          <SwiperSlide key={banner._id} className='!w-[85%] md:!w-[70%] lg:!w-[80%]'>
            <div className='relative w-full h-[420px] md:h-[480px] lg:h-[520px] rounded-2xl overflow-hidden'>
              {/* Background Image */}
              <Image src={banner.image} alt={banner.title} fill className='object-cover' priority={index === 0} />

              {/* Overlay */}
              <div className='absolute inset-0 bg-black/40' />

              {/* Content */}
              <div className='absolute inset-0 z-10 flex items-center'>
                <div className='px-8 max-w-xl text-white'>
                  {banner.subtitle && (
                    <span className='inline-block mb-3 px-4 py-1.5 bg-white/20 rounded-full text-xs tracking-wide uppercase'>
                      {banner.subtitle}
                    </span>
                  )}

                  <h2 className='text-2xl md:text-4xl lg:text-5xl font-bold mb-4'>{banner.title}</h2>

                  {banner.description && <p className='text-sm md:text-lg text-white/90 mb-6'>{banner.description}</p>}

                  {banner.buttonText && banner.link && (
                    <Link href={banner.link}>
                      <button className='px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition'>
                        {banner.buttonText}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ================= DIAMOND DOTS ================= */}
      <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-[999]'>
        {activeBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => swiper?.slideToLoop(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-3 h-3 rotate-45 transition-all duration-300 ${
              index === activeIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
