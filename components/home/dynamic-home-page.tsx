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
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/contexts/CategoriesContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ProductCard, ProductCardData } from '@/components/home/common/product-card';
import { SectionHeader } from '@/components/home/common/section-header';
import Link from 'next/link';

const SECTION_SPACING = 'mt-12 sm:mt-16 lg:mt-20';

// Dynamic data interfaces
interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  featured: boolean;
  productCount: number;
}

interface Product {
  _id: string;
  name: string;
  shortDescription: string;
  category: string;
  brand?: string;
  mainImage: string;
  displayPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  rating?: number;
  reviewCount?: number;
  stock: number;
  featured: boolean;
  trending: boolean;
  tags: string[];
  // Jewelry specific
  metalType?: string;
  metalPurity?: string;
  livePriceEnabled?: boolean;
}

interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  image: string;
  type: 'main' | 'side';
  status: string;
  order: number;
}

interface Feature {
  _id: string;
  icon: string;
  title: string;
  description: string;
  status: string;
  order: number;
}

// Default fallback banners if no banners are available from backend
const defaultHeroSlides = [
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
];

// Convert Product to ProductCardData
const convertToProductCard = (product: Product): ProductCardData => ({
  id: parseInt(product._id.slice(-6), 16), // Convert ObjectId to number
  title: product.name,
  category: product.category,
  price: `₹${product.displayPrice.toLocaleString()}`,
  originalPrice: product.hasDiscount ? `₹${product.originalPrice.toLocaleString()}` : undefined,
  rating: product.rating || 4.5,
  reviews: product.reviewCount || 0,
  image: product.mainImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
  badge: product.featured ? 'Featured' : product.trending ? 'Trending' : undefined,
});

