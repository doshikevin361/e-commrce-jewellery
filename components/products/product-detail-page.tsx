'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Star,
  Share2,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Check,
  ChevronRight,
  Sparkles,
  Gem,
} from 'lucide-react';
import { ProductCardData } from '@/components/home/common/product-card';
import { ProductCard } from '@/components/home/common/product-card';
import { PageLoader } from '@/components/common/page-loader';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

// Dynamic product interface
interface ProductDetail {
  _id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  product_type?: string;
  brand?: string;
  mainImage: string;
  galleryImages: string[];
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
  variants: any[];
  relatedProducts: ProductCardData[];
  // Material selection
  hasGold?: boolean;
  hasSilver?: boolean;
  hasDiamond?: boolean;
  // Gold specific
  goldWeight?: number;
  goldPurity?: string;
  goldRatePerGram?: number;
  // Silver specific
  silverWeight?: number;
  silverPurity?: string;
  silverRatePerGram?: number;
  // Diamond specific
  diamondCarat?: number;
  diamondRatePerCarat?: number;
  numberOfStones?: number;
  diamondCut?: string;
  diamondShape?: string;
  stoneClarity?: string;
  stoneColor?: string;
  // Jewelry specifications
  jewelryType?: string;
  jewelrySubType?: string;
  chainType?: string;
  chainLength?: number;
  ringSetting?: string;
  ringSize?: string;
  ringSizeSystem?: string;
  ringWidth?: number;
  ringStyle?: string;
  earringType?: string;
  earringBackType?: string;
  braceletType?: string;
  braceletLength?: number;
  braceletWidth?: number;
  designStyle?: string;
  finishType?: string;
  pattern?: string;
  stoneSetting?: string;
  stoneArrangement?: string;
  // Legacy fields
  metalType?: string;
  metalPurity?: string;
  metalWeight?: number;
  stoneType?: string;
  stoneWeight?: number;
  makingCharges?: number;
  makingChargesType?: string;
  certification?: string;
  certificationNumber?: string;
  gender?: string;
  size?: string;
  sizeUnit?: string;
  totalWeight?: number;
  hallmarked?: boolean;
  bis_hallmark?: boolean;
  hallmarkNumber?: string;
  customizable?: boolean;
  engraving_available?: boolean;
  engravingOptions?: string;
  resizing_available?: boolean;
  gift_wrapping?: boolean;
  livePriceEnabled?: boolean;
  specifications?: Array<{ key: string; value: string }>;
}

