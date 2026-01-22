'use client';

import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  Headphones,
  Award,
  Heart,
  Sparkles,
  Diamond,
  Gem,
  Link2,
  CircleDot,
  Star,
  RefreshCw,
  Search,
  ThumbsUp,
  Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
// Removed dummyData imports - using API data instead
import { Pagination } from 'swiper/modules';
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/contexts/CategoriesContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SectionHeader } from '@/components/home/common/section-header';
import Link from 'next/link';
import { getActiveHomepageFeatures } from '@/lib/constants/features';
import { ProductCard, ProductCardData } from './common/product-card';
import {
  ProductSliderSkeleton,
  ProductGridSkeleton,
  CategoryStripSkeleton,
  NewArrivalsSkeleton,
  CollectionsSkeleton,
  GallerySkeleton,
  WhyChooseUsSkeleton,
} from './common/skeleton-loaders';
import Categories, { HeroBanner, ScrollingOffer, Slider } from './hero-banner-slider';
import ProductShowcase from './ProductShowcase';
import TestimonialCard from '../testimonialCard/TestimonialCard';
import ScrollVideoPanels, { VideoItem } from '../scrollvideopanel/ScrollVideoPanels';

type HeroSlide = {
  id: string | number;
  main: {
    image: string;
    subtitle?: string;
    title: string;
    description?: string;
    buttonText?: string;
  };
  side: {
    image: string;
    subtitle?: string;
    title: string;
    description?: string;
    buttonText?: string;
  };
  link?: string;
  backgroundColor?: string;
};

type CategoryStripItem = {
  name: string;
  image: string;
  slug?: string;
};

const FEATURE_ICON_COMPONENTS = {
  Truck,
  Shield,
  Headphones,
  Award,
  Heart,
  Sparkles,
} as const;

type FeatureIconName = keyof typeof FEATURE_ICON_COMPONENTS;

type HomepageFeatureItem = {
  icon: FeatureIconName;
  title: string;
  description: string;
};

type DazzleCard = {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
};

type GalleryItem = {
  _id: string;
  image: string;
};

type NewsItem = {
  _id: string;
  title: string;
  excerpt: string;
  image: string;
  publishDate: string;
  slug: string;
};

type HomepageSectionsState = {
  hero: Array<{
    _id: string;
    title: string;
    subtitle?: string;
    description?: string;
    image: string;
    link?: string;
    buttonText?: string;
    backgroundColor?: string;
    displayOrder?: number;
  }>;
  categories: CategoryStripItem[];
  newProducts: ProductCardData[];
  featuredProducts: ProductCardData[];
  trendingProducts: ProductCardData[];
  features: HomepageFeatureItem[];
  dazzle: DazzleCard[];
  gallery: GalleryItem[];
  news: NewsItem[];
  newArrivals: {
    banner: {
      title: string;
      subtitle: string;
      description: string;
      backgroundImage: string;
    } | null;
    cards: {
      _id: string;
      title: string;
      image: string;
      type: 'card' | 'banner';
    }[];
  };
};

const SECTION_SPACING = 'mt-8 sm:mt-10 md:mt-12 lg:mt-20 mx-auto flex w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12';
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80';
const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80';

const fallbackFeatureData: HomepageFeatureItem[] = getActiveHomepageFeatures().map(feature => ({
  icon: (FEATURE_ICON_COMPONENTS[feature.icon as FeatureIconName] ? feature.icon : 'Sparkles') as FeatureIconName,
  title: feature.title,
  description: feature.description,
}));

// Removed static fallback data - using API data only
const fallbackBestSellers: ProductCardData[] = [];

// Default fallback banners if no banners are available from backend
const defaultHeroSlides: HeroSlide[] = [
  {
    id: 1,
    main: {
      image: DEFAULT_PRODUCT_IMAGE,
      subtitle: '',
      title: '',
      description: '',
      buttonText: 'Shop Now',
    },
    side: {
      image: DEFAULT_PRODUCT_IMAGE,
      subtitle: '',
      title: '',
      description: '',
      buttonText: 'See more products',
    },
  },
];

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Fashion Enthusiast',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    comment: 'Absolutely stunning pieces! The quality is exceptional and the designs are timeless.',
  },
  {
    id: 2,
    name: 'Emily Chen',
    role: 'Jewelry Collector',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    comment: "I've purchased multiple items and each one exceeds expectations.",
  },
  {
    id: 3,
    name: 'Michael Rodriguez',
    role: 'Gift Buyer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    comment: 'Perfect gift for my wife! She loved it, and the packaging was beautiful.',
  },
];

const sanitizeFeatureIcon = (icon?: string): FeatureIconName =>
  FEATURE_ICON_COMPONENTS[icon as FeatureIconName] ? (icon as FeatureIconName) : 'Sparkles';

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '₹0.00';
  }

  return `₹${value.toFixed(2)}`;
};

const mapBannersToSlides = (banners?: any[]): HeroSlide[] => {
  if (!Array.isArray(banners) || banners.length === 0) {
    return [];
  }

  return banners.map((banner, index) => {
    const fallbackSlide = [];

    return {
      id: banner?._id?.toString?.() ?? `banner-${index}`,
      main: {
        image: banner?.image || '',
        subtitle: banner?.subtitle || '',
        title: banner?.title || '',
        description: banner?.description || '',
        buttonText: banner?.buttonText || '',
      },
      side: {
        image: banner?.image || '',
        subtitle: banner?.subtitle || '',
        title: banner?.title || '',
        description: banner?.description || '',
        buttonText: banner?.buttonText || '',
      },
      link: banner?.link || '/products',
      backgroundColor: banner?.backgroundColor || '#000000',
    };
  });
};

const mapCategoriesFromApi = (incoming?: any[]): CategoryStripItem[] => {
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return [];
  }

  return incoming.map((category, index) => ({
    name: category?.name || `Category ${index + 1}`,
    image: category?.image || DEFAULT_CATEGORY_IMAGE,
    slug: category?.slug || category?.name || '',
  }));
};

