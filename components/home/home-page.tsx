'use client';

import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingCart, Star, Truck, Shield, Headphones, Award, Heart, Sparkles, Diamond, Gem, Link2, CircleDot } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { blogCards, categories, images, navLinks } from '@/app/utils/dummyData';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { useRef, useState, useEffect } from 'react';
import { useScrollAnimation } from './use-scroll-animation';
import { useCategories } from '@/contexts/CategoriesContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const featuredProducts = [
  {
    id: 1,
    title: 'Carat Solitaire Diamond Ring',
    category: 'Rings',
    price: '$165.00',
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    badge: 'Sale',
  },
  {
    id: 2,
    title: 'Pear-Shaped Emerald Ring',
    category: 'Rings',
    price: '$182.00',
    rating: 5,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: "Women's Bijou Ear Drops",
    category: 'Earrings',
    price: '$156.00',
    rating: 4.8,
    reviews: 77,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'Luxe Gold Necklace',
    category: 'Necklace',
    price: '$215.00',
    rating: 4.9,
    reviews: 143,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    title: 'Vintage Gold Bracelet',
    category: 'Bracelet',
    price: '$205.00',
    rating: 4.7,
    reviews: 81,
    image: 'https://images.unsplash.com/photo-1603561596112-1d0c62c80203?auto=format&fit=crop&w=600&q=80',
  },
];

type Product = (typeof featuredProducts)[number];

const heroSlides = [
  {
    id: 1,
    main: {
      image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f1?auto=format&fit=crop&w=1200&q=80',
      video: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_24fps.mp4',
      subtitle: 'Where Luxury',
      title: 'Meets Affordability',
      description: 'Exquisite, handcrafted jewelry that celebrates elegance and individuality.',
      buttonText: 'Shop Now',
    },
    side: {
      image: 'https://images.unsplash.com/photo-1603561596112-1d0c62c80203?auto=format&fit=crop&w=700&q=80',
      subtitle: 'Gold Pricing',
      title: 'Flash Sale',
      description: '2 March – 15 March',
      buttonText: 'See more products',
    },
  },
  {
    id: 2,
    main: {
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
      subtitle: 'New Collection',
      title: 'Spring Elegance',
      description: 'Discover our latest collection of handcrafted pieces designed for the modern woman.',
      buttonText: 'Explore Now',
    },
    side: {
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=80',
      subtitle: 'Limited Time',
      title: 'Special Offer',
      description: 'Up to 50% off on selected items',
      buttonText: 'Shop Sale',
    },
  },
  {
    id: 3,
    main: {
      image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=80',
      subtitle: 'Premium Quality',
      title: 'Luxury Redefined',
      description: 'Experience the finest craftsmanship in every piece of our exclusive collection.',
      buttonText: 'Discover More',
    },
    side: {
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=700&q=80',
      subtitle: 'Trending Now',
      title: 'Best Sellers',
      description: 'Shop our most popular designs loved by thousands',
      buttonText: 'View Collection',
    },
  },
];

export const HomePage = () => (
  <div className='mx-auto w-full flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10 px-3 sm:px-4 md:px-6 lg:px-0 max-w-[1280px]'>
    <Hero />
    <CategoryStrip />
    <WhyChooseUs />
    <FeaturedSlider />
    <PromoShowcase />
    <TrendingProducts />
    <BestSellers />
    <Collections />
    <Testimonials />
    <Updates />
    <Gallery />
    <Subscribe />
  </div>
);

// Menu items with submenus for jewelry e-commerce
const menuItems = [
  { name: 'Home', href: '/' },
  {
    name: 'Shop',
    href: '#shop',
    submenu: ['All Jewelry', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Anklets', 'Brooches']
  },
  {
    name: 'Collections',
    href: '#collections',
    submenu: ['New Arrivals', 'Best Sellers', 'Limited Edition', 'Vintage Collection', 'Custom Designs']
  },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' }
];

const sidebarCategories = [
  'Rings',
  'Necklace',
  'Earring',
  'Bracelet',
  'Brooch',
  'Gold Jewellery',
  'Cufflink',
  'Pearls',
  'Piercing',
  'Platinum',
  'Navratna',
  'Chain',
];

const categoryIcons: Record<string, React.ReactElement> = {
  Rings: <Diamond size={18} />,
  Necklace: <Gem size={18} />,
  Earring: <CircleDot size={18} />,
  Bracelet: <Link2 size={18} />,
  Brooch: <Sparkles size={18} />,
  'Gold Jewellery': <Diamond size={18} />,
  Cufflink: <Link2 size={18} />,
  Pearls: <Gem size={18} />,
  Piercing: <CircleDot size={18} />,
  Platinum: <Diamond size={18} />,
  Navratna: <Gem size={18} />,
  Chain: <Link2 size={18} />,
};

// Grid2x2CheckIcon component
const Grid2x2CheckIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}>
    <path d='M12 3v6m6-6h-6M3 12h6m-6 6h6m6 0v-6m0 6h-6' />
    <path d='M8 8h8v8H8z' fill='currentColor' opacity='0.3' />
    <path d='M8 16l4-4 4 4' stroke='currentColor' strokeWidth='2' />
  </svg>
);