export function ProductDetailPage({ productSlug }: { productSlug: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart, cartItems, isLoading: cartLoading } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartButtonLoading, setCartButtonLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/products/${productSlug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found');
          } else {
            setError('Failed to load product');
          }
          return;
        }

        const productData = await response.json();
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productSlug) {
      fetchProduct();
    }
  }, [productSlug]);

  // Check authentication and wishlist status
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  useEffect(() => {
    if (isLoggedIn && product?._id) {
      checkWishlistStatus();
    }
  }, [isLoggedIn, product?._id]);

  const checkWishlistStatus = async () => {
    if (!product?._id) return;
    try {
      const response = await fetch('/api/customer/wishlist');
      if (response.ok) {
        const data = await response.json();
        const productIds = data.products?.map((p: any) => (p._id || p.id).toString()) || [];
        setIsInWishlist(productIds.includes(product._id.toString()));
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      // Dispatch event to open login modal
      window.dispatchEvent(new Event('openLoginModal'));
      return;
    }

    if (!product?._id) {
      toast({
        title: 'Error',
        description: 'Product information not available',
        variant: 'destructive',
      });
      return;
    }

    const productId = product._id.toString();

    try {
      setWishlistLoading(true);

      if (isInWishlist) {
        const response = await fetch(`/api/customer/wishlist?productId=${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsInWishlist(false);
          toast({
            title: 'Success',
            description: 'Product removed from wishlist',
            variant: 'success',
          });
        }
      } else {
        const response = await fetch('/api/customer/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });

        if (response.ok) {
          setIsInWishlist(true);
          toast({
            title: 'Success',
            description: 'Product added to wishlist',
            variant: 'success',
          });
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update wishlist',
        variant: 'destructive',
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return <PageLoader message='Loading product details...' />;
  }

  if (error || !product) {
    return (
      <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-20 text-center'>
        <div className='max-w-md mx-auto'>
          <div className='mb-6'>
            <div className='p-4 bg-[#C8A15B]/10 rounded-2xl inline-block mb-4'>
              <Sparkles className='w-12 h-12 text-[#C8A15B]' />
            </div>
          </div>
          <h1 className='text-3xl font-bold text-[#1F3B29] mb-4 tracking-tight'>{error || 'Product Not Found'}</h1>
          <p className='text-[#4F3A2E]/70 mb-8 text-base leading-relaxed'>
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/products')}
            className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1F3B29] to-[#2a4d3a] px-8 py-4 text-white font-semibold hover:shadow-xl hover:shadow-[#1F3B29]/20 transition-all duration-200 hover:scale-[1.02]'>
            <ArrowLeft size={18} />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Use gallery images if available, otherwise use main image
  const images =
    product.galleryImages && product.galleryImages.length > 0
      ? [product.mainImage, ...product.galleryImages]
      : [product.mainImage, product.mainImage, product.mainImage];

  // Handle image zoom
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomImage) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const relatedProducts = product.relatedProducts || [];

  // Check if product is already in cart
  const isInCart = product?._id ? cartItems.some(item => item._id === product._id.toString()) : false;

  const handleAddToCart = async () => {
    if (!product?._id) {
      toast({
        title: 'Error',
        description: 'Product information not available',
        variant: 'destructive',
      });
      return;
    }

    setCartButtonLoading(true);
    try {
      await addToCart(product._id.toString(), quantity);
    } finally {
      setCartButtonLoading(false);
    }
  };

  return (
    <div className='mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      {/* Back Button - Premium Styling */}
      <button
        onClick={() => router.back()}
        className='mb-8 flex items-center gap-2 text-sm font-medium text-[#4F3A2E]/70 hover:text-[#1F3B29] transition-all duration-200 group'>
        <ArrowLeft size={16} className='group-hover:-translate-x-1 transition-transform' />
        <span>Back to Products</span>
      </button>

      {/* Main Product Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-16 md:mb-20'>
        {/* Image Gallery - Premium Layout */}
        <div className='flex gap-3 items-start'>
          {/* Thumbnail Gallery - Top Left Column */}
          <div className='flex flex-col gap-2 flex-shrink-0'>
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg border-2 transition-all duration-300 hover:scale-110 bg-white shadow-md ${
                  selectedImage === index
                    ? 'border-[#C8A15B] ring-2 ring-[#C8A15B]/50 ring-offset-1 shadow-lg'
                    : 'border-[#E6D3C2] hover:border-[#C8A15B]/80'
                }`}>
                <Image src={img} alt={`${product.name} ${index + 1}`} fill sizes='80px' className='object-cover' />
              </button>
            ))}
          </div>

          {/* Main Image Container */}
          <div className='relative flex-1'>
            <div
              className='relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#F5EEE5] via-white to-[#F5EEE5] shadow-[0_4px_20px_rgba(31,59,41,0.08)] group cursor-zoom-in border border-[#E6D3C2]/30'
              onMouseEnter={() => setZoomImage(images[selectedImage])}
              onMouseLeave={() => {
                setZoomImage(null);
                setZoomPosition({ x: 50, y: 50 });
              }}
              onMouseMove={handleImageMouseMove}>
              <div className='relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] overflow-hidden'>
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes='(max-width: 1024px) 100vw, 50vw'
                  className='object-cover transition-transform duration-500 ease-out'
                  style={{
                    transform: zoomImage ? `scale(2.5) translate(${-zoomPosition.x * 0.5}%, ${-zoomPosition.y * 0.5}%)` : 'scale(1)',
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                  priority
                />
              </div>
              {/* Badges - Refined Positioning */}
              {(product.featured || product.trending) && (
                <span className='absolute left-5 top-5 rounded-full bg-gradient-to-r from-[#C8A15B] to-[#B8914F] px-4 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm border border-white/20 z-10'>
                  {product.featured ? '✨ Featured' : '🔥 Trending'}
                </span>
              )}
              {product.hasDiscount && product.discountPercent > 0 && (
                <span className='absolute right-5 top-5 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-lg border border-white/20 z-10'>
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Information - Premium Layout */}
        <div className='flex flex-col space-y-6 md:space-y-8'>
          {/* Header Section */}
          <div className='space-y-4'>
            <p className='text-[11px] uppercase tracking-[0.2em] text-[#C8A15B] font-semibold'>{product.category}</p>
            <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F3B29] leading-[1.1] tracking-tight'>{product.name}</h1>

            {/* Rating */}
            {product.rating && product.rating > 0 && (
              <div className='flex items-center gap-3 pt-2'>
                <div className='flex items-center gap-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(product.rating || 0) ? 'text-[#C8A15B] fill-[#C8A15B]' : 'text-[#E6D3C2]'}
                    />
                  ))}
                </div>
                <span className='text-base font-semibold text-[#1F3B29]'>{product.rating.toFixed(1)}</span>
                <span className='text-sm text-[#4F3A2E]/70'>({product.reviewCount || 0} reviews)</span>
              </div>
            )}
          </div>

          {/* Price Section - Premium Styling */}
          <div className='pb-6 border-b border-[#E6D3C2]/50'>
            <div className='flex items-baseline gap-3 flex-wrap'>
              <span className='text-4xl sm:text-5xl font-bold text-[#1F3B29] tracking-tight'>₹{product.displayPrice.toLocaleString()}</span>
              {product.hasDiscount && product.discountPercent > 0 && (
                <>
                  <span className='text-xl sm:text-2xl text-[#4F3A2E]/50 line-through'>₹{product.originalPrice.toLocaleString()}</span>
                  <span className='text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full shadow-sm'>
                    Save {product.discountPercent}%
                  </span>
                </>
              )}
            </div>
            {/* Stock Status */}
            {product.stock > 0 ? (
              <div className='flex items-center gap-2 mt-4'>
                <div className='w-2 h-2 rounded-full bg-green-500'></div>
                <span className='text-sm font-medium text-green-700'>In Stock ({product.stock} available)</span>
              </div>
            ) : (
              <div className='flex items-center gap-2 mt-4'>
                <div className='w-2 h-2 rounded-full bg-red-500'></div>
                <span className='text-sm font-medium text-red-600'>Out of Stock</span>
              </div>
            )}
          </div>

          {/* Description */}
          {product.shortDescription && (
            <div className='pt-2'>
              <p className='text-[15px] text-[#4F3A2E] leading-relaxed'>{product.shortDescription}</p>
            </div>
          )}

          {/* Quick Info Cards */}
          {(product.product_type || product.brand) && (
            <div className='grid grid-cols-2 gap-3'>
              {product.product_type && (
                <div className='bg-white p-4 rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
                  <p className='text-[10px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium mb-1.5'>Product Type</p>
                  <p className='text-sm font-semibold text-[#1F3B29]'>{product.product_type}</p>
                </div>
              )}
              {product.brand && (
                <div className='bg-white p-4 rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
                  <p className='text-[10px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium mb-1.5'>Brand</p>
                  <p className='text-sm font-semibold text-[#1F3B29]'>{product.brand}</p>
                </div>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label className='block text-sm font-semibold text-[#1F3B29] mb-3'>Quantity</label>
            <div className='flex items-center gap-4'>
              <div className='flex items-center border border-[#E6D3C2] rounded-xl overflow-hidden bg-white shadow-sm'>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className='p-3 cursor-pointer hover:bg-gray-100 transition-colors text-[#1F3B29]'>
                  <Minus size={16} />
                </button>
                <span className='px-6 py-3 cursor-pointer text-[#1F3B29] font-semibold text-base min-w-[60px] text-center'>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className='p-3 cursor-pointer hover:bg-gray-100  transition-colors text-[#1F3B29]'>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons - Premium Styling */}
          <div className='flex flex-col sm:flex-row gap-3 pt-2'>
            <button
              onClick={handleAddToCart}
              disabled={cartButtonLoading || cartLoading || !product?.stock || product.stock === 0}
              className={cn(
                'flex-1 flex items-center justify-center gap-2.5 rounded-xl px-8 py-4 text-white font-semibold text-base transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed',
                isInCart
                  ? 'bg-gradient-to-r from-[#C8A15B] to-[#B8914F] hover:shadow-xl hover:shadow-[#C8A15B]/20'
                  : 'bg-gradient-to-r from-[#1F3B29] to-[#2a4d3a] hover:shadow-xl hover:shadow-[#1F3B29]/20'
              )}>
              <ShoppingCart size={20} />
              {cartButtonLoading ? 'Adding...' : isInCart ? 'Already in Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-4 font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed',
                isInWishlist
                  ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md'
                  : 'border-[#E6D3C2] text-[#1F3B29] hover:bg-[#F5EEE5] hover:border-[#C8A15B] hover:shadow-sm'
              )}>
              <Heart size={20} className={isInWishlist ? 'fill-red-500' : ''} />
            </button>
            <button className='flex items-center justify-center gap-2 rounded-xl border-2 border-[#E6D3C2] px-5 py-4 text-[#1F3B29] font-semibold hover:bg-[#F5EEE5] hover:border-[#C8A15B] transition-all duration-200 hover:scale-[1.02] hover:shadow-sm'>
              <Share2 size={20} />
            </button>
          </div>

          {/* Trust Badges */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E6D3C2]/50'>
            {((product as any).free_shipping || (product as any).allow_return) && (
              <>
                {(product as any).free_shipping && (
                  <div className='flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
                    <div className='p-2 bg-[#C8A15B]/10 rounded-lg'>
                      <Truck size={20} className='text-[#C8A15B]' />
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-[#1F3B29] mb-0.5'>Free Shipping</p>
                      <p className='text-[10px] text-[#4F3A2E]/70'>
                        {(product as any).freeShippingThreshold
                          ? `Over ₹${(product as any).freeShippingThreshold.toLocaleString()}`
                          : 'Available'}
                      </p>
                    </div>
                  </div>
                )}
                <div className='flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
                  <div className='p-2 bg-[#C8A15B]/10 rounded-lg'>
                    <Shield size={20} className='text-[#C8A15B]' />
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-[#1F3B29] mb-0.5'>Secure Payment</p>
                    <p className='text-[10px] text-[#4F3A2E]/70'>100% protected</p>
                  </div>
                </div>
                {(product as any).allow_return && (
                  <div className='flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
                    <div className='p-2 bg-[#C8A15B]/10 rounded-lg'>
                      <RotateCcw size={20} className='text-[#C8A15B]' />
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-[#1F3B29] mb-0.5'>Easy Returns</p>
                      <p className='text-[10px] text-[#4F3A2E]/70'>{(product as any).return_policy || 'Available'}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Tabs - Premium Styling */}
      <div className='mb-10 border-b border-[#E6D3C2]/50'>
        <div className='flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide'>
          {['Description', 'Specifications', 'Care Instructions', 'Reviews'].map(tab => {
            const tabId = tab.toLowerCase().replace(/\s+/g, '-');
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tabId)}
                className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap ${
                  activeTab === tabId
                    ? 'border-[#C8A15B] text-[#1F3B29]'
                    : 'border-transparent text-[#4F3A2E]/60 hover:text-[#1F3B29] hover:border-[#E6D3C2]'
                }`}>
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content - Premium Styling */}
      <div className='mb-16 md:mb-20'>
        {activeTab === 'description' && (
          <div className='max-w-4xl'>
            {product.longDescription ? (
              <div className='bg-white p-6 md:p-8 rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
                <h3 className='text-xl md:text-2xl font-bold text-[#1F3B29] mb-6 flex items-center gap-2.5'>
                  <div className='p-2 bg-[#C8A15B]/10 rounded-lg'>
                    <Sparkles className='w-5 h-5 text-[#C8A15B]' />
                  </div>
                  Product Description
                </h3>
                <div
                  className='text-[#4F3A2E] prose prose-sm max-w-none leading-relaxed'
                  dangerouslySetInnerHTML={{
                    __html: product.longDescription,
                  }}
                />
              </div>
            ) : (
              <div className='bg-white p-8 rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
                <p className='text-[#4F3A2E]/70 text-center text-sm'>No description available for this product.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className='max-w-6xl'>
            {/* Specifications Table */}
            {product.specifications && product.specifications.length > 0 && (
              <div className='mb-8'>
                <h3 className='text-xl md:text-2xl font-bold text-[#1F3B29] mb-6 flex items-center gap-2.5'>
                  <div className='p-2 bg-[#C8A15B]/10 rounded-lg'>
                    <Gem className='w-5 h-5 text-[#C8A15B]' />
                  </div>
                  Product Specifications
                </h3>
                <div className='overflow-x-auto bg-white rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
                  <table className='w-full border-collapse'>
                    <thead>
                      <tr className='bg-[#1F3B29]'>
                        <th className='px-5 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider'>Specification</th>
                        <th className='px-5 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider'>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.specifications.map((spec, index) => (
                        <tr
                          key={index}
                          className={`border-b border-[#E6D3C2]/30 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-[#F5EEE5]/30'
                          } hover:bg-[#F5EEE5]/50`}>
                          <td className='px-5 py-3.5 text-sm font-medium text-[#1F3B29]'>{spec.key}</td>
                          <td className='px-5 py-3.5 text-sm text-[#4F3A2E]'>{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Jewelry Specifications */}
            {product.hasGold || product.hasSilver || product.hasDiamond || product.jewelryType ? (
              <div className='bg-white p-6 md:p-8 rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
                <h3 className='text-xl md:text-2xl font-bold text-[#1F3B29] mb-6 flex items-center gap-2.5'>
                  <div className='p-2 bg-[#C8A15B]/10 rounded-lg'>
                    <Sparkles className='w-5 h-5 text-[#C8A15B]' />
                  </div>
                  Jewelry Specifications
                </h3>
                <div className='space-y-5 md:space-y-6'>
                  {/* Jewelry Type */}
                  {(product.jewelryType || product.jewelrySubType) && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5 border-b border-[#E6D3C2]/50'>
                      {product.jewelryType && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Jewelry Type</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.jewelryType}</p>
                        </div>
                      )}
                      {product.jewelrySubType && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Sub-Type</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.jewelrySubType}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Material Details */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5 border-b border-[#E6D3C2]/50'>
                    {product.hasGold && (
                      <>
                        {product.goldWeight && (
                          <div>
                            <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>
                              Gold Weight
                            </span>
                            <p className='font-semibold text-[#1F3B29] text-base'>{product.goldWeight}g</p>
                          </div>
                        )}
                        {product.goldPurity && (
                          <div>
                            <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>
                              Gold Purity
                            </span>
                            <p className='font-semibold text-[#1F3B29] text-base'>{product.goldPurity}</p>
                          </div>
                        )}
                      </>
                    )}
                    {product.hasSilver && (
                      <>
                        {product.silverWeight && (
                          <div>
                            <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>
                              Silver Weight
                            </span>
                            <p className='font-semibold text-[#1F3B29] text-base'>{product.silverWeight}g</p>
                          </div>
                        )}
                        {product.silverPurity && (
                          <div>
                            <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>
                              Silver Purity
                            </span>
                            <p className='font-semibold text-[#1F3B29] text-base'>{product.silverPurity}</p>
                          </div>
                        )}
                      </>
                    )}
                    {product.hasDiamond && (
                      <>
                        {product.diamondCarat && (
                          <div>
                            <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>
                              Diamond Carat
                            </span>
                            <p className='font-semibold text-[#1F3B29] text-base'>{product.diamondCarat}ct</p>
                          </div>
                        )}
                        {product.numberOfStones && (
                          <div>
                            <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>
                              Number of Stones
                            </span>
                            <p className='font-semibold text-[#1F3B29] text-base'>{product.numberOfStones}</p>
                          </div>
                        )}
                        {product.diamondCut && (
                          <div>
                            <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>
                              Diamond Cut
                            </span>
                            <p className='font-semibold text-[#1F3B29] text-base'>{product.diamondCut}</p>
                          </div>
                        )}
                        {product.diamondShape && (
                          <div>
                            <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>
                              Diamond Shape
                            </span>
                            <p className='font-semibold text-[#1F3B29] text-base'>{product.diamondShape}</p>
                          </div>
                        )}
                        {product.stoneClarity && (
                          <div>
                            <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Clarity</span>
                            <p className='font-semibold text-[#1F3B29] text-base'>{product.stoneClarity}</p>
                          </div>
                        )}
                        {product.stoneColor && (
                          <div>
                            <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Color</span>
                            <p className='font-semibold text-[#1F3B29] text-base'>{product.stoneColor}</p>
                          </div>
                        )}
                      </>
                    )}
                    {product.totalWeight && (
                      <div>
                        <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Total Weight</span>
                        <p className='font-semibold text-[#1F3B29] text-base'>{product.totalWeight}g</p>
                      </div>
                    )}
                  </div>

                  {/* Ring Specific */}
                  {product.jewelryType === 'Ring' && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5 border-b border-[#E6D3C2]/50'>
                      {product.ringSetting && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Setting</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.ringSetting}</p>
                        </div>
                      )}
                      {product.ringSize && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Ring Size</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>
                            {product.ringSize} {product.ringSizeSystem && `(${product.ringSizeSystem})`}
                          </p>
                        </div>
                      )}
                      {product.ringWidth && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Band Width</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.ringWidth}mm</p>
                        </div>
                      )}
                      {product.ringStyle && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Style</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.ringStyle}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chain/Necklace Specific */}
                  {(product.jewelryType === 'Necklace' || product.jewelryType === 'Chain') && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5 border-b border-[#E6D3C2]/50'>
                      {product.chainType && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Chain Type</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.chainType}</p>
                        </div>
                      )}
                      {product.chainLength && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Length</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.chainLength} inches</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Earring Specific */}
                  {product.jewelryType === 'Earrings' && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5 border-b border-[#E6D3C2]/50'>
                      {product.earringType && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Earring Type</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.earringType}</p>
                        </div>
                      )}
                      {product.earringBackType && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Back Type</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.earringBackType}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bracelet Specific */}
                  {product.jewelryType === 'Bracelet' && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5 border-b border-[#E6D3C2]/50'>
                      {product.braceletType && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>
                            Bracelet Type
                          </span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.braceletType}</p>
                        </div>
                      )}
                      {product.braceletLength && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Length</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.braceletLength} inches</p>
                        </div>
                      )}
                      {product.braceletWidth && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Width</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.braceletWidth}mm</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Design & Style */}
                  {(product.designStyle || product.finishType || product.pattern) && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5 border-b border-[#E6D3C2]/50'>
                      {product.designStyle && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Design Style</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.designStyle}</p>
                        </div>
                      )}
                      {product.finishType && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Finish</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.finishType}</p>
                        </div>
                      )}
                      {product.pattern && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Pattern</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.pattern}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stone Setting */}
                  {product.hasDiamond && (product.stoneSetting || product.stoneArrangement) && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5 border-b border-[#E6D3C2]/50'>
                      {product.stoneSetting && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>
                            Stone Setting
                          </span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.stoneSetting}</p>
                        </div>
                      )}
                      {product.stoneArrangement && (
                        <div>
                          <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Arrangement</span>
                          <p className='font-semibold text-[#1F3B29] text-base'>{product.stoneArrangement}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Other Details */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    {product.gender && (
                      <div>
                        <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Gender</span>
                        <p className='font-semibold text-[#1F3B29] text-base'>{product.gender}</p>
                      </div>
                    )}
                    {product.certification && (
                      <div>
                        <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Certification</span>
                        <p className='font-semibold text-[#1F3B29] text-base'>
                          {product.certification} {product.certificationNumber && `(${product.certificationNumber})`}
                        </p>
                      </div>
                    )}
                    {product.hallmarked && (
                      <div>
                        <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Hallmarked</span>
                        <p className='font-semibold text-[#1F3B29] text-base'>
                          Yes {product.hallmarkNumber && `(${product.hallmarkNumber})`}
                        </p>
                      </div>
                    )}
                    {product.bis_hallmark && (
                      <div>
                        <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>BIS Hallmark</span>
                        <p className='font-semibold text-[#1F3B29] text-base'>Yes</p>
                      </div>
                    )}
                    {product.customizable && (
                      <div>
                        <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Customizable</span>
                        <p className='font-semibold text-[#1F3B29] text-base'>Yes</p>
                      </div>
                    )}
                    {product.engraving_available && (
                      <div>
                        <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Engraving</span>
                        <p className='font-semibold text-[#1F3B29] text-base'>
                          Available {product.engravingOptions && `(${product.engravingOptions})`}
                        </p>
                      </div>
                    )}
                    {product.resizing_available && (
                      <div>
                        <span className='text-[11px] uppercase tracking-wide text-[#4F3A2E]/70 font-medium block mb-2'>Resizing</span>
                        <p className='font-semibold text-[#1F3B29] text-base'>Available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='bg-white p-8 rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
                <p className='text-[#4F3A2E]/70 text-center text-sm'>No specifications available for this product.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'care-instructions' && (
          <div className='max-w-4xl'>
            <h3 className='text-xl md:text-2xl font-bold text-[#1F3B29] mb-6'>Care Instructions</h3>
            <div className='bg-white p-8 rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
              <p className='text-[#4F3A2E]/70 text-center text-sm'>
                Care instructions will be displayed here when available for this product.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className='max-w-4xl'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
              <h3 className='text-xl md:text-2xl font-bold text-[#1F3B29]'>Customer Reviews</h3>
              {product.rating && product.rating > 0 && (
                <div className='flex items-center gap-2.5'>
                  <div className='flex items-center gap-1'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.floor(product.rating || 0) ? 'text-[#C8A15B] fill-[#C8A15B]' : 'text-[#E6D3C2]'}
                      />
                    ))}
                  </div>
                  <span className='text-lg font-semibold text-[#1F3B29]'>{product.rating.toFixed(1)}</span>
                  <span className='text-sm text-[#4F3A2E]/70'>({product.reviewCount || 0} reviews)</span>
                </div>
              )}
            </div>
            {product.reviewCount && product.reviewCount > 0 ? (
              <div className='bg-white p-8 rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
                <p className='text-[#4F3A2E]/70 text-center text-sm'>
                  Reviews will be displayed here when available. Reviews feature coming soon.
                </p>
              </div>
            ) : (
              <div className='bg-white p-8 rounded-xl border border-[#E6D3C2]/40 shadow-sm'>
                <p className='text-[#4F3A2E]/70 text-center text-sm'>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Products - Premium Styling */}
      {relatedProducts.length > 0 && (
        <div className='mt-16 md:mt-20 pt-12 border-t border-[#E6D3C2]/50'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 md:mb-10'>
            <h2 className='text-3xl md:text-4xl font-bold text-[#1F3B29] tracking-tight'>Related Products</h2>
            <Link
              href='/products'
              className='flex items-center gap-2 text-[#1F3B29] font-semibold hover:text-[#C8A15B] transition-colors duration-200 group'>
              <span className='text-sm'>View All</span>
              <ChevronRight size={16} className='group-hover:translate-x-1 transition-transform duration-200' />
            </Link>
          </div>
          <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