const mapProductsFromApi = (incoming?: any[], defaultBadge?: string): ProductCardData[] => {
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return [];
  }

  return incoming.map((product, index) => {
    // Use sellingPrice and regularPrice from API (already calculated with discount)
    const sellingPrice =
      typeof product?.sellingPrice === 'number' && product.sellingPrice > 0
        ? product.sellingPrice
        : typeof product?.regularPrice === 'number' && product.regularPrice > 0
          ? product.regularPrice
          : 0;

    const regularPrice = typeof product?.regularPrice === 'number' && product.regularPrice > 0 ? product.regularPrice : sellingPrice;

    // Check if discount exists (either from discount field or price difference)
    const discountPercent = typeof product?.discount === 'number' && product.discount > 0 && product.discount <= 100 ? product.discount : 0;

    const hasDiscount = discountPercent > 0 || (regularPrice > sellingPrice && regularPrice > 0 && sellingPrice > 0);

    const productId = typeof product?._id === 'string' ? product._id : (product?._id?.toString?.() ?? `product-${index}`);

    return {
      id: productId,
      _id: productId, // Ensure _id is set for ProductCard component
      title: product?.name || 'Untitled Product',
      category: product?.category || 'Jewellery',
      price: formatCurrency(sellingPrice), // This is the discounted price
      originalPrice: hasDiscount && regularPrice > sellingPrice ? formatCurrency(regularPrice) : undefined,
      rating: typeof product?.rating === 'number' ? product.rating : 4.8,
      reviews: typeof product?.reviewCount === 'number' ? product.reviewCount : 0,
      image: product?.mainImage || DEFAULT_PRODUCT_IMAGE,
      badge: product?.badge || defaultBadge,
    };
  });
};

const mapFeaturesFromApi = (incoming?: any[]): HomepageFeatureItem[] => {
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return [];
  }

  return incoming.map(feature => ({
    icon: sanitizeFeatureIcon(feature?.icon),
    title: feature?.title || 'Premium Service',
    description: feature?.description || 'Crafted for excellence.',
  }));
};

const createDefaultSectionsState = (): HomepageSectionsState => ({
  hero: [],
  categories: [],
  newProducts: [],
  featuredProducts: [],
  trendingProducts: [],
  features: [...fallbackFeatureData],
  dazzle: [],
  gallery: [],
  news: [],
  newArrivals: {
    banner: null,
    cards: [],
  },
});

export const HomePage = () => {
  const [sectionsData, setSectionsData] = useState<HomepageSectionsState>(() => createDefaultSectionsState());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchHomepageSections = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/public/homepage', {
        next: { revalidate: 60 }, // Cache for 60 seconds, revalidate in background
        signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch homepage sections');
      }

      const payload = await response.json();
      const incomingSections = Array.isArray(payload?.sections) ? payload.sections : [];
      const nextState = createDefaultSectionsState();

      incomingSections.forEach((section: any) => {
        if (!section || typeof section !== 'object') {
          return;
        }

        const { type, data } = section;
        if (!data || typeof data !== 'object') {
          return;
        }

        switch (type) {
          case 'hero': {
            const banners = (data as any).banners;
            if (Array.isArray(banners) && banners.length > 0) {
              nextState.hero = banners.map((banner: any) => ({
                _id: banner._id?.toString() || '',
                title: banner.title || '',
                subtitle: banner.subtitle || '',
                description: banner.description || '',
                image: banner.image || '',
                link: banner.link || '/products',
                buttonText: banner.buttonText || 'Shop Now',
                backgroundColor: banner.backgroundColor || '#f5f5f5',
                displayOrder: banner.displayOrder || 0,
              }));
            }
            break;
          }
          case 'categories': {
            const mappedCategories = mapCategoriesFromApi((data as any).categories);
            if (mappedCategories.length > 0) {
              nextState.categories = mappedCategories;
            }
            break;
          }
          case 'newProducts': {
            const mappedProducts = mapProductsFromApi((data as any).products);
            if (mappedProducts.length > 0) {
              nextState.newProducts = mappedProducts;
            }
            break;
          }
          case 'featuredProducts': {
            const mappedProducts = mapProductsFromApi((data as any).products, 'Featured');
            if (mappedProducts.length > 0) {
              nextState.featuredProducts = mappedProducts;
            }
            break;
          }
          case 'trendingProducts': {
            const mappedProducts = mapProductsFromApi((data as any).products, 'Trending');
            if (mappedProducts.length > 0) {
              nextState.trendingProducts = mappedProducts;
            }
            break;
          }
          case 'features': {
            const mappedFeatures = mapFeaturesFromApi((data as any).features);
            if (mappedFeatures.length > 0) {
              nextState.features = mappedFeatures;
            }
            break;
          }
          case 'dazzle': {
            const dazzleCards = (data as any).cards;
            if (Array.isArray(dazzleCards) && dazzleCards.length > 0) {
              nextState.dazzle = dazzleCards.map((card: any) => ({
                _id: card._id || '',
                title: card.title || '',
                subtitle: card.subtitle || '',
                description: card.description || '',
                buttonText: card.buttonText || 'Explore More',
                buttonLink: card.buttonLink || '/products',
                image: card.image || '',
              }));
            }
            break;
          }
          case 'gallery': {
            const galleryItems = (data as any).items;
            if (Array.isArray(galleryItems) && galleryItems.length > 0) {
              nextState.gallery = galleryItems.map((item: any) => ({
                _id: item._id || '',
                image: item.image || '',
              }));
            }
            break;
          }
          case 'news': {
            const newsItems = (data as any).items;
            if (Array.isArray(newsItems) && newsItems.length > 0) {
              nextState.news = newsItems.map((item: any) => ({
                _id: item._id || '',
                title: item.title || '',
                excerpt: item.excerpt || '',
                image: item.image || '',
                publishDate: item.publishDate || new Date().toISOString(),
                slug: item.slug || '',
              }));
            }
            break;
          }
          case 'newArrivals': {
            const bannerData = (data as any).banner;
            const cardsData = (data as any).cards;
            if (bannerData && typeof bannerData === 'object') {
              nextState.newArrivals.banner = {
                title: bannerData.title || 'New Arrivals',
                subtitle: bannerData.subtitle || '💎 500+ New Items',
                description: bannerData.description || '',
                backgroundImage: bannerData.backgroundImage || '',
              };
            }
            if (Array.isArray(cardsData) && cardsData.length > 0) {
              nextState.newArrivals.cards = cardsData.map((card: any) => ({
                _id: card._id || '',
                title: card.title || '',
                image: card.image || '',
                type: card.type || 'card',
              }));
            }
            break;
          }
          default:
            break;
        }
      });

      if (!signal.aborted) {
        setSectionsData(nextState);
        setErrorMessage(null);
      }
    } catch (error) {
      if (signal.aborted) {
        return;
      }
      console.error('[v0] Failed to load homepage data:', error);
      setSectionsData(prev => prev);
      setErrorMessage('We could not load the latest homepage data. Showing default content.');
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchHomepageSections(controller.signal);
    return () => controller.abort();
  }, [fetchHomepageSections]);

  const videoData: VideoItem[] = [
    {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      hashtag: '#OOTD',
      productSlug: 'black-leather-bag',
    },
    {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      hashtag: '#StyleInspo',
      productSlug: 'summer-dress',
    },
  ];

  return (
    <>
      <div className='flex-col gap-0'>
        <div className={'mx-auto w-full'}>
          <HeroBanner />
        </div>
        <div className={'mx-auto w-full'}>
          <Categories />
        </div>
        <div>
          <ScrollingOffer />
        </div>
        <div>
          <Slider />
        </div>
        <div>
          <ProductShowcase />
        </div>
        <div>
          <JewelryProductsDemo products={sectionsData.newProducts} isLoading={isLoading} />
        </div>
        <div>
          <ScrollVideoPanels videoData={videoData} />
        </div>
        <div>
          <TestimonialsSection />
        </div>
      </div>
      {/* Updates section - Full width */}
      {/* <div className={SECTION_SPACING}>
        <UpdatesSection newsItems={sectionsData.news} isLoading={isLoading} />
      </div> */}
      {/* <div className='mt-8 sm:mt-10 md:mt-12 lg:mt-20'>
        <Subscribe />
      </div> */}
    </>
  );
};

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

