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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import { blogCards, categoriess, featuredProducts, images, trendingPro } from '@/app/utils/dummyData';
import { Pagination } from 'swiper/modules';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/contexts/CategoriesContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SectionHeader } from '@/components/home/common/section-header';
import Link from 'next/link';
import { getActiveHomepageFeatures } from '@/lib/constants/features';
import { ProductCard, ProductCardData } from './common/product-card';
import { CategoriesDropdown } from './CategoriesDropdown';

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
  hero: HeroSlide[];
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

const SECTION_SPACING = 'mt-12 sm:mt-16 lg:mt-20';
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80';
const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80';

const fallbackFeatureData: HomepageFeatureItem[] = getActiveHomepageFeatures().map(feature => ({
  icon: (FEATURE_ICON_COMPONENTS[feature.icon as FeatureIconName] ? feature.icon : 'Sparkles') as FeatureIconName,
  title: feature.title,
  description: feature.description,
}));

const fallbackBestSellers: ProductCardData[] = [
  {
    id: 11,
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
    id: 12,
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
    id: 13,
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
    id: 14,
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

// Default fallback banners if no banners are available from backend
const defaultHeroSlides: HeroSlide[] = [
  {
    id: 1,
    main: {
      image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1200&q=85',
      subtitle: 'Where Luxury',
      title: 'Meets Affordability',
      description: 'Exquisite, handcrafted jewelry that celebrates elegance and individuality.',
      buttonText: 'Shop Now',
    },
    side: {
      image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1200&q=85',
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

const sidebarCategories = [
  'Rings',
  'Necklace',
  'Earring',
  'Bracelet',
  'Brooch',
  'Gold Jewellery',
  'Cufflink',
  // 'Pearls',
  // 'Piercing',
  // 'Platinum',
  // 'Navratna',
  // 'Chain',
];

const categoryIcons: Record<string, JSX.Element> = {
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
    const sellingPrice =
      typeof product?.sellingPrice === 'number'
        ? product.sellingPrice
        : typeof product?.regularPrice === 'number'
        ? product.regularPrice
        : 0;
    const regularPrice = typeof product?.regularPrice === 'number' ? product.regularPrice : sellingPrice;

    const hasDiscount = regularPrice > sellingPrice && regularPrice !== 0;

    return {
      id: typeof product?._id === 'string' ? product._id : product?._id?.toString?.() ?? `product-${index}`,
      title: product?.name || 'Untitled Product',
      category: product?.category || 'Jewellery',
      price: formatCurrency(sellingPrice),
      originalPrice: hasDiscount ? formatCurrency(regularPrice) : undefined,
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
  hero: [...defaultHeroSlides],
  categories: [...categoriess],
  newProducts: [...featuredProducts],
  featuredProducts: [...fallbackBestSellers],
  trendingProducts: [...trendingPro],
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

  useEffect(() => {
    const controller = new AbortController();

    const fetchHomepageSections = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/public/homepage', {
          cache: 'no-store',
          signal: controller.signal,
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
              const slides = mapBannersToSlides((data as any).banners);
              if (slides.length > 0) {
                nextState.hero = slides;
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

        if (!controller.signal.aborted) {
          setSectionsData(nextState);
          setErrorMessage(null);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('[v0] Failed to load homepage data:', error);
        setSectionsData(prev => prev);
        setErrorMessage('We could not load the latest homepage data. Showing default content.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchHomepageSections();

    return () => controller.abort();
  }, []);

  return (
    <>
      <div className='mx-auto flex w-full max-w-[1440px] flex-col gap-0 px-4 sm:px-6 md:px-8 lg:px-12'>
        <Hero slides={sectionsData.hero} isLoading={isLoading} />
        <CategoryStrip categoriesData={sectionsData.categories} isLoading={isLoading} />
        {errorMessage && (
          <div className='mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{errorMessage}</div>
        )}
        <div className={SECTION_SPACING}>
          <FeaturedSlider products={sectionsData.newProducts} isLoading={isLoading} />
        </div>
        <div className='mt-12 sm:mt-16 lg:mt-20'>
          <NewArrivalsSection banner={sectionsData.newArrivals.banner} cards={sectionsData.newArrivals.cards} isLoading={isLoading} />
        </div>
        <div className={SECTION_SPACING}>
          <BestSellers products={sectionsData.featuredProducts} isLoading={isLoading} />
        </div>
        <div className={SECTION_SPACING}>
          <TrendingProducts products={sectionsData.trendingProducts} isLoading={isLoading} />
        </div>
        <div className={SECTION_SPACING}>
          <CollectionsSection dazzleData={sectionsData.dazzle} isLoading={isLoading} />
        </div>
        <div className={SECTION_SPACING}>
          <Testimonials />
        </div>
        <div className={SECTION_SPACING}>
          <WhyChooseUs features={sectionsData.features} isLoading={isLoading} />
        </div>
        <div className={SECTION_SPACING}>
          <GallerySection galleryItems={sectionsData.gallery} isLoading={isLoading} />
        </div>
      </div>
      {/* Updates section - Full width */}
      <div className={SECTION_SPACING}>
        <UpdatesSection newsItems={sectionsData.news} isLoading={isLoading} />
      </div>
      <div className='mt-12 sm:mt-16 lg:mt-20'>
        <Subscribe />
      </div>
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
                    <span>{categoryIcons[category.name] || <Diamond size={18} />}</span>
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
                        <span>{categoryIcons[category.name] || <Diamond size={14} />}</span>
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
            <div className='flex items-center justify-center min-h-80 rounded-2xl bg-gray-100'>
              <p className='text-gray-500'>Loading banners...</p>
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
                  <div className='grid w-full grid-cols-1 gap-4 lg:grid-cols-[1.65fr_0.9fr]'>
                    <div className='relative flex min-h-80 flex-col justify-center overflow-hidden rounded-2xl px-8 py-10 text-white'>
                      <Image
                        src={slide.main.image}
                        alt={slide.main.title}
                        fill
                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 70vw, 70vw'
                        className='object-cover'
                      />
                      <div
                        className='absolute inset-0'
                        style={{
                          backgroundColor: slide.backgroundColor ? `${slide.backgroundColor}80` : 'rgba(0, 0, 0, 0.4)',
                        }}
                      />
                      <div className='relative z-10 space-y-4'>
                        {slide.main.subtitle && <p className='text-xs uppercase tracking-[0.3em] text-white/80'>{slide.main.subtitle}</p>}
                        <h1 className='text-3xl font-bold text-white sm:text-4xl lg:text-5xl'>{slide.main.title}</h1>
                        <p className='max-w-lg text-sm text-white/90 sm:text-base'>{slide.main.description}</p>
                        <Link
                          href={slide.link || '/products'}
                          className='inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1F3B29] hover:bg-[#F5EEE5] transition-colors'>
                          {slide.main.buttonText}
                        </Link>
                      </div>
                    </div>

                    <div className='relative flex min-h-60 flex-col justify-end overflow-hidden rounded-2xl px-6 py-6 text-white'>
                      <Image
                        src={slide.side.image}
                        alt={slide.side.title}
                        fill
                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 35vw, 35vw'
                        className='object-cover'
                      />
                      <div
                        className='absolute inset-0'
                        style={{
                          backgroundColor: slide.backgroundColor ? `${slide.backgroundColor}80` : 'rgba(0, 0, 0, 0.4)',
                        }}
                      />
                      <div className='relative z-10 space-y-2'>
                        {slide.side.subtitle && (
                          <p className='text-[11px] uppercase tracking-[0.3em] text-white/80'>{slide.side.subtitle}</p>
                        )}
                        <h2 className='text-2xl font-semibold text-white'>{slide.side.title}</h2>
                        <p className='text-xs text-white/80'>{slide.side.description}</p>
                        <Link
                          href={slide.link || '/products'}
                          className='inline-flex items-center justify-center rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/30 transition-colors'>
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

const CategoryStrip = ({ categoriesData, isLoading = false }: { categoriesData?: CategoryStripItem[]; isLoading?: boolean }) => {
  const items = categoriesData && categoriesData.length > 0 ? categoriesData : categoriess;
  const showSkeleton = isLoading && (!categoriesData || categoriesData.length === 0);
  const skeletonItems = Array.from({ length: 6 });

  return (
    <section className='w-full space-y-6 bg-white'>
      {/* <div className='mb-6 text-center'>
        <div className='mb-3 flex items-center justify-center gap-2'>
          <div className='h-px w-8 bg-[#E6D3C2]' />
          <Diamond size={16} className='text-[#C8A15B]' />
          <div className='h-px w-8 bg-[#E6D3C2]' />
        </div>
        <h2 className='mb-3 text-2xl font-bold tracking-tight text-[#1F3B29] sm:text-3xl md:text-4xl'>SHOP BY CATEGORY</h2>
        <p className='mx-auto max-w-xl text-sm font-normal leading-relaxed text-[#3F5C45] sm:text-base md:text-lg'>
          Explore our diverse selections. Find your style.
        </p>
      </div> */}

      <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 md:gap-6 pt-8'>
        {showSkeleton
          ? skeletonItems.map((_, index) => (
              <div key={`category-skeleton-${index}`} className='flex flex-col items-center gap-3 rounded-full animate-pulse'>
                <div className='aspect-square w-full rounded-full bg-[#F5EEE5]' />
                <div className='h-3 w-16 rounded-full bg-[#F5EEE5]' />
              </div>
            ))
          : items.map(item => (
              <Link
                key={`${item.slug || item.name}-${item.image}`}
                href={`/products?category=${encodeURIComponent(item.slug || item.name)}`}
                className='group flex flex-col items-center gap-3 transition-transform duration-300 hover:scale-105'>
                <div className='relative aspect-square w-full overflow-hidden rounded-full bg-linear-to-br from-[#F5EEE5] to-white shadow-lg ring-2 ring-[#E6D3C2] transition-shadow duration-300 group-hover:shadow-xl group-hover:ring-[#C8A15B]'>
                  <img
                    src={item.image}
                    alt={item.name}
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
                  />
                  <div className='absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                </div>
                <h3 className='text-center text-sm font-semibold tracking-wide text-[#1F3B29] transition-colors duration-300 group-hover:text-[#C8A15B] sm:text-base'>
                  {item.name}
                </h3>
              </Link>
            ))}
      </div>

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
};

const FeaturedSlider = ({ products, isLoading = false }: { products?: ProductCardData[]; isLoading?: boolean }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const resolvedProducts = products && products.length > 0 ? products : featuredProducts;
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
    <div className='flex items-center gap-6 text-[#1F3B29]'>
      <div className='flex gap-3'>
        <button
          ref={prevButtonRef}
          type='button'
          onClick={() => swiperRef.current?.slidePrev()}
          className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-web bg-white hover:bg-[#F5EEE5] transition-colors'>
          <ChevronLeft size={18} />
        </button>
        <button
          ref={nextButtonRef}
          type='button'
          onClick={() => swiperRef.current?.slideNext()}
          className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-web bg-white hover:bg-[#F5EEE5] transition-colors'>
          <ChevronRight size={18} />
        </button>
      </div>
      <Link
        href='/products'
        className='cursor-pointer inline-flex items-center gap-1 text-xs font-semibold text-[#1F3B29] hover:text-[#C8A15B] transition-colors'>
        View all
        <ChevronRight size={16} />
      </Link>
    </div>
  );

  return (
    <section className='w-full space-y-4 bg-white'>
      <div className='border-b border-web pb-3'>
        <SectionHeader title='New Products' rightSlot={rightSlot} />
      </div>
      {showLoading ? (
        <div className='flex items-center justify-center py-8'>
          <p className='text-gray-500'>Loading products...</p>
        </div>
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
          spaceBetween={20}
          slidesPerView='auto'
          className='pb-2'>
          {resolvedProducts.map(product => (
            <SwiperSlide key={product.id} style={{ width: 'auto' }}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
};

const TrendingProducts = ({ products, isLoading = false }: { products?: ProductCardData[]; isLoading?: boolean }) => {
  const resolvedProducts = products && products.length > 0 ? products : trendingPro;
  const showLoading = isLoading && (!products || products.length === 0);

  const rightSlot = (
    <div className='flex items-center gap-3 sm:gap-4 md:gap-6 text-[#1F3B29]'>
      <div className='flex gap-2 sm:gap-3'>
        <button
          type='button'
          className='trending-prev-btn flex h-7 w-7 sm:h-8 sm:w-8 cursor-pointer items-center justify-center rounded-full border border-web bg-white transition-all hover:scale-110 active:scale-95'>
          <ChevronLeft size={16} className='sm:w-[18px] sm:h-[18px]' />
        </button>
        <button
          type='button'
          className='trending-next-btn flex h-7 w-7 sm:h-8 sm:w-8 cursor-pointer items-center justify-center rounded-full border border-web bg-white transition-all hover:scale-110 active:scale-95'>
          <ChevronRight size={16} className='sm:w-[18px] sm:h-[18px]' />
        </button>
      </div>
      <Link
        href='/products?trending=true'
        className='cursor-pointer inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-[#1F3B29] whitespace-nowrap hover:text-[#C8A15B] transition-colors'>
        View all
        <ChevronRight size={14} className='sm:w-4 sm:h-4' />
      </Link>
    </div>
  );

  return (
    <section className='w-full space-y-4 bg-white'>
      <div className='border-b border-web pb-3'>
        <SectionHeader title='Trending Products' rightSlot={rightSlot} />
      </div>
      {showLoading ? (
        <div className='flex items-center justify-center py-8'>
          <p className='text-gray-500'>Loading trending products...</p>
        </div>
      ) : resolvedProducts.length === 0 ? (
        <div className='flex items-center justify-center py-8'>
          <p className='text-gray-500'>No trending products available</p>
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 pb-2'>
          {resolvedProducts.map(product => (
            <ProductCard key={product.id} product={product} className='min-w-0 w-full' />
          ))}
        </div>
      )}
    </section>
  );
};

const PromoShowcase = () => {
  return (
    <section className='w-full bg-[#F3F5F7]'>
      <div className='mx-auto grid items-center gap-6 md:grid-cols-2 w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12'>
        <div className='flex gap-4'>
          <img
            src='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'
            alt='Model 1'
            className='h-64 w-1/2 rounded-2xl object-cover lg:h-[420px]'
          />
          <img
            src='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'
            alt='Model 2'
            className='mt-8 h-64 w-1/2 rounded-2xl object-cover lg:h-[350px]'
          />
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
            className='inline-block mt-6 rounded-full bg-[#1F3B29] px-6 py-2 text-sm text-white hover:bg-[#2a4d3a] transition-colors'>
            Explore More
          </Link>
        </div>
      </div>
    </section>
  );
};

const CollectionsSection = ({ dazzleData, isLoading = false }: { dazzleData: DazzleCard[]; isLoading?: boolean }) => {
  const router = useRouter();

  if (isLoading && dazzleData.length === 0) {
    return (
      <section className='w-full'>
        <div className='flex items-center justify-center py-8'>
          <p className='text-gray-500'>Loading section...</p>
        </div>
      </section>
    );
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
    <section className='w-full'>
      <div className='border-b border-web pb-3'>
        <SectionHeader title='Dazzle in Every Moment' actionLabel='View all' onActionClick={() => router.push('/products')} />
      </div>

      <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
        {cardsToShow.map((card, index) => {
          // First card: image on left, content on right
          if (index === 0) {
            return (
              <div key={card._id} className='flex flex-col items-center gap-6 rounded-2xl bg-[#F3F5F7] p-6 md:flex-row'>
                {card.image && (
                  <img
                    src={card.image}
                    className='h-64 w-full rounded-xl object-cover md:h-full md:w-1/2'
                    alt={card.subtitle || card.title || 'Collection image'}
                  />
                )}

                <div className='flex flex-col justify-center'>
                  {card.subtitle && <h3 className='text-2xl font-semibold text-[#1C1F1A]'>{card.subtitle}</h3>}
                  {card.description && <p className='mt-3 text-sm text-[#4F3A2E]'>{card.description}</p>}

                  <Link
                    href={card.buttonLink || '/products'}
                    className='inline-flex mt-5 w-fit items-center gap-2 rounded-full bg-[#1F3B29] px-5 py-2 text-sm text-white hover:bg-[#2a4d3a] transition-colors'>
                    {card.buttonText || 'Explore more'}
                  </Link>
                </div>
              </div>
            );
          }

          // Other cards: content on top, image on bottom
          return (
            <div key={card._id} className='flex flex-col gap-4 rounded-2xl bg-[#F3F5F7] p-6'>
              <div>
                {card.title && <h3 className='text-xl font-semibold text-[#1C1F1A]'>{card.title}</h3>}
                {card.description && <p className='mt-3 text-sm text-[#4F3A2E]'>{card.description}</p>}

                <Link
                  href={card.buttonLink || '/products'}
                  className='inline-flex mt-4 items-center gap-2 rounded-full bg-[#1F3B29] px-5 py-2 text-sm text-white hover:bg-[#2a4d3a] transition-colors'>
                  {card.buttonText || 'Shop now'}
                </Link>
              </div>

              {card.image && (
                <img src={card.image} className='h-[330px] w-full rounded-xl object-cover' alt={card.title || 'Collection image'} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const UpdatesSection = ({ newsItems, isLoading = false }: { newsItems: NewsItem[]; isLoading?: boolean }) => {
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

  const itemsToShow =
    newsItems.length > 0
      ? newsItems
      : blogCards.map((card, index) => ({
          _id: `fallback-${index}`,
          title: card.title,
          excerpt: card.desc,
          image: card.img,
          publishDate: card.date,
          slug: '',
        }));

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
            <div className='overflow-hidden rounded-xl'>
              <img
                src={item.image || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80'}
                alt={item.title}
                className='h-56 w-full object-cover'
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
};

const GallerySection = ({ galleryItems, isLoading = false }: { galleryItems: GalleryItem[]; isLoading?: boolean }) => {
  if (isLoading && galleryItems.length === 0) {
    return (
      <section className='w-full'>
        <div className='flex items-center justify-center py-8'>
          <p className='text-gray-500'>Loading gallery...</p>
        </div>
      </section>
    );
  }

  const itemsToShow =
    galleryItems.length > 0
      ? galleryItems
      : images.map((src, index) => ({
          _id: `fallback-${index}`,
          image: src,
        }));

  return (
    <section className='w-full'>
      <SectionHeader title='Gallery' align='center' description='A glimpse into our recent shoots and studio moments.' />

      <div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
        {itemsToShow.map(item => (
          <div key={`gallery-image-${item._id}`} className='overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow'>
            <img src={item.image} className='h-40 w-full object-cover sm:h-56 lg:h-64' alt='Gallery image' />
          </div>
        ))}
      </div>
    </section>
  );
};

const WhyChooseUs = ({ features, isLoading = false }: { features?: HomepageFeatureItem[]; isLoading?: boolean }) => {
  const resolvedFeatures = features && features.length > 0 ? features : fallbackFeatureData;
  const isPending = isLoading && (!features || features.length === 0);

  return (
    <section className='w-full'>
      <SectionHeader
        title='Why Choose Us'
        description='Experience the difference with our premium services and commitment to excellence.'
        align='center'
      />

      <div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6'>
        {resolvedFeatures.map(feature => {
          const IconComponent: LucideIcon = FEATURE_ICON_COMPONENTS[feature.icon] || Sparkles;
          return (
            <div
              key={`${feature.title}-${feature.icon}`}
              className={`flex flex-col items-center rounded-2xl border border-web/50 bg-white p-5 text-center ${
                isPending ? 'animate-pulse' : ''
              }`}>
              <div className='mb-3 rounded-full bg-[#F5EEE5] p-4 text-[#1F3B29]'>
                <IconComponent size={28} />
              </div>
              <h3 className='text-sm font-semibold text-[#1F3B29]'>{feature.title}</h3>
              <p className='mt-2 text-xs text-[#4F3A2E]'>{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const BestSellers = ({ products, isLoading = false }: { products?: ProductCardData[]; isLoading?: boolean }) => {
  const items = products && products.length > 0 ? products : fallbackBestSellers;
  const showLoading = isLoading && (!products || products.length === 0);

  return (
    <section className='w-full space-y-6'>
      <div className='border-b border-web pb-3'>
        <SectionHeader
          title='Best Sellers'
          description='Our most loved products'
          actionLabel='View all'
          onActionClick={() => router.push('/products?featured=true')}
        />
      </div>
      {showLoading ? (
        <div className='flex items-center justify-center py-8'>
          <p className='text-gray-500'>Loading featured products...</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {items.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

const Testimonials = () => {
  return (
    <section className='w-full'>
      <SectionHeader
        title='What Our Customers Say'
        description="Don't just take our word for it — hear from our satisfied customers."
        align='center'
      />

      <div className='mt-8 grid grid-cols-1 gap-6 md:grid-cols-3'>
        {testimonials.map(testimonial => (
          <div key={testimonial.id} className='rounded-2xl border border-web/50 bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-center gap-1'>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className='text-[#C8A15B]' />
              ))}
            </div>
            <p className='mb-6 text-sm text-[#4F3A2E] italic'>&ldquo;{testimonial.comment}&rdquo;</p>
            <div className='flex items-center gap-4'>
              <img src={testimonial.image} alt={testimonial.name} className='h-14 w-14 rounded-full object-cover' />
              <div>
                <h4 className='text-sm font-semibold text-[#1F3B29]'>{testimonial.name}</h4>
                <p className='text-xs text-[#4F3A2E]'>{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Subscribe = () => {
  return (
    <section
      className='relative bg-cover bg-center bg-no-repeat py-16 sm:py-24'
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80')",
      }}>
      <div className='absolute inset-0 bg-black/30' />

      <div className='relative mx-auto max-w-4xl w-full text-center text-white'>
        <h3 className='mb-4 text-xl sm:text-2xl'>Stay Informed with Our</h3>
        <p className='mb-8 text-3xl font-light sm:text-4xl'>Latest News and Updates</p>

        <div className='flex w-full flex-col items-stretch gap-2 rounded-full border border-white/50 bg-white/90 px-3 py-2 text-left sm:flex-row sm:items-center sm:px-4'>
          <input
            type='text'
            placeholder='Enter Your Email'
            className='flex-1 rounded-full bg-transparent px-2 py-2 text-sm text-[#1F3B29] placeholder:text-[#4F3A2E] focus:outline-none'
          />

          <button type='button' className='cursor-pointer rounded-full bg-[#1F3B29] px-6 py-2 text-sm font-semibold text-white'>
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
};

const NewArrivalsSection = ({
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
    return (
      <section className='relative w-full'>
        <div className='flex items-center justify-center py-8'>
          <p className='text-gray-500'>Loading...</p>
        </div>
      </section>
    );
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
      <div className='relative h-[380px] md:h-[420px] w-full'>
        <Image src={bannerData.backgroundImage} alt='New Arrivals Banner' fill className='object-cover' />

        <div className='absolute inset-0 bg-black/20'></div>

        <div className='absolute inset-0 flex flex-col justify-center px-6 md:px-20 text-white'>
          <h2 className='text-4xl md:text-5xl font-semibold'>{bannerData.title}</h2>

          {bannerData.subtitle && (
            <div className='mt-3 bg-white/30 text-white px-4 py-1 rounded-full w-fit backdrop-blur-md text-sm'>{bannerData.subtitle}</div>
          )}

          {bannerData.description && (
            <p className='mt-4 text-lg md:text-xl max-w-[600px] leading-relaxed whitespace-pre-line'>{bannerData.description}</p>
          )}
        </div>
      </div>

      {/* White Floating Cards */}
      {displayCards.length > 0 && (
        <div className='max-w-[1300px] mx-auto px-4 md:px-10 -mt-20 md:-mt-24 relative z-10'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {displayCards.map(card => (
              <div key={card._id} className='bg-white rounded-xl overflow-hidden shadow-lg'>
                <div className='relative h-[300px] md:h-[350px]'>
                  <Image src={card.image} alt={card.title} fill className='object-cover' />
                </div>
                <p className='px-6 py-4 text-lg font-medium'>{card.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