export function DynamicHomePage() {
  const router = useRouter();
  const { categories: contextCategories } = useCategories();
  
  // State for dynamic data
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Swiper refs
  const heroSwiperRef = useRef<SwiperType | null>(null);
  const categorySwiperRef = useRef<SwiperType | null>(null);
  const featuredSwiperRef = useRef<SwiperType | null>(null);
  const trendingSwiperRef = useRef<SwiperType | null>(null);
  const newProductsSwiperRef = useRef<SwiperType | null>(null);

  // Fetch dynamic data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch banners
        const bannersRes = await fetch('/api/public/banners');
        if (bannersRes.ok) {
          const bannersData = await bannersRes.json();
          setBanners(bannersData.banners || []);
        }

        // Fetch categories
        const categoriesRes = await fetch('/api/public/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }

        // Fetch featured products
        const featuredRes = await fetch('/api/public/products?featured=true&limit=12');
        if (featuredRes.ok) {
          const featuredData = await featuredRes.json();
          setFeaturedProducts(featuredData.products || []);
        }

        // Fetch trending products
        const trendingRes = await fetch('/api/public/products?trending=true&limit=12');
        if (trendingRes.ok) {
          const trendingData = await trendingRes.json();
          setTrendingProducts(trendingData.products || []);
        }

        // Fetch new products (latest)
        const newRes = await fetch('/api/public/products?limit=12');
        if (newRes.ok) {
          const newData = await newRes.json();
          setNewProducts(newData.products || []);
        }

        // Fetch features
        const featuresRes = await fetch('/api/public/features');
        if (featuresRes.ok) {
          const featuresData = await featuresRes.json();
          setFeatures(featuresData.features || []);
        }

      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError('Failed to load homepage data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Navigation handlers
  const handleViewAll = (type: string) => {
    switch (type) {
      case 'featured':
        router.push('/products?featured=true');
        break;
      case 'trending':
        router.push('/trending');
        break;
      case 'new':
        router.push('/products?sort=newest');
        break;
      case 'categories':
        router.push('/categories');
        break;
      default:
        router.push('/products');
    }
  };

  const handleCategoryClick = (category: Category) => {
    router.push(`/products?category=${encodeURIComponent(category.name)}`);
  };

  const handleProductClick = (product: Product) => {
    router.push(`/products/${product._id}`);
  };

  // Cleanup function for Swiper instances
  useEffect(() => {
    return () => {
      [heroSwiperRef, categorySwiperRef, featuredSwiperRef, trendingSwiperRef, newProductsSwiperRef].forEach(ref => {
        if (ref.current) {
          try {
            ref.current.destroy(false, false);
            ref.current = null;
          } catch (error) {
            console.warn('Error destroying swiper:', error);
          }
        }
      });
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homepage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="relative w-full">
        <div className="w-full">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
              nextEl: '.hero-button-next',
              prevEl: '.hero-button-prev',
            }}
            pagination={{
              clickable: true,
              el: '.hero-pagination',
            }}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            onSwiper={(swiper) => {
              heroSwiperRef.current = swiper;
            }}
            onBeforeDestroy={() => {
              heroSwiperRef.current = null;
            }}
            className="w-full h-[400px] sm:h-[500px] lg:h-[600px]"
          >
{banners.length > 0 ? (
              // Group banners by pairs (main + side)
              (() => {
                const slides = [];
                for (let i = 0; i < banners.length; i += 2) {
                  const mainBanner = banners.find(b => b.type === 'main') || banners[i];
                  const sideBanner = banners.find(b => b.type === 'side') || banners[i + 1];
                  
                  slides.push(
                    <SwiperSlide key={`slide-${i}`}>
                      <div className="relative w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-0">
                        {/* Main Banner */}
                        <div className="relative lg:col-span-2 h-full">
                          <Image
                            src={mainBanner.image}
                            alt={mainBanner.title}
                            fill
                            className="object-cover"
                            priority
                          />
                          <div className="absolute inset-0 bg-black/30" />
                          <div className="absolute inset-0 flex items-center">
                            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                              <div className="max-w-lg text-white">
                                <p className="text-sm sm:text-base font-medium mb-2 opacity-90">
                                  {mainBanner.subtitle}
                                </p>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                                  {mainBanner.title}
                                </h1>
                                <p className="text-base sm:text-lg mb-6 opacity-90 leading-relaxed">
                                  {mainBanner.description}
                                </p>
                                <button
                                  onClick={() => handleViewAll('featured')}
                                  className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                                >
                                  {mainBanner.buttonText}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Side Banner */}
                        {sideBanner && (
                          <div className="relative hidden lg:block h-full">
                            <Image
                              src={sideBanner.image}
                              alt={sideBanner.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center text-white p-6">
                                <p className="text-sm font-medium mb-2 opacity-90">
                                  {sideBanner.subtitle}
                                </p>
                                <h2 className="text-2xl font-bold mb-3">
                                  {sideBanner.title}
                                </h2>
                                <p className="text-sm mb-4 opacity-90">
                                  {sideBanner.description}
                                </p>
                                <button
                                  onClick={() => handleViewAll('trending')}
                                  className="bg-white text-gray-900 px-4 py-2 rounded font-medium text-sm hover:bg-gray-100 transition-colors duration-200"
                                >
                                  {sideBanner.buttonText}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </SwiperSlide>
                  );
                }
                return slides;
              })()
            ) : (
              // Fallback to default slides if no banners
              defaultHeroSlides.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <div className="relative w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-0">
                    {/* Main Banner */}
                    <div className="relative lg:col-span-2 h-full">
                      <Image
                        src={slide.main.image}
                        alt={slide.main.title}
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute inset-0 flex items-center">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="max-w-lg text-white">
                            <p className="text-sm sm:text-base font-medium mb-2 opacity-90">
                              {slide.main.subtitle}
                            </p>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                              {slide.main.title}
                            </h1>
                            <p className="text-base sm:text-lg mb-6 opacity-90 leading-relaxed">
                              {slide.main.description}
                            </p>
                            <button
                              onClick={() => handleViewAll('featured')}
                              className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                            >
                              {slide.main.buttonText}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Side Banner */}
                    <div className="relative hidden lg:block h-full">
                      <Image
                        src={slide.side.image}
                        alt={slide.side.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <p className="text-sm font-medium mb-2 opacity-90">
                            {slide.side.subtitle}
                          </p>
                          <h2 className="text-2xl font-bold mb-3">
                            {slide.side.title}
                          </h2>
                          <p className="text-sm mb-4 opacity-90">
                            {slide.side.description}
                          </p>
                          <button
                            onClick={() => handleViewAll('trending')}
                            className="bg-white text-gray-900 px-4 py-2 rounded font-medium text-sm hover:bg-gray-100 transition-colors duration-200"
                          >
                            {slide.side.buttonText}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))
            )}
          </Swiper>

          {/* Navigation */}
          <button className="hero-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="hero-button-next absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200">
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination */}
          <div className="hero-pagination absolute bottom-6 left-1/2 -translate-x-1/2 z-10" />
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className={`container mx-auto px-4 sm:px-6 lg:px-8 ${SECTION_SPACING}`}>
          <SectionHeader
            title="Shop by Categories"
            subtitle={`Discover ${categories.length} curated collections`}
            onViewAll={() => handleViewAll('categories')}
          />
          
          <div className="mt-8">
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={2}
              navigation={{
                nextEl: '.categories-button-next',
                prevEl: '.categories-button-prev',
              }}
              breakpoints={{
                640: { slidesPerView: 3, spaceBetween: 20 },
                768: { slidesPerView: 4, spaceBetween: 24 },
                1024: { slidesPerView: 6, spaceBetween: 24 },
              }}
              onSwiper={(swiper) => {
                categorySwiperRef.current = swiper;
              }}
              onBeforeDestroy={() => {
                categorySwiperRef.current = null;
              }}
            >
              {categories.slice(0, 12).map((category) => (
                <SwiperSlide key={category._id}>
                  <div
                    onClick={() => handleCategoryClick(category)}
                    className="group cursor-pointer text-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 transition-colors duration-200">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <Diamond className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors duration-200">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {category.productCount} items
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation */}
            <div className="flex justify-center mt-6 gap-2">
              <button className="categories-button-prev bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors duration-200">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="categories-button-next bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors duration-200">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className={`container mx-auto px-4 sm:px-6 lg:px-8 ${SECTION_SPACING}`}>
          <SectionHeader
            title={`Featured Products (${featuredProducts.length})`}
            subtitle="Handpicked favorites just for you"
            onViewAll={() => handleViewAll('featured')}
          />
          
          <div className="mt-8">
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={1}
              navigation={{
                nextEl: '.featured-button-next',
                prevEl: '.featured-button-prev',
              }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 24 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              onSwiper={(swiper) => {
                featuredSwiperRef.current = swiper;
              }}
              onBeforeDestroy={() => {
                featuredSwiperRef.current = null;
              }}
            >
              {featuredProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <ProductCard
                    product={convertToProductCard(product)}
                    onClick={() => handleProductClick(product)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation */}
            <div className="flex justify-center mt-6 gap-2">
              <button className="featured-button-prev bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors duration-200">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="featured-button-next bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors duration-200">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Trending Products Section */}
      {trendingProducts.length > 0 && (
        <section className={`container mx-auto px-4 sm:px-6 lg:px-8 ${SECTION_SPACING}`}>
          <SectionHeader
            title={`Trending Now (${trendingProducts.length})`}
            subtitle="What's popular this week"
            onViewAll={() => handleViewAll('trending')}
          />
          
          <div className="mt-8">
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={1}
              navigation={{
                nextEl: '.trending-button-next',
                prevEl: '.trending-button-prev',
              }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 24 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              onSwiper={(swiper) => {
                trendingSwiperRef.current = swiper;
              }}
              onBeforeDestroy={() => {
                trendingSwiperRef.current = null;
              }}
            >
              {trendingProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <ProductCard
                    product={convertToProductCard(product)}
                    onClick={() => handleProductClick(product)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation */}
            <div className="flex justify-center mt-6 gap-2">
              <button className="trending-button-prev bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors duration-200">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="trending-button-next bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors duration-200">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* New Products Section */}
      {newProducts.length > 0 && (
        <section className={`container mx-auto px-4 sm:px-6 lg:px-8 ${SECTION_SPACING}`}>
          <SectionHeader
            title={`New Arrivals (${newProducts.length})`}
            subtitle="Fresh additions to our collection"
            onViewAll={() => handleViewAll('new')}
          />
          
          <div className="mt-8">
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={1}
              navigation={{
                nextEl: '.new-button-next',
                prevEl: '.new-button-prev',
              }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 24 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              onSwiper={(swiper) => {
                newProductsSwiperRef.current = swiper;
              }}
              onBeforeDestroy={() => {
                newProductsSwiperRef.current = null;
              }}
            >
              {newProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <ProductCard
                    product={convertToProductCard(product)}
                    onClick={() => handleProductClick(product)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation */}
            <div className="flex justify-center mt-6 gap-2">
              <button className="new-button-prev bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors duration-200">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="new-button-next bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors duration-200">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {features.length > 0 && (
        <section className={`bg-gray-50 ${SECTION_SPACING}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Why Choose Us
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're committed to providing you with the best jewelry shopping experience
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => {
                // Map icon names to components
                const IconComponent = {
                  Truck,
                  Shield, 
                  Headphones,
                  Award,
                }[feature.icon] || Award;

                return (
                  <div key={feature._id} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