const Hero = ({ slides = defaultHeroSlides, isLoading = false }: { slides?: HeroSlide[]; isLoading?: boolean }) => {
  const { sidebarOpen, mobileCategoriesOpen, setMobileCategoriesOpen } = useCategories();
  const [isMobile, setIsMobile] = useState(false);
  const heroSwiperRef = useRef<SwiperType | null>(null);
  const slidesToRender = slides.length > 0 ? slides : defaultHeroSlides;
  const showLoadingState = isLoading && slidesToRender.length === 0;
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial mobile state after mount to avoid hydration mismatch
    const checkMobile = () => window.innerWidth < 1024;
    setIsMobile(checkMobile());

    const handleResize = () => {
      setIsMobile(checkMobile());
      if (window.innerWidth >= 1024) {
        setMobileCategoriesOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      // Cleanup Hero Swiper instance
      if (heroSwiperRef.current) {
        try {
          // Only destroy if swiper instance still exists and is initialized
          if (heroSwiperRef.current.initialized) {
            heroSwiperRef.current.destroy(false, false); // Don't remove DOM, React will handle it
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        heroSwiperRef.current = null;
      }
    };
  }, [setMobileCategoriesOpen]);

  const { categories, isLoadingCategories } = useCategories();

  return (
    <>
      <Sheet open={mobileCategoriesOpen} onOpenChange={setMobileCategoriesOpen}>
        <SheetContent side='left' className='w-[300px] overflow-y-auto bg-white p-0'>
          <SheetHeader className='sticky top-0 border-b border-web/50 bg-white px-5 py-4'>
            <SheetTitle className='flex items-center gap-2 text-left text-lg font-semibold tracking-[0.2em] text-[#1F3B29]'>
              <Grid2x2CheckIcon size={20} className='text-[#1F3B29]' />
              Categories
            </SheetTitle>
          </SheetHeader>
          <ul className='space-y-2 px-4 py-4'>
            {isLoadingCategories ? (
              <li className='px-4 py-3 text-sm text-gray-500'>Loading categories...</li>
            ) : categories.length === 0 ? (
              <li className='px-4 py-3 text-sm text-gray-500'>No categories available</li>
            ) : (
              categories.map(category => (
                <li
                  key={category._id}
                  className='flex cursor-pointer items-center justify-between rounded-xl bg-[#F7F3EE] px-4 py-3 text-sm font-semibold text-[#1C1F1A]'
                  onClick={() => setMobileCategoriesOpen(false)}>
                  <Link
                    href={`/products?category=${encodeURIComponent(category.slug || category.name)}`}
                    className='flex items-center gap-3 text-[#3F5C45] flex-1'>
                    {category.icon ? (
                      <Image src={category.icon} alt={category.name} width={18} height={18} className='object-contain flex-shrink-0' />
                    ) : (
                      <Diamond size={18} />
                    )}
                    <span>{category.name}</span>
                  </Link>
                  <ChevronRight size={18} className='text-[#3F5C45]' />
                </li>
              ))
            )}
          </ul>
        </SheetContent>
      </Sheet>

      <section
        className={`grid w-full gap-4 ${
          sidebarOpen && !isMobile ? 'lg:grid-cols-[260px_minmax(0,1fr)]' : 'lg:grid-cols-[0px_minmax(0,1fr)]'
        }`}>
        <aside
          ref={sidebarRef}
          className={`hidden overflow-hidden rounded-2xl bg-white px-5 py-6 lg:block relative transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-[260px] border border-web/50 opacity-100' : 'w-0 px-0 py-0 opacity-0'
          }`}>
          {sidebarOpen && (
            <>
              <p className='mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#1F3B29]'>Categories</p>
              {isLoadingCategories ? (
                <div className='px-2 py-4 text-sm text-gray-500'>Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className='px-2 py-4 text-sm text-gray-500'>No categories available</div>
              ) : (
                <ul className='space-y-2 text-sm font-semibold text-[#1C1F1A]'>
                  {categories.map(category => (
                    <li
                      key={category._id}
                      className='flex cursor-pointer items-center justify-between rounded-xl px-2 py-2 hover:bg-[#F5EEE5] transition-colors'>
                      <Link
                        href={`/products?category=${encodeURIComponent(category.slug || category.name)}`}
                        className='flex items-center gap-2 text-[#3F5C45] flex-1'>
                        {category.icon ? (
                          <Image src={category.icon} alt={category.name} width={14} height={14} className='object-contain flex-shrink-0' />
                        ) : (
                          <Diamond size={14} />
                        )}
                        <span>{category.name}</span>
                      </Link>
                      <ChevronRight size={14} className='text-[#3F5C45]' />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </aside>

        <div className='w-full'>
          {showLoadingState ? (
            <div className='flex items-center justify-center min-h-60 sm:min-h-80 rounded-2xl bg-gray-100'>
              <p className='text-gray-500 text-sm sm:text-base'>Loading banners...</p>
            </div>
          ) : (
            <Swiper
              onSwiper={swiper => {
                heroSwiperRef.current = swiper;
              }}
              onBeforeDestroy={swiper => {
                // Prevent Swiper from removing DOM nodes that React manages
                if (heroSwiperRef.current === swiper) {
                  heroSwiperRef.current = null;
                }
              }}
              modules={[Pagination]}
              spaceBetween={0}
              slidesPerView={1}
              loop
              pagination={{ clickable: true, dynamicBullets: true }}
              className='hero-swiper pb-10!'>
              {slidesToRender.map(slide => (
                <SwiperSlide key={slide.id}>
                  <div className='grid w-full grid-cols-1 gap-3 sm:gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-[1.65fr_0.9fr]'>
                    <div className='relative flex min-h-[280px] sm:min-h-[350px] md:min-h-[380px] lg:min-h-80 flex-col justify-center overflow-hidden rounded-2xl px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-12 text-white'>
                      <Image
                        src={slide.main.image}
                        alt={slide.main.title}
                        fill
                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 65vw'
                        className='object-cover'
                        priority
                      />
                      <div
                        className='absolute inset-0'
                        style={{
                          backgroundColor: slide.backgroundColor ? `${slide.backgroundColor}80` : 'rgba(0, 0, 0, 0.4)',
                        }}
                      />
                      <div className='relative z-10 space-y-2 sm:space-y-4'>
                        {slide.main.subtitle && (
                          <p className='text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/80'>
                            {slide.main.subtitle}
                          </p>
                        )}
                        <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight'>
                          {slide.main.title}
                        </h1>
                        <p className='max-w-lg text-xs sm:text-sm md:text-base text-white/90'>{slide.main.description}</p>
                        <Link
                          href={slide.link || '/products'}
                          className='inline-flex items-center justify-center rounded-full bg-white px-6 sm:px-7 md:px-9 lg:px-10 py-2.5 sm:py-3 md:py-3.5 text-xs sm:text-sm md:text-base font-semibold text-[#1F3B29] hover:bg-[#F5EEE5] transition-colors whitespace-nowrap'>
                          {slide.main.buttonText}
                        </Link>
                      </div>
                    </div>

                    <div className='relative hidden md:flex min-h-[200px] sm:min-h-[250px] md:min-h-[240px] lg:min-h-60 flex-col justify-end overflow-hidden rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-white'>
                      <Image
                        src={slide.side.image}
                        alt={slide.side.title}
                        fill
                        sizes='(max-width: 1024px) 50vw, 35vw'
                        className='object-cover'
                        loading='lazy'
                      />
                      <div
                        className='absolute inset-0'
                        style={{
                          backgroundColor: slide.backgroundColor ? `${slide.backgroundColor}80` : 'rgba(0, 0, 0, 0.4)',
                        }}
                      />
                      <div className='relative z-10 space-y-1 sm:space-y-2'>
                        {slide.side.subtitle && (
                          <p className='text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/80'>
                            {slide.side.subtitle}
                          </p>
                        )}
                        <h2 className='text-lg sm:text-xl md:text-2xl font-semibold text-white'>{slide.side.title}</h2>
                        <p className='text-[10px] sm:text-xs text-white/80'>{slide.side.description}</p>
                        <Link
                          href={slide.link || '/products'}
                          className='inline-flex items-center justify-center rounded-full bg-white/20 px-5 sm:px-6 md:px-7 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white hover:bg-white/30 transition-colors whitespace-nowrap'>
                          {slide.side.buttonText}
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>
    </>
  );
};

const CategoryStrip = memo(({ categoriesData, isLoading = false }: { categoriesData?: CategoryStripItem[]; isLoading?: boolean }) => {
  const items = useMemo(() => (categoriesData && categoriesData.length > 0 ? categoriesData : []), [categoriesData]);
  const showSkeleton = isLoading && (!categoriesData || categoriesData.length === 0);

  return (
    <section className='w-full space-y-6 bg-white'>
      {showSkeleton ? (
        <CategoryStripSkeleton />
      ) : (
        <div className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4 md:gap-6 pt-6 sm:pt-8'>
          {items.map(item => (
            <Link
              key={`${item.slug || item.name}-${item.image}`}
              href={`/products?category=${encodeURIComponent(item.slug || item.name)}`}
              className='group flex flex-col items-center gap-3 transition-transform duration-300 hover:scale-105'>
              <div className='relative aspect-square w-full overflow-hidden rounded-full bg-linear-to-br from-[#F5EEE5] to-white shadow-lg ring-2 ring-[#E6D3C2] transition-shadow duration-300 group-hover:shadow-xl group-hover:ring-[#C8A15B]'>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw'
                  className='object-cover transition-transform duration-300 group-hover:scale-110'
                  loading='lazy'
                />
                <div className='absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
              </div>
              <h3 className='text-center text-xs sm:text-sm font-semibold tracking-wide text-[#1F3B29] transition-colors duration-300 group-hover:text-[#C8A15B] md:text-base'>
                {item.name}
              </h3>
            </Link>
          ))}
        </div>
      )}

      {/* <div className='text-center'>
        <button
          type='button'
          className='rounded-lg border-2 border-[#1F3B29] bg-white px-8 py-3 text-xs font-bold uppercase tracking-wide text-[#1F3B29] transition-all duration-300 hover:bg-[#1F3B29] hover:text-white sm:text-sm'>
          View All Categories
        </button>
      </div>

      <div className='mt-6 flex items-center justify-center gap-2'>
        <div className='h-px w-8 bg-[#E6D3C2]' />
        <Diamond size={16} className='text-[#C8A15B]' />
        <div className='h-px w-8 bg-[#E6D3C2]' />
      </div> */}
    </section>
  );
});
CategoryStrip.displayName = 'CategoryStrip';

const FeaturedSlider = memo(({ products, isLoading = false }: { products?: ProductCardData[]; isLoading?: boolean }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const resolvedProducts = useMemo(() => (products && products.length > 0 ? products : []), [products]);
  const showLoading = isLoading && (!products || products.length === 0);

  useEffect(() => {
    return () => {
      // Cleanup Swiper instance on unmount
      if (swiperRef.current) {
        try {
          // Only destroy if swiper instance still exists and is initialized
          if (swiperRef.current.initialized) {
            swiperRef.current.destroy(false, false); // Don't remove DOM, React will handle it
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        swiperRef.current = null;
      }
    };
  }, []);

  const rightSlot = (
    <div className='flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0'>
      <div className='flex gap-1.5 sm:gap-2'>
        <button
          ref={prevButtonRef}
          type='button'
          onClick={() => swiperRef.current?.slidePrev()}
          className='flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-web bg-white hover:bg-[#F5EEE5] transition-colors'>
          <ChevronLeft size={16} className='sm:w-[18px] sm:h-[18px] md:w-5 md:h-5' />
        </button>
        <button
          ref={nextButtonRef}
          type='button'
          onClick={() => swiperRef.current?.slideNext()}
          className='flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-web bg-white hover:bg-[#F5EEE5] transition-colors'>
          <ChevronRight size={16} className='sm:w-[18px] sm:h-[18px] md:w-5 md:h-5' />
        </button>
      </div>
      <Link
        href='/products'
        className='cursor-pointer inline-flex items-center gap-1 text-[10px] sm:text-xs md:text-sm font-semibold text-[#1F3B29] hover:text-[#C8A15B] transition-colors whitespace-nowrap flex-shrink-0'>
        View all
        <ChevronRight size={14} className='sm:w-4 sm:h-4 md:w-5 md:h-5' />
      </Link>
    </div>
  );

  return (
    <section className='w-full space-y-4 bg-white overflow-hidden'>
      <div className='border-b border-web pb-3'>
        <SectionHeader title='New Products' rightSlot={rightSlot} />
      </div>
      {showLoading ? (
        <ProductSliderSkeleton count={6} />
      ) : resolvedProducts.length === 0 ? (
        <div className='flex items-center justify-center py-8'>
          <p className='text-gray-500'>No products available</p>
        </div>
      ) : (
        <Swiper
          onSwiper={swiper => {
            swiperRef.current = swiper;
          }}
          onBeforeDestroy={swiper => {
            // Prevent Swiper from removing DOM nodes that React manages
            if (swiperRef.current === swiper) {
              swiperRef.current = null;
            }
          }}
          modules={[]}
          spaceBetween={12}
          slidesPerView='auto'
          breakpoints={{
            320: {
              spaceBetween: 12,
            },
            640: {
              spaceBetween: 14,
            },
            768: {
              spaceBetween: 16,
            },
            1024: {
              spaceBetween: 20,
            },
          }}
          className='pb-2'>
          {resolvedProducts.map(product => (
            <SwiperSlide key={product.id} style={{ width: 'auto', minWidth: '260px', maxWidth: '300px' }}>
              <ProductCard product={product} className='w-full' />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
});
FeaturedSlider.displayName = 'FeaturedSlider';

const TrendingProducts = memo(({ products, isLoading = false }: { products?: ProductCardData[]; isLoading?: boolean }) => {
  const resolvedProducts = useMemo(() => (products && products.length > 0 ? products : []), [products]);
  const showLoading = isLoading && (!products || products.length === 0);

  const rightSlot = (
    <div className='flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0'>
      <div className='flex gap-1.5 sm:gap-2'>
        <button
          type='button'
          className='trending-prev-btn flex h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-web bg-white transition-all hover:scale-110 active:scale-95'>
          <ChevronLeft size={14} className='sm:w-4 sm:h-4 md:w-5 md:h-5' />
        </button>
        <button
          type='button'
          className='trending-next-btn flex h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-web bg-white transition-all hover:scale-110 active:scale-95'>
          <ChevronRight size={14} className='sm:w-4 sm:h-4 md:w-5 md:h-5' />
        </button>
      </div>
      <Link
        href='/products?trending=true'
        className='cursor-pointer inline-flex items-center gap-1 text-[10px] sm:text-xs md:text-sm font-semibold text-[#1F3B29] whitespace-nowrap hover:text-[#C8A15B] transition-colors flex-shrink-0'>
        View all
        <ChevronRight size={12} className='sm:w-3.5 sm:h-3.5 md:w-5 md:h-5' />
      </Link>
    </div>
  );

  return (
    <section className='w-full space-y-4 bg-white overflow-hidden'>
      <div className='border-b border-web pb-3'>
        <SectionHeader title='Trending Products' rightSlot={rightSlot} />
      </div>
      {showLoading ? (
        <ProductGridSkeleton count={4} />
      ) : resolvedProducts.length === 0 ? (
        <div className='flex items-center justify-center py-8'>
          <p className='text-gray-500'>No trending products available</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5 lg:gap-6 pb-2'>
          {resolvedProducts.map(product => (
            <ProductCard key={product.id} product={product} className='min-w-0 w-full max-w-none' />
          ))}
        </div>
      )}
    </section>
  );
});
TrendingProducts.displayName = 'TrendingProducts';

const PromoShowcase = memo(() => {
  return (
    <section className='w-full bg-[#F3F5F7]'>
      <div className='mx-auto grid items-center gap-6 md:grid-cols-2 w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12'>
        <div className='flex gap-4'>
          <div className='relative h-64 w-1/2 rounded-2xl overflow-hidden lg:h-[420px]'>
            <Image
              src='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'
              alt='Model 1'
              fill
              sizes='50vw'
              className='object-cover'
              loading='lazy'
            />
          </div>
          <div className='relative mt-8 h-64 w-1/2 rounded-2xl overflow-hidden lg:h-[350px]'>
            <Image
              src='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'
              alt='Model 2'
              fill
              sizes='50vw'
              className='object-cover'
              loading='lazy'
            />
          </div>
        </div>

        <div>
          <h2 className='text-xl font-semibold leading-snug text-[#1F3B29] sm:text-2xl md:text-3xl'>
            Collection inspired <br className='hidden sm:block' /> by LuxeLoom
          </h2>

          <p className='mt-4 text-sm leading-relaxed text-[#4F3A2E] sm:text-base'>
            These adornments are worn around the neck and come in various lengths. Each piece is crafted to feel light yet luxurious.
          </p>

          <Link
            href='/products'
            className='inline-block mt-6 rounded-full bg-[#1F3B29] px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base text-white hover:bg-[#2a4d3a] transition-colors whitespace-nowrap'>
            Explore More
          </Link>
        </div>
      </div>
    </section>
  );
});
PromoShowcase.displayName = 'PromoShowcase';

const CollectionsSection = memo(({ dazzleData, isLoading = false }: { dazzleData: DazzleCard[]; isLoading?: boolean }) => {
  const router = useRouter();

  if (isLoading && dazzleData.length === 0) {
    return <CollectionsSkeleton />;
  }

  const cardsToShow =
    dazzleData.length > 0
      ? dazzleData
      : [
          {
            _id: 'fallback-1',
            title: 'Modern heirlooms',
            subtitle: 'Ancient jewelry collection',
            description: 'Beautiful long earrings with opal and carnelian stones—lightweight and radiant.',
            buttonText: 'Explore more',
            buttonLink: '/products',
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
          },
          {
            _id: 'fallback-2',
            title: 'Modern heirlooms',
            subtitle: 'Premium Collection',
            description:
              'Since many jewelry products can be ultra expensive, it becomes necessary for shoppers to know what exactly they can expect.',
            buttonText: 'Shop now',
            buttonLink: '/products',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
          },
        ];

  return (
    <section className='w-full overflow-hidden'>
      <div className='border-b border-web pb-3'>
        <SectionHeader title='Dazzle in Every Moment' actionLabel='View all' onActionClick={() => router.push('/products')} />
      </div>

      <div className='mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-4 md:grid-cols-2 md:gap-6'>
        {cardsToShow.map((card, index) => {
          // First card: image on left, content on right
          if (index === 0) {
            return (
              <div
                key={card._id}
                className='flex flex-col items-center gap-4 sm:gap-6 rounded-2xl bg-[#F3F5F7] p-4 sm:p-6 md:p-8 md:flex-row'>
                {card.image && (
                  <div className='relative h-48 sm:h-64 md:h-[300px] w-full rounded-xl overflow-hidden md:h-full md:w-1/2'>
                    <Image
                      src={card.image}
                      alt={card.subtitle || card.title || 'Collection image'}
                      fill
                      className='object-cover'
                      sizes='(max-width: 768px) 100vw, 50vw'
                    />
                  </div>
                )}

                <div className='flex flex-col justify-center w-full md:w-1/2 md:pl-6'>
                  {card.subtitle && <h3 className='text-xl sm:text-2xl md:text-3xl font-semibold text-[#1C1F1A]'>{card.subtitle}</h3>}
                  {card.description && (
                    <p className='mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-[#4F3A2E]'>{card.description}</p>
                  )}

                  <Link
                    href={card.buttonLink || '/products'}
                    className='inline-flex mt-4 sm:mt-5 md:mt-6 w-fit items-center gap-2 rounded-full bg-[#1F3B29] px-6 sm:px-7 md:px-9 lg:px-10 py-2.5 sm:py-3 md:py-3.5 text-xs sm:text-sm md:text-base text-white hover:bg-[#2a4d3a] transition-colors whitespace-nowrap'>
                    {card.buttonText || 'Explore more'}
                  </Link>
                </div>
              </div>
            );
          }

          // Other cards: content on top, image on bottom
          return (
            <div key={card._id} className='flex flex-col gap-3 sm:gap-4 md:gap-5 rounded-2xl bg-[#F3F5F7] p-4 sm:p-6 md:p-8'>
              <div>
                {card.title && <h3 className='text-lg sm:text-xl md:text-2xl font-semibold text-[#1C1F1A]'>{card.title}</h3>}
                {card.description && (
                  <p className='mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-[#4F3A2E]'>{card.description}</p>
                )}

                <Link
                  href={card.buttonLink || '/products'}
                  className='inline-flex mt-3 sm:mt-4 md:mt-5 items-center gap-2 rounded-full bg-[#1F3B29] px-6 sm:px-7 md:px-9 lg:px-10 py-2.5 sm:py-3 md:py-3.5 text-xs sm:text-sm md:text-base text-white hover:bg-[#2a4d3a] transition-colors whitespace-nowrap'>
                  {card.buttonText || 'Shop now'}
                </Link>
              </div>

              {card.image && (
                <div className='relative h-48 sm:h-64 md:h-[280px] lg:h-[330px] w-full rounded-xl overflow-hidden'>
                  <Image
                    src={card.image}
                    alt={card.title || 'Collection image'}
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 100vw, 50vw'
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
});
CollectionsSection.displayName = 'CollectionsSection';

const UpdatesSection = memo(({ newsItems, isLoading = false }: { newsItems: NewsItem[]; isLoading?: boolean }) => {
  const router = useRouter();

  if (isLoading && newsItems.length === 0) {
    return (
      <section className='max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 w-full space-y-4'>
        <div className='flex items-center justify-center py-8'>
          <p className='text-gray-500'>Loading news...</p>
        </div>
      </section>
    );
  }

  const itemsToShow = newsItems.length > 0 ? newsItems : [];

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <section className='max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 w-full space-y-4'>
      <div className='border-b border-web pb-3'>
        <SectionHeader title='Our News & Updates' actionLabel='View all' onActionClick={() => router.push('/blog')} />
      </div>
      <div className='grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 lg:grid-cols-3'>
        {itemsToShow.map(item => (
          <Link
            key={item._id}
            href={item.slug ? `/blog/${item.slug}` : '/blog'}
            className='rounded-2xl border border-web/60 bg-[#F3F5F7] p-4 shadow-sm hover:shadow-md transition-shadow'>
            <div className='relative overflow-hidden rounded-xl h-56 w-full'>
              <Image
                src={item.image || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80'}
                alt={item.title}
                fill
                sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                className='object-cover'
                loading='lazy'
              />
            </div>

            <div className='mt-4 text-[#1C1F1A]'>
              <p className='text-xs text-[#4F3A2E]'>News &nbsp; | &nbsp; {formatDate(item.publishDate)}</p>

              <h3 className='mt-2 text-lg font-semibold'>{item.title}</h3>

              <p className='mt-2 text-sm text-[#4F3A2E]'>{item.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
});
UpdatesSection.displayName = 'UpdatesSection';

const GallerySection = memo(({ galleryItems, isLoading = false }: { galleryItems: GalleryItem[]; isLoading?: boolean }) => {
  if (isLoading && galleryItems.length === 0) {
    return <GallerySkeleton />;
  }

  const itemsToShow = galleryItems.length > 0 ? galleryItems : [];

  return (
    <section className='w-full overflow-hidden'>
      <SectionHeader title='Gallery' align='center' description='A glimpse into our recent shoots and studio moments.' />

      <div className='mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5'>
        {itemsToShow.map(item => (
          <div
            key={`gallery-image-${item._id}`}
            className='relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow h-32 sm:h-40 md:h-56 lg:h-64'>
            <Image
              src={item.image}
              alt='Gallery image'
              fill
              className='object-cover'
              sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            />
          </div>
        ))}
      </div>
    </section>
  );
});
GallerySection.displayName = 'GallerySection';

const WhyChooseUs = memo(({ features, isLoading = false }: { features?: HomepageFeatureItem[]; isLoading?: boolean }) => {
  const resolvedFeatures = useMemo(() => (features && features.length > 0 ? features : fallbackFeatureData), [features]);
  const isPending = isLoading && (!features || features.length === 0);

  return (
    <section className='w-full overflow-hidden'>
      <SectionHeader
        title='Why Choose Us'
        description='Experience the difference with our premium services and commitment to excellence.'
        align='center'
      />

      <div className='mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5 lg:grid-cols-6'>
        {resolvedFeatures.map(feature => {
          const IconComponent: LucideIcon = FEATURE_ICON_COMPONENTS[feature.icon] || Sparkles;
          return (
            <div
              key={`${feature.title}-${feature.icon}`}
              className={`flex flex-col items-center rounded-2xl border border-web/50 bg-white p-3 sm:p-4 md:p-5 text-center ${
                isPending ? 'animate-pulse' : ''
              }`}>
              <div className='mb-2 sm:mb-3 rounded-full bg-[#F5EEE5] p-3 sm:p-4 text-[#1F3B29]'>
                <IconComponent size={20} className='sm:w-6 sm:h-6 md:w-7 md:h-7' />
              </div>
              <h3 className='text-xs sm:text-sm font-semibold text-[#1F3B29]'>{feature.title}</h3>
              <p className='mt-1 sm:mt-2 text-[10px] sm:text-xs text-[#4F3A2E]'>{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
});
WhyChooseUs.displayName = 'WhyChooseUs';

const BestSellers = memo(({ products, isLoading = false }: { products?: ProductCardData[]; isLoading?: boolean }) => {
  const router = useRouter();
  const items = useMemo(() => (products && products.length > 0 ? products : []), [products]);
  const showLoading = isLoading && (!products || products.length === 0);

  return (
    <section className='w-full space-y-6 overflow-hidden'>
      <div className='border-b border-web pb-3'>
        <SectionHeader
          title='Best Sellers'
          description='Our most loved products'
          actionLabel='View all'
          onActionClick={() => router.push('/products?featured=true')}
        />
      </div>
      {showLoading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5 lg:gap-6'>
          {items.map(product => (
            <ProductCard key={product.id} product={product} className='w-full max-w-none' />
          ))}
        </div>
      )}
    </section>
  );
});
BestSellers.displayName = 'BestSellers';

const Testimonials = memo(() => {
  return (
    <section className='w-full'>
      <SectionHeader
        title='What Our Customers Say'
        description="Don't just take our word for it — hear from our satisfied customers."
        align='center'
      />

      <div className='mt-6 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3'>
        {testimonials.map(testimonial => (
          <div key={testimonial.id} className='rounded-2xl border border-web/50 bg-white p-4 sm:p-6 shadow-sm'>
            <div className='mb-3 sm:mb-4 flex items-center gap-1'>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className='sm:w-4 sm:h-4 text-[#C8A15B]' />
              ))}
            </div>
            <p className='mb-4 sm:mb-6 text-xs sm:text-sm text-[#4F3A2E] italic'>&ldquo;{testimonial.comment}&rdquo;</p>
            <div className='flex items-center gap-3 sm:gap-4'>
              <div className='relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden flex-shrink-0'>
                <Image src={testimonial.image} alt={testimonial.name} fill sizes='56px' className='object-cover' loading='lazy' />
              </div>
              <div>
                <h4 className='text-xs sm:text-sm font-semibold text-[#1F3B29]'>{testimonial.name}</h4>
                <p className='text-[10px] sm:text-xs text-[#4F3A2E]'>{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
Testimonials.displayName = 'Testimonials';

const Subscribe = memo(() => {
  return (
    <section className='relative w-full py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden'>
      {/* Background Video */}
      <video autoPlay loop muted playsInline className='absolute inset-0 w-full h-full object-cover'>
        <source src='/uploads/vid.mp4' type='video/mp4' />
      </video>

      {/* Dark Overlay */}
      <div className='absolute inset-0 bg-black/40' />

      {/* Content */}
      <div className='relative mx-auto max-w-[1440px] w-full px-4 sm:px-6 md:px-8 lg:px-12 text-center text-white z-10'>
        <h3 className='mb-3 sm:mb-4 md:mb-5 text-lg sm:text-xl md:text-2xl'>Stay Informed with Our</h3>
        <p className='mb-6 sm:mb-8 md:mb-10 text-2xl sm:text-3xl md:text-4xl font-light'>Latest News and Updates</p>

        <div className='flex w-full max-w-2xl mx-auto flex-col items-stretch gap-2 sm:gap-3 rounded-full border border-white/50 bg-white/90 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-left sm:flex-row sm:items-center'>
          <input
            type='text'
            placeholder='Enter Your Email'
            className='flex-1 rounded-full bg-transparent px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base text-[#1F3B29] placeholder:text-[#4F3A2E] focus:outline-none'
          />

          <button
            type='button'
            className='cursor-pointer rounded-full bg-[#1F3B29] px-6 sm:px-7 md:px-9 lg:px-10 py-2.5 sm:py-3 md:py-3.5 lg:py-4 text-xs sm:text-sm md:text-base font-semibold text-white whitespace-nowrap transition-colors hover:bg-[#2a4d3a]'>
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
});
Subscribe.displayName = 'Subscribe';

const NewArrivalsSection = memo(
  ({
    banner,
    cards,
    isLoading = false,
  }: {
    banner: {
      title: string;
      subtitle: string;
      description: string;
      backgroundImage: string;
    } | null;
    cards: {
      _id: string;
      title: string;
      image: string;
      type: 'card' | 'banner';
    }[];
    isLoading?: boolean;
  }) => {
    if (isLoading && !banner && cards.length === 0) {
      return <NewArrivalsSkeleton />;
    }

    const bannerData = banner || {
      title: 'New Arrivals',
      subtitle: '💎 500+ New Items',
      description: 'New Arrivals Dropping Daily, Monday through Friday.\nExplore the Latest Launches Now!',
      backgroundImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1920&q=80',
    };

    // Filter cards to show only 'card' type items
    const cardsToShow = cards.filter(card => card.type === 'card' || !card.type);

    const fallbackCards = [
      {
        _id: 'fallback-1',
        title: 'Silver Idols',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
        type: 'card' as const,
      },
      {
        _id: 'fallback-2',
        title: 'Floral Bloom',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
        type: 'card' as const,
      },
    ];

    const displayCards = cardsToShow.length > 0 ? cardsToShow : fallbackCards;

    return (
      <section className='relative w-full'>
        {/* Background Banner */}
        <div className='relative h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] w-full'>
          <Image src={bannerData.backgroundImage} alt='New Arrivals Banner' fill className='object-cover' priority sizes='100vw' />

          <div className='absolute inset-0 bg-black/20'></div>

          <div className='absolute inset-0 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 text-white'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold'>{bannerData.title}</h2>

            {bannerData.subtitle && (
              <div className='mt-2 sm:mt-3 md:mt-4 bg-white/30 text-white px-3 sm:px-4 md:px-5 py-1 md:py-1.5 rounded-full w-fit backdrop-blur-md text-xs sm:text-sm md:text-base'>
                {bannerData.subtitle}
              </div>
            )}

            {bannerData.description && (
              <p className='mt-3 sm:mt-4 md:mt-5 text-sm sm:text-base md:text-lg lg:text-xl max-w-[600px] leading-relaxed whitespace-pre-line'>
                {bannerData.description}
              </p>
            )}
          </div>
        </div>

        {/* White Floating Cards */}
        {displayCards.length > 0 && (
          <div className='max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 -mt-16 sm:-mt-20 md:-mt-24 relative z-10'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6'>
              {displayCards.map(card => (
                <div key={card._id} className='bg-white rounded-xl overflow-hidden shadow-lg'>
                  <div className='relative h-[240px] sm:h-[280px] md:h-[320px] lg:h-[350px]'>
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className='object-cover'
                      sizes='(max-width: 640px) 100vw, 50vw'
                      loading='lazy'
                    />
                  </div>
                  <p className='px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl font-medium'>{card.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  },
);
NewArrivalsSection.displayName = 'NewArrivalsSection';

const TestimonialsSection = () => {
  // data/testimonials.js
  const testimonials = [
    {
      id: 1,
      name: 'Akanksha Khanna',
      age: 27,
      image: '/uploads/1765269917848-mttqdya63ws.jpg',
      text: "Delighted with my engagement ring from BlueStone! It's my dream ring, fits perfectly and is stunning to look at. Thanks, BlueStone, for helping us find the perfect symbol of love!",
      rotate: 'rotate-10',
    },
    {
      id: 2,
      name: 'Nutan Mishra',
      age: 33,
      image: '/uploads/1765272258145-ta6uom4xec.jpg',
      text: "I got a Nazariya for my baby boy from BlueStone. It's so cute seeing it on my little one's wrist, and it gives me a sense of security knowing it's there.",
      rotate: 'rotate-6',
    },
    {
      id: 3,
      name: 'Divya Mishra',
      age: 26,
      image: '/uploads/1765272281023-dyw5c7pvej.jpg',
      text: "On Valentine's Day, my husband gifted me a necklace from BlueStone, and I haven't taken it off even once. Everyone asks me where it's from!",
      rotate: '-rotate-6',
    },
    {
      id: 4,
      name: 'Anuska Ananya',
      age: 24,
      image: '/uploads/1765273359701-w2ybph2t48.webp',
      text: 'BlueStone is my go-to place for jewellery. I love that I can wear their jewellery to work, dates, parties and brunches.',
      rotate: '-rotate-10',
    },
  ];

  return (
    <section className='relative pb-20 bg-white overflow-hidden'>
      <h2 className='text-center text-3xl font-serif text-[#001e38] my-12'>Customer Testimonials</h2>

      {/* Rope */}
      <svg className='absolute top-[80px] left-0 w-full z-0' height='120' viewBox='0 0 1200 120' preserveAspectRatio='none'>
        <path d='M0 60 C 200 10, 50 90, 600 60 S 1000 30, 1200 60' stroke='#d1d5db' strokeWidth='3' fill='none' />
      </svg>

      {/* Cards */}
      <div className='relative z-10 flex justify-center gap-20'>
        {testimonials.map(item => (
          <TestimonialCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

const JewelryProductsDemo = ({ products, isLoading = false }: { products?: ProductCardData[]; isLoading?: boolean }) => {
  const resolvedProducts = useMemo(() => (products && products.length > 0 ? products.slice(0, 8) : []), [products]);
  const showLoading = isLoading && resolvedProducts.length === 0;

  return (
    <section className='w-full bg-white py-10 sm:py-12'>
      <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        <h2 className='text-center text-3xl font-serif text-[#001e38]'>Elegant Jewelry Collection</h2>
        <p className='mt-3 text-center text-sm sm:text-base text-[#4F3A2E]'>Fresh picks curated from our latest additions</p>
        {showLoading ? (
          <div className='mt-10'>
            <ProductGridSkeleton count={8} />
          </div>
        ) : (
          <div className='mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {resolvedProducts.length === 0 ? (
              <div className='col-span-full flex items-center justify-center py-10 text-sm text-gray-500'>No products available yet.</div>
            ) : (
              resolvedProducts.map(product => <ProductCard key={product.id} product={product} className='min-w-0 w-full max-w-none' />)
            )}
          </div>
        )}
        <div className='mt-10 flex justify-center'>
          <Link
            href='/jewellery'
            className='inline-flex items-center justify-center rounded-lg border border-[#001e38] px-8 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wide text-[#001e38] transition-colors hover:bg-[#001e38] hover:text-white'>
            Explore More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JewelryProductsDemo;