const Hero = () => {
  const { sidebarOpen, mobileCategoriesOpen, setMobileCategoriesOpen } = useCategories();
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 1024);
      const handleResize = () => {
        setIsMobile(window.innerWidth < 1024);
        if (window.innerWidth >= 1024) {
          setMobileCategoriesOpen(false);
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [setMobileCategoriesOpen]);

  return (
    <>
      {/* Mobile/Tablet Categories Drawer */}
      <Sheet open={mobileCategoriesOpen} onOpenChange={setMobileCategoriesOpen}>
        <SheetContent side='left' className='w-[280px] sm:w-[320px] p-0 overflow-y-auto bg-white'>
          <SheetHeader className='px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E6D3C2]/50 sticky top-0 bg-white z-10'>
            <SheetTitle className='text-base sm:text-lg font-semibold tracking-[0.2em] text-[#1F3B29] text-left flex items-center gap-2'>
              <Grid2x2CheckIcon size={20} className='text-[#1F3B29]' />
              Categories
            </SheetTitle>
          </SheetHeader>
          <ul className='p-3 sm:p-4 space-y-1 sm:space-y-2'>
            {sidebarCategories.map((category) => (
              <li
                key={category}
                className='flex items-center justify-between rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 hover:bg-[#F5EEE5]/60 hover:translate-x-2 hover:shadow-md cursor-pointer active:scale-95'
                onClick={() => setMobileCategoriesOpen(false)}>
                <div className='flex items-center gap-2 sm:gap-3 text-[#3F5C45] flex-1'>
                  <span className='transition-transform duration-300 flex-shrink-0'>{categoryIcons[category]}</span>
                  <span className='text-sm sm:text-base font-semibold text-[#1C1F1A]'>{category}</span>
                </div>
                <ChevronRight size={18} className='sm:w-5 sm:h-5 text-[#3F5C45] transition-transform duration-300 flex-shrink-0' />
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      <section
        ref={heroRef}
        className={`mx-auto grid w-full max-w-[1280px] gap-3 sm:gap-4 md:gap-6 transition-all duration-500 ease-in-out px-3 sm:px-4 md:px-0 ${
          sidebarOpen && !isMobile ? 'lg:grid-cols-[260px_minmax(0,1fr)]' : 'lg:grid-cols-[0px_minmax(0,1fr)]'
        }`}>
        {/* Categories Sidebar - Desktop */}
        <aside
          className={`hidden lg:block overflow-hidden rounded-xl sm:rounded-2xl border border-[#E6D3C2]/50 bg-white px-3 sm:px-5 py-4 sm:py-6 shadow-lg transition-all duration-500 ease-in-out ${
            sidebarOpen ? 'w-[260px] opacity-100 translate-x-0' : 'w-0 px-0 py-0 opacity-0 -translate-x-4'
          }`}>
          {sidebarOpen && (
            <>
              <p className='mb-3 sm:mb-4 text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#1F3B29] animate-in fade-in slide-in-from-left-4 duration-500'>
                Categories
              </p>
              <ul className='space-y-2 sm:space-y-3 text-xs sm:text-sm font-semibold text-[#1C1F1A]'>
                {sidebarCategories.map((category, index) => (
                  <li
                    key={category}
                    className='flex items-center justify-between rounded-xl sm:rounded-2xl px-1 py-1.5 sm:py-2 transition-all duration-300 hover:bg-[#F5EEE5]/60 hover:translate-x-2 hover:shadow-md cursor-pointer animate-in fade-in slide-in-from-left-4'
                    style={{ animationDelay: `${index * 50}ms` }}>
                    <div className='flex items-center gap-1.5 sm:gap-2 text-[#3F5C45]'>
                      <span className='transition-transform duration-300 group-hover:scale-110'>{categoryIcons[category]}</span>
                      <span className='truncate'>{category}</span>
                    </div>
                    <ChevronRight size={14} className='sm:w-4 sm:h-4 text-[#3F5C45] transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0' />
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        {/* Hero Slider */}
        <div className='w-full'>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={true}
            speed={1000}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            grabCursor={true}
            className='hero-swiper !pb-12'>
            {heroSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className='grid w-full gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-[1.65fr_0.9fr]'>
                  {/* Main Card */}
                  <div className='relative flex flex-col justify-center overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 py-6 sm:py-7 md:py-8 lg:py-10 xl:py-12 text-white shadow-lg min-h-[280px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[420px] group w-full'>
                    <div className='absolute inset-0 w-full h-full z-0 bg-gray-300'>
                      {slide.main.video ? (
                        <>
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className='absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                          >
                            <source src={slide.main.video} type='video/mp4' />
                          </video>
                          {/* Fallback image - hidden but ready if video fails */}
            <Image
                            src={slide.main.image}
                            alt={slide.main.title}
                            fill
                            priority={slide.id === 1}
                            sizes='(max-width: 768px) 100vw, (max-width: 1024px) 65vw, 65vw'
                            className='object-cover transition-transform duration-700 group-hover:scale-110 opacity-0 pointer-events-none'
                            unoptimized
                            style={{ objectFit: 'cover' }}
                          />
                        </>
                      ) : (
            <Image
                          src={slide.main.image}
                          alt={slide.main.title}
                          fill
                          priority={slide.id === 1}
                          sizes='(max-width: 768px) 100vw, (max-width: 1024px) 65vw, 65vw'
                          className='object-cover transition-transform duration-700 group-hover:scale-110'
                          unoptimized
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div className='absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/30 z-10' />
                    <div className='relative z-20'>
                      <div className='space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6 max-w-full'>
                        <p className='text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/80 font-medium'>
                          {slide.main.subtitle}
                        </p>
                        <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight sm:leading-tight md:leading-tight'>
                          {slide.main.title}
                        </h1>
                        <p className='max-w-full md:max-w-md text-sm sm:text-base md:text-lg text-white/90 leading-relaxed'>
                          {slide.main.description}
                        </p>
                        <button className='inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-[#1F3B29] shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 mt-2 sm:mt-3'>
                          {slide.main.buttonText}
                </button>
              </div>
            </div>
          </div>

                  {/* Side Card */}
                  <div className='relative flex flex-col justify-end overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 lg:py-8 xl:py-10 shadow-md min-h-[200px] sm:min-h-[220px] md:min-h-[260px] lg:min-h-[280px] group w-full'>
                    <div className='absolute inset-0 w-full h-full z-0 bg-gray-300'>
            <Image
                        src={slide.side.image}
                        alt={slide.side.title}
                        fill
                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 35vw, 35vw'
                        className='object-cover transition-transform duration-700 group-hover:scale-110'
                        unoptimized
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className='absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/30 z-10' />
                    <div className='relative z-20'>
                      <p className='text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/80'>
                        {slide.side.subtitle}
                      </p>
                      <h2 className='mt-1 sm:mt-1.5 md:mt-2 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white'>
                        {slide.side.title}
                      </h2>
                      <p className='mt-1 sm:mt-1.5 md:mt-2 text-[10px] sm:text-xs md:text-sm text-white/80'>
                        {slide.side.description}
                      </p>
                      <button className='mt-2 sm:mt-3 md:mt-4 inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 text-[10px] sm:text-xs md:text-sm font-semibold text-white transition-all duration-300 hover:scale-110 active:scale-95 rounded-full bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2'>
                        {slide.side.buttonText}
              </button>
            </div>
          </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </>
  );
};

const CategoryStrip = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className='mx-auto w-full max-w-[1280px] space-y-3 sm:space-y-4 md:space-y-6 bg-white px-3 sm:px-4 md:px-0'>
      {/* Section Header */}
      <div className='text-center mb-3 sm:mb-4 md:mb-4'>
        <div className='flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2'>
          <div className='w-5 sm:w-6 h-px bg-[#E6D3C2]' />
          <Diamond size={14} className='sm:w-[16px] sm:h-[16px] text-[#C8A15B]' />
          <div className='w-5 sm:w-6 h-px bg-[#E6D3C2]' />
            </div>
        <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1F3B29] mb-3 sm:mb-4'>
          SHOP BY CATEGORY
        </h2>
        <p className='text-sm sm:text-base md:text-lg text-[#3F5C45] font-normal max-w-xl mx-auto leading-relaxed'>
          Explore our diverse selections. Find your style.
        </p>
      </div>

      {/* Category Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-3 sm:mb-4 md:mb-4'>
        {categories.map((item, index) => (
          <a
            key={item.name}
            href={`#${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            className={`group relative overflow-hidden rounded-lg sm:rounded-xl aspect-[4/5] bg-gradient-to-br from-[#F5EEE5] to-white shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer ${
              isVisible ? 'animate-in fade-in slide-in-from-bottom-4 zoom-in-95' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}>
            {/* Image Slider Container */}
            <div className='absolute inset-0 w-full h-full'>
              <Swiper
                modules={[Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop={true}
                speed={800}
                className='w-full h-full category-swiper'>
                {item.images.map((img, imgIndex) => (
                  <SwiperSlide key={imgIndex}>
                    <div className='relative w-full h-full'>
                      <Image
                        src={img}
                        alt={`${item.name} ${imgIndex + 1}`}
                        fill
                        sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 30vw'
                        className='object-cover transition-transform duration-700 group-hover:scale-110'
                        unoptimized
                      />
                      {/* Gradient Overlay */}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300' />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
            </div>
            
            {/* Category Name */}
            <div className='absolute inset-0 flex items-end justify-center p-3 sm:p-4 md:p-4 z-10'>
              <h3 className='text-white font-bold text-sm sm:text-base md:text-lg text-center drop-shadow-2xl group-hover:scale-110 transition-transform duration-300 tracking-wide uppercase'>
                {item.name}
              </h3>
            </div>

            {/* Hover Effect Border */}
            <div className='absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-lg sm:rounded-xl transition-all duration-300' />
          </a>
        ))}
      </div>

      {/* View All Button */}
      <div className='text-center mt-2 sm:mt-3'>
        <button className='px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg border-2 border-[#1F3B29] text-[#1F3B29] font-bold text-xs sm:text-sm md:text-base hover:bg-[#1F3B29] hover:text-white hover:border-[#1F3B29] transition-all duration-300 hover:scale-105 active:scale-95 tracking-wide uppercase'>
          View All Categories
        </button>
      </div>

      {/* Bottom Separator */}
      <div className='flex items-center justify-center gap-1.5 sm:gap-2 mt-2 sm:mt-3'>
        <div className='w-5 sm:w-6 h-px bg-[#E6D3C2]' />
        <Diamond size={14} className='sm:w-[16px] sm:h-[16px] text-[#C8A15B]' />
        <div className='w-5 sm:w-6 h-px bg-[#E6D3C2]' />
      </div>
  </section>
);
};

const FeaturedSlider = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className='mx-auto w-full max-w-[1280px] space-y-3 sm:space-y-4 md:space-y-6 bg-white px-3 sm:px-4 md:px-0'>
      <div
        className={`flex flex-wrap items-end justify-between gap-3 sm:gap-4 md:gap-6 border-b border-[#E6D3C2] pb-2 sm:pb-3 transition-all duration-700 ${
          isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
        }`}>
        <p className='text-lg sm:text-xl md:text-2xl font-semibold text-[#1F3B29]'>New Products</p>
        <div className='flex items-center gap-2 sm:gap-3 md:gap-4 text-[#1F3B29]'>
          <div className='flex gap-2 sm:gap-3'>
            <button className='prev-btn flex h-7 w-7 sm:h-8 sm:w-8 items-center cursor-pointer justify-center rounded-full border border-[#E6D3C2] bg-white shadow-sm transition-all duration-300 hover:bg-[#FDFBF7] hover:scale-110 active:scale-95'>
              <ChevronLeft size={18} className='sm:w-5 sm:h-5' />
          </button>
            <button className='next-btn flex h-7 w-7 sm:h-8 sm:w-8 items-center cursor-pointer justify-center rounded-full border border-[#E6D3C2] bg-white shadow-sm transition-all duration-300 hover:bg-[#FDFBF7] hover:scale-110 active:scale-95'>
              <ChevronRight size={18} className='sm:w-5 sm:h-5' />
          </button>
        </div>
          <button className='flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-[#1F3B29] transition-all duration-300 hover:scale-110 hover:translate-x-1'>
          View all
            <ChevronRight size={16} className='sm:w-[18px] sm:h-[18px] transition-transform duration-300' />
        </button>
      </div>
    </div>
    <Swiper
      modules={[Navigation]}
      navigation={{
        nextEl: '.next-btn',
        prevEl: '.prev-btn',
      }}
      spaceBetween={20}
      slidesPerView='auto'
      grabCursor
      className='pb-4'>
        {featuredProducts.map((product, index) => (
        <SwiperSlide key={product.id} style={{ width: 'auto' }}>
            <div
              className={`transition-all duration-500 ${
                isVisible ? 'animate-in fade-in slide-in-from-right-8 zoom-in-95' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}>
          <ProductCard product={product} />
            </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);
};

const TrendingProducts = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className='mx-auto max-w-[1280px] space-y-4 sm:space-y-6 px-4 sm:px-0'>
      <div
        className={`flex flex-wrap items-end justify-between gap-3 sm:gap-4 border-b border-[#E6D3C2] pb-2 sm:pb-3 transition-all duration-700 ${
          isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
        }`}>
        <p className='text-lg sm:text-xl md:text-2xl font-semibold text-[#1F3B29]'>Trending Products</p>
        <div className='flex items-center gap-2 sm:gap-3 md:gap-4 text-[#1F3B29]'>
          <div className='flex gap-2 sm:gap-3'>
            <button className='trending-prev-btn flex h-7 w-7 sm:h-8 sm:w-8 items-center cursor-pointer justify-center rounded-full border border-[#E6D3C2] bg-white shadow-sm transition-all duration-300 hover:bg-[#FDFBF7] hover:scale-110 active:scale-95'>
              <ChevronLeft size={18} className='sm:w-5 sm:h-5' />
            </button>
            <button className='trending-next-btn flex h-7 w-7 sm:h-8 sm:w-8 items-center cursor-pointer justify-center rounded-full border border-[#E6D3C2] bg-white shadow-sm transition-all duration-300 hover:bg-[#FDFBF7] hover:scale-110 active:scale-95'>
              <ChevronRight size={18} className='sm:w-5 sm:h-5' />
            </button>
          </div>
          <button className='flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-[#1F3B29] transition-all duration-300 hover:scale-110 hover:translate-x-1'>
        View all
            <ChevronRight size={16} className='sm:w-[18px] sm:h-[18px] transition-transform duration-300' />
      </button>
    </div>
      </div>
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: '.trending-next-btn',
          prevEl: '.trending-prev-btn',
        }}
        spaceBetween={20}
        slidesPerView='auto'
        grabCursor
        className='pb-4'>
        {featuredProducts.map((product, index) => (
        <SwiperSlide key={product.id} style={{ width: 'auto' }}>
            <div
              className={`transition-all duration-500 ${
                isVisible ? 'animate-in fade-in slide-in-from-left-8 zoom-in-95' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}>
          <ProductCard product={product} />
            </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);
};

const ProductCard = ({ product }: { product: Product }) => (
  <article className='group flex min-w-[200px] sm:min-w-[240px] md:min-w-[260px] max-w-[400px] snap-start flex-col rounded-xl sm:rounded-2xl border border-[#E6D3C2]/70 bg-white p-3 sm:p-4 transition-all duration-300 hover:border-[#1F3B29]/50 hover:shadow-xl hover:-translate-y-2'>
    <div className='relative h-40 sm:h-48 md:h-52 w-full overflow-hidden rounded-2xl sm:rounded-3xl'>
      {product.badge && (
        <span className='absolute left-2 sm:left-3 md:left-4 top-2 sm:top-3 md:top-4 z-10 rounded-full bg-[#C8A15B] px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white animate-in fade-in zoom-in-95'>
          {product.badge}
        </span>
      )}
      <Image
        src={product.image}
        alt={product.title}
        fill
        sizes='(max-width: 640px) 200px, (max-width: 768px) 240px, 280px'
        className='object-cover transition-transform duration-500 group-hover:scale-110'
      />
    </div>
    <div className='mt-3 sm:mt-4 space-y-1.5 sm:space-y-2'>
      <p className='text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#3F5C45] transition-colors duration-300 group-hover:text-[#1F3B29]'>
        {product.category}
      </p>
      <h3 className='text-sm sm:text-base md:text-lg font-bold text-[#1F3B29] transition-colors duration-300 group-hover:text-[#3F5C45] line-clamp-2'>
        {product.title}
      </h3>
      <div className='flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#E6D3C2]'>
        <Star className='fill-[#C8A15B] text-[#C8A15B] transition-transform duration-300 group-hover:scale-110 w-3.5 h-3.5 sm:w-4 sm:h-4' size={14} />
        <span className='font-semibold text-[#1C1F1A]'>{product.rating.toFixed(1)}</span>
        <span className='text-[#1C1F1A]/60'>({product.reviews})</span>
      </div>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-base sm:text-lg font-semibold text-[#1F3B29]'>{product.price}</p>
        <button className='rounded-full border border-[#1F3B29]/30 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm font-semibold text-[#1F3B29] transition-all duration-300 hover:bg-[#1F3B29] hover:text-white hover:scale-110 active:scale-95 whitespace-nowrap'>
          Add to cart
        </button>
      </div>
    </div>
  </article>
);

const PromoShowcase = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className='mx-auto mt-3 sm:mt-4 md:mt-5 w-full max-w-[1280px] rounded-xl bg-[#F3F5F7] p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10'>
      <div className='grid items-center gap-6 sm:gap-8 md:gap-10 md:grid-cols-2'>
        <div className='flex gap-3 sm:gap-4 md:gap-5'>
        <img
          src='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'
          alt='Model 1'
            className={`h-48 sm:h-56 md:h-64 w-1/2 rounded-xl sm:rounded-2xl object-cover lg:h-[420px] transition-all duration-700 hover:scale-105 hover:shadow-xl ${
              isVisible ? 'animate-in fade-in slide-in-from-left-8 zoom-in-95' : 'opacity-0'
            }`}
        />
        <img
          src='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'
          alt='Model 2'
            className={`mt-8 sm:mt-12 md:mt-[72px] h-48 sm:h-56 md:h-64 w-1/2 rounded-xl sm:rounded-2xl object-cover lg:h-[350px] transition-all duration-700 hover:scale-105 hover:shadow-xl delay-200 ${
              isVisible ? 'animate-in fade-in slide-in-from-left-8 zoom-in-95' : 'opacity-0'
            }`}
            style={{ animationDelay: '200ms' }}
        />
      </div>

        <div
          className={`transition-all duration-700 ${
            isVisible ? 'animate-in fade-in slide-in-from-right-8 zoom-in-95' : 'opacity-0'
          }`}
          style={{ animationDelay: '300ms' }}>
          <h2 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug text-[#1F3B29]'>
            Collection inspired <br className='hidden sm:block' /> by LuxeLoom
        </h2>

          <p className='mt-3 sm:mt-4 text-xs sm:text-sm md:text-base leading-relaxed text-[#4F3A2E]'>
          These adornments are worn around the neck and come in various lengths. These adornments are worn around the neck and come in
          various lengths.
        </p>

          <button className='mt-4 sm:mt-6 rounded-full bg-[#1F3B29] px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm text-white transition-all duration-300 hover:bg-[#16301F] hover:scale-110 active:scale-95'>
            Explore More
          </button>
      </div>
    </div>
  </section>
);
};

const Collections = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className='mx-auto w-full max-w-[1280px] py-4 sm:py-6 md:py-8 lg:py-10 px-3 sm:px-4 md:px-0'>
      <div
        className={`mb-4 sm:mb-6 flex flex-wrap items-end justify-between gap-3 sm:gap-4 border-b border-[#E6D3C2] pb-2 sm:pb-3 transition-all duration-700 ${
          isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
        }`}>
        <p className='text-lg sm:text-xl md:text-2xl font-semibold text-[#1F3B29]'>Curated Collections</p>
        <button className='flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-[#1F3B29] transition-all duration-300 hover:scale-110 hover:translate-x-1'>
        View all
          <ChevronRight size={16} className='sm:w-[18px] sm:h-[18px] transition-transform duration-300' />
      </button>
    </div>

      <div className='grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2'>
        <div
          className={`group flex flex-col items-center gap-4 sm:gap-6 rounded-xl sm:rounded-2xl bg-[#F3F5F7] p-4 sm:p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 md:flex-row ${
            isVisible ? 'animate-in fade-in slide-in-from-left-8 zoom-in-95' : 'opacity-0'
          }`}>
        <img
          src='https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80'
            className='h-48 sm:h-64 md:h-full w-full rounded-lg sm:rounded-xl object-cover transition-transform duration-500 group-hover:scale-105 md:w-1/2'
          alt='Earrings'
        />

        <div className='flex flex-col justify-center'>
            <h3 className='text-xl sm:text-2xl md:text-3xl font-semibold text-[#1C1F1A] transition-colors duration-300 group-hover:text-[#1F3B29]'>
              Ancient jewelry <br className='hidden sm:block' /> collection
          </h3>
            <p className='mt-2 sm:mt-3 text-sm sm:text-base text-[#4F3A2E]'>Beautiful long earrings with opal and carnelian stones—lightweight and radiant.</p>

            <button className='mt-4 sm:mt-5 flex w-fit items-center gap-1.5 sm:gap-2 rounded-full bg-[#1F3B29] px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm text-white transition-all duration-300 hover:scale-110 active:scale-95'>
              Explore more{' '}
            </button>
        </div>
      </div>

        <div
          className={`group flex flex-col gap-4 sm:gap-6 rounded-xl sm:rounded-2xl bg-[#F3F5F7] p-4 sm:p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${
            isVisible ? 'animate-in fade-in slide-in-from-right-8 zoom-in-95' : 'opacity-0'
          }`}
          style={{ animationDelay: '200ms' }}>
        <div>
            <h3 className='text-lg sm:text-xl md:text-2xl font-semibold text-[#1C1F1A] transition-colors duration-300 group-hover:text-[#1F3B29]'>
              Ancient jewelry collection
            </h3>
            <p className='mt-2 text-sm sm:text-base text-[#4F3A2E]'>Beautiful long earrings with opal and carnelian stones—lightweight and radiant.</p>

            <button className='mt-3 sm:mt-4 flex w-fit items-center gap-1.5 sm:gap-2 rounded-full bg-[#1F3B29] px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm text-white transition-all duration-300 hover:scale-110 active:scale-95'>
              Shop Now
            </button>
        </div>

        <img
          src='https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80'
            className='h-48 sm:h-56 md:h-64 w-full rounded-lg sm:rounded-xl object-cover transition-transform duration-500 group-hover:scale-105'
          alt='Woman with earring'
        />
      </div>
    </div>
  </section>
);
};

const Updates = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className='mx-auto w-full max-w-[1280px] px-3 sm:px-4 md:px-0'>
      <div
        className={`flex flex-wrap items-end justify-between gap-3 sm:gap-4 border-b border-[#E6D3C2] pb-2 sm:pb-3 transition-all duration-700 ${
          isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
        }`}>
        <p className='text-lg sm:text-xl md:text-2xl font-semibold text-[#1F3B29]'>Updates</p>
        <button className='flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-[#1F3B29] transition-all duration-300 hover:scale-110 hover:translate-x-1'>
        View all
          <ChevronRight size={16} className='sm:w-[18px] sm:h-[18px] transition-transform duration-300' />
      </button>
    </div>
      <div className='grid gap-4 sm:gap-6 py-6 sm:py-8 md:py-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
        {blogCards.map((card, index) => (
          <div
            key={card.id}
            className={`group rounded-2xl sm:rounded-3xl border border-[#E6D3C2]/60 bg-[#F3F5F7] p-3 sm:p-4 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${
              isVisible ? 'animate-in fade-in slide-in-from-bottom-4 zoom-in-95' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}>
            <div className='overflow-hidden rounded-xl sm:rounded-2xl'>
              <img
                src={card.img}
                alt={card.title}
                className='h-48 sm:h-56 md:h-60 w-full object-cover transition-transform duration-500 group-hover:scale-110'
              />
            </div>

            <div className='mt-3 sm:mt-4 text-[#1C1F1A]'>
              <p className='text-xs sm:text-sm text-[#4F3A2E] transition-colors duration-300 group-hover:text-[#1F3B29]'>
              {card.category} &nbsp; | &nbsp; {card.date}
            </p>

              <h3 className='mt-2 text-base sm:text-lg font-semibold transition-colors duration-300 group-hover:text-[#1F3B29] line-clamp-2'>{card.title}</h3>

              <p className='mt-2 text-xs sm:text-sm text-[#4F3A2E] line-clamp-2'>{card.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);
};

const Gallery = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className='mx-auto w-full max-w-[1280px] px-3 sm:px-4 md:px-6 lg:px-0 py-6 sm:py-8 md:py-10 lg:py-12'>
      <h2
        className={`mb-6 sm:mb-8 md:mb-10 text-center text-xl sm:text-2xl md:text-3xl font-semibold text-[#1F3B29] transition-all duration-700 ${
          isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
        }`}>
        Gallery
      </h2>

      <div className='grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
      {images.map((src, index) => (
          <div
            key={`gallery-image-${index}-${src}`}
            className={`group overflow-hidden rounded-lg sm:rounded-xl shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${
              index === 3 ? 'md:row-span-2' : ''
            } ${isVisible ? 'animate-in fade-in zoom-in-95' : 'opacity-0'}`}
            style={{ animationDelay: `${index * 100}ms` }}>
            <img
              src={src}
              className='h-32 sm:h-48 md:h-56 lg:h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110'
              alt={`Gallery image ${index + 1}`}
            />
        </div>
      ))}
    </div>
  </section>
);
};

const WhyChooseUs = () => {
  const { ref, isVisible } = useScrollAnimation();

  const features = [
    {
      icon: <Truck size={32} />,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $100',
    },
    {
      icon: <Shield size={32} />,
      title: 'Secure Payment',
      description: '100% secure payment gateway',
    },
    {
      icon: <Headphones size={32} />,
      title: '24/7 Support',
      description: 'Round the clock customer support',
    },
    {
      icon: <Award size={32} />,
      title: 'Quality Assured',
      description: 'Premium quality guaranteed',
    },
    {
      icon: <Heart size={32} />,
      title: 'Easy Returns',
      description: '30-day hassle-free returns',
    },
    {
      icon: <Sparkles size={32} />,
      title: 'Authentic Products',
      description: 'Certified authentic jewelry',
    },
  ];

  return (
    <section ref={ref} className='mx-auto w-full max-w-[1280px] py-6 sm:py-8 md:py-12 lg:py-16 px-3 sm:px-4 md:px-0'>
      <div
        className={`mb-8 sm:mb-12 text-center transition-all duration-700 ${
          isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
        }`}>
        <h2 className='text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1F3B29] mb-3 sm:mb-4'>
          Why Choose Us
        </h2>
        <p className='text-sm sm:text-base text-[#4F3A2E] max-w-2xl mx-auto'>
          Experience the difference with our premium services and commitment to excellence
        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6'>
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`group flex flex-col items-center text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-[#E6D3C2]/50 hover:border-[#1F3B29]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 ${
              isVisible ? 'animate-in fade-in zoom-in-95' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}>
            <div className='mb-3 sm:mb-4 p-3 sm:p-4 rounded-full bg-[#F5EEE5] text-[#1F3B29] transition-all duration-300 group-hover:bg-[#1F3B29] group-hover:text-white group-hover:scale-110'>
              {feature.icon}
            </div>
            <h3 className='text-sm sm:text-base font-semibold text-[#1F3B29] mb-1 sm:mb-2'>{feature.title}</h3>
            <p className='text-xs sm:text-sm text-[#4F3A2E] leading-relaxed'>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const BestSellers = () => {
  const { ref, isVisible } = useScrollAnimation();

  const bestSellers = [
    {
      id: 1,
      title: 'Diamond Solitaire Ring',
      category: 'Rings',
      price: '$299.00',
      originalPrice: '$399.00',
      rating: 5,
      reviews: 245,
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      badge: 'Best Seller',
    },
    {
      id: 2,
      title: 'Pearl Drop Earrings',
      category: 'Earrings',
      price: '$189.00',
      originalPrice: '$249.00',
      rating: 4.9,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80',
      badge: 'Top Rated',
    },
    {
      id: 3,
      title: 'Gold Chain Necklace',
      category: 'Necklace',
      price: '$349.00',
      originalPrice: '$449.00',
      rating: 4.8,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80',
      badge: 'Popular',
    },
    {
      id: 4,
      title: 'Silver Bracelet Set',
      category: 'Bracelet',
      price: '$159.00',
      originalPrice: '$199.00',
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
      badge: 'Sale',
    },
  ];

  return (
    <section ref={ref} className='mx-auto max-w-[1280px] space-y-4 sm:space-y-6 px-4 sm:px-0'>
      <div
        className={`flex flex-wrap items-end justify-between gap-3 sm:gap-4 border-b border-[#E6D3C2] pb-2 sm:pb-3 transition-all duration-700 ${
          isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
        }`}>
        <div>
          <h2 className='text-lg sm:text-xl md:text-2xl font-semibold text-[#1F3B29]'>Best Sellers</h2>
          <p className='text-xs sm:text-sm text-[#4F3A2E] mt-1'>Our most loved products</p>
        </div>
        <button className='flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-[#1F3B29] transition-all duration-300 hover:scale-110 hover:translate-x-1'>
          View all
          <ChevronRight size={16} className='sm:w-[18px] sm:h-[18px] transition-transform duration-300' />
        </button>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
        {bestSellers.map((product, index) => (
          <div
            key={product.id}
            className={`group flex flex-col rounded-xl sm:rounded-2xl border border-[#E6D3C2]/70 bg-white p-3 sm:p-4 transition-all duration-300 hover:border-[#1F3B29]/50 hover:shadow-xl hover:-translate-y-2 ${
              isVisible ? 'animate-in fade-in slide-in-from-bottom-4 zoom-in-95' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}>
            <div className='relative h-48 sm:h-56 w-full overflow-hidden rounded-xl sm:rounded-2xl mb-3 sm:mb-4'>
              {product.badge && (
                <span className='absolute left-2 sm:left-3 top-2 sm:top-3 z-10 rounded-full bg-[#C8A15B] px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white'>
                  {product.badge}
                </span>
              )}
              <img
                src={product.image}
                alt={product.title}
                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
              />
            </div>
            <div className='space-y-1.5 sm:space-y-2'>
              <p className='text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#3F5C45]'>{product.category}</p>
              <h3 className='text-sm sm:text-base md:text-lg font-bold text-[#1F3B29] line-clamp-2'>{product.title}</h3>
              <div className='flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm'>
                <Star className='fill-[#C8A15B] text-[#C8A15B]' size={14} />
                <span className='font-semibold text-[#1C1F1A]'>{product.rating.toFixed(1)}</span>
                <span className='text-[#1C1F1A]/60'>({product.reviews})</span>
              </div>
              <div className='flex items-center gap-2 sm:gap-3'>
                <span className='text-base sm:text-lg font-semibold text-[#1F3B29]'>{product.price}</span>
                {product.originalPrice && (
                  <span className='text-xs sm:text-sm text-[#4F3A2E] line-through'>{product.originalPrice}</span>
                )}
              </div>
              <button className='w-full rounded-full border border-[#1F3B29]/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#1F3B29] transition-all duration-300 hover:bg-[#1F3B29] hover:text-white hover:scale-105 active:scale-95'>
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Testimonials = () => {
  const { ref, isVisible } = useScrollAnimation();

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Fashion Enthusiast',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Absolutely stunning pieces! The quality is exceptional and the designs are timeless. Highly recommend!',
    },
    {
      id: 2,
      name: 'Emily Chen',
      role: 'Jewelry Collector',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'I\'ve purchased multiple items and each one exceeds expectations. The customer service is outstanding!',
    },
    {
      id: 3,
      name: 'Michael Rodriguez',
      role: 'Gift Buyer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Perfect gift for my wife! She loved it. The packaging was beautiful and delivery was fast.',
    },
  ];

  return (
    <section ref={ref} className='mx-auto w-full max-w-[1280px] py-6 sm:py-8 md:py-12 lg:py-16 px-3 sm:px-4 md:px-0'>
      <div
        className={`mb-8 sm:mb-12 text-center transition-all duration-700 ${
          isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
        }`}>
        <h2 className='text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1F3B29] mb-3 sm:mb-4'>
          What Our Customers Say
        </h2>
        <p className='text-sm sm:text-base text-[#4F3A2E] max-w-2xl mx-auto'>
          Don't just take our word for it - hear from our satisfied customers
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6'>
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={`group bg-white rounded-xl sm:rounded-2xl border border-[#E6D3C2]/50 p-5 sm:p-6 md:p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${
              isVisible ? 'animate-in fade-in slide-in-from-bottom-4 zoom-in-95' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 150}ms` }}>
            <div className='flex items-center gap-1 mb-3 sm:mb-4'>
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className='fill-[#C8A15B] text-[#C8A15B]' size={16} />
              ))}
            </div>
            <p className='text-sm sm:text-base text-[#4F3A2E] mb-4 sm:mb-6 leading-relaxed italic'>
              "{testimonial.comment}"
            </p>
            <div className='flex items-center gap-3 sm:gap-4'>
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className='w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[#E6D3C2]'
              />
              <div>
                <h4 className='text-sm sm:text-base font-semibold text-[#1F3B29]'>{testimonial.name}</h4>
                <p className='text-xs sm:text-sm text-[#4F3A2E]'>{testimonial.role}</p>
              </div>
            </div>
        </div>
      ))}
    </div>
  </section>
);
};

const Subscribe = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
  <section
      ref={ref}
      className='relative bg-cover bg-center bg-no-repeat py-16 sm:py-24 md:py-32 lg:py-36 transition-all duration-700'
    style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80')",
    }}>
      <div className='absolute inset-0 bg-black/20 transition-opacity duration-500' />

    <div className='relative mx-auto max-w-4xl px-4 text-center text-white sm:px-6 lg:px-8'>
        <h3
          className={`mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl transition-all duration-700 ${
            isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
          }`}>
          Stay Informed with Our
        </h3>

        <p
          className={`mb-6 sm:mb-8 md:mb-10 text-2xl sm:text-3xl md:text-4xl font-light transition-all duration-700 delay-200 ${
            isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
          }`}>
          Latest News and Updates
        </p>

        <div
          className={`flex flex-col sm:flex-row w-full items-stretch sm:items-center rounded-full border border-white/50 bg-white/90 px-3 sm:px-4 py-2 sm:py-2 text-left shadow-sm transition-all duration-700 delay-300 gap-2 sm:gap-0 ${
            isVisible ? 'animate-in fade-in slide-in-from-bottom-4 zoom-in-95' : 'opacity-0'
          }`}>
        <input
          type='text'
          placeholder='Enter Your Email'
            className='flex-1 bg-transparent p-2 sm:p-2 text-xs sm:text-sm text-[#1F3B29] placeholder:text-[#4F3A2E] focus:outline-none focus:ring-2 focus:ring-[#1F3B29]/20 rounded-lg transition-all duration-300'
        />

          <button className='sm:ml-3 flex h-[40px] sm:h-[50px] w-full sm:w-[120px] md:w-[150px] items-center justify-center rounded-full bg-[#1F3B29] text-xs sm:text-sm md:text-base font-semibold text-white transition-all duration-300 hover:bg-[#16301F] hover:scale-110 active:scale-95'>
          Subscribe
        </button>
      </div>
    </div>
  </section>
);
};

export default HomePage;
