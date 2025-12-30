'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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
  ChevronDown,
  ChevronUp,
  Gem,
  Facebook,
  Link as LinkIcon,
  X,
  Coins,
  Sparkles,
  Package,
  Check,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import { ProductCardData, ProductCard } from '@/components/home/common/product-card';
import { PageLoader } from '@/components/common/page-loader';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Product interface
interface ProductDetail {
  _id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  categoryName?: string;
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
  relatedProducts: ProductCardData[];
  // Pricing details
  price?: number;
  subTotal?: number;
  taxRate?: number;
  discount?: number;
  // Metal details
  hasGold?: boolean;
  hasSilver?: boolean;
  goldWeight?: number;
  goldPurity?: string;
  goldRatePerGram?: number;
  silverWeight?: number;
  silverPurity?: string;
  silverRatePerGram?: number;
  metalType?: string;
  metalPurity?: string;
  metalWeight?: number;
  // Diamond details
  hasDiamond?: boolean;
  diamonds?: Array<{
    id: string;
    diamondType?: string;
    diamondShape?: string;
    diamondClarity?: string;
    diamondColor?: string;
    diamondCut?: string;
    diamondCaratWeight?: number;
    diamondPrice?: number;
    numberOfDiamonds?: number;
    certification?: string;
  }>;
  // Legacy diamond fields
  diamondCarat?: number;
  numberOfStones?: number;
  diamondShape?: string;
  stoneClarity?: string;
  stoneColor?: string;
  diamondCut?: string;
  // Making charges
  makingCharges?: number;
  makingChargePerGram?: number;
  // Other charges
  shippingCharges?: number;
  hallMarkingCharges?: number;
  insuranceCharges?: number;
  packingCharges?: number;
  // Other material
  gemstoneName?: string;
  gemstonePrice?: number;
  hallmarked?: boolean;
  bis_hallmark?: boolean;
  certificationNumber?: string;
  gender?: string;
}

// Accordion component for collapsible sections
function AccordionSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className='border border-[#E6D3C2]/30 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full px-6 py-4 hover:bg-[#FAF7F4]/50 transition-colors group'>
        <div className='flex items-center gap-3'>
          <Icon className='w-5 h-5 text-[#C8A15B]' />
          <h3 className='text-base font-semibold text-web uppercase tracking-wide'>{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className='w-5 h-5 text-[#4F3A2E]/60 group-hover:text-[#C8A15B] transition-colors' />
        ) : (
          <ChevronDown className='w-5 h-5 text-[#4F3A2E]/60 group-hover:text-[#C8A15B] transition-colors' />
        )}
      </button>
      {isOpen && (
        <div className='px-6 pb-6 pt-2 animate-in fade-in-50 slide-in-from-top-2 duration-300'>{children}</div>
      )}
    </div>
  );
}

export function ProductDetailPage({ productSlug }: { productSlug: string }) {
  const router = useRouter();
  const { addToCart, cartItems, isLoading: cartLoading } = useCart();
  const { isProductInWishlist } = useWishlist();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartButtonLoading, setCartButtonLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isInWishlist = product?._id ? isProductInWishlist(product._id.toString()) : false;

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
        console.log('[ProductDetail] Product data received:', {
          hasGalleryImages: Array.isArray(productData.galleryImages),
          galleryImagesCount: Array.isArray(productData.galleryImages) ? productData.galleryImages.length : 0,
          galleryImages: productData.galleryImages,
          mainImage: productData.mainImage,
          productId: productData._id,
        });
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

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      window.dispatchEvent(new Event('openLoginModal'));
      return;
    }

    if (!product?._id) {
      toast.error('Product information not available');
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
          toast.success('Removed from wishlist');
          window.dispatchEvent(new Event('wishlistChange'));
        }
      } else {
        const response = await fetch('/api/customer/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });

        if (response.ok) {
          toast.success('Added to wishlist');
          window.dispatchEvent(new Event('wishlistChange'));
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async (platform: 'whatsapp' | 'facebook' | 'copy' | 'native') => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/products/${productSlug}` : '';
    const text = product ? `Check out ${product.name} - ₹${product.displayPrice.toLocaleString()}` : '';
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`${text}\n\n${url}`);

    try {
      switch (platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodedText}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400');
          break;
        case 'copy':
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
          break;
        case 'native':
          if (navigator.share) {
            await navigator.share({ title: product?.name || 'Product', text: text, url: url });
            toast.success('Shared successfully!');
          } else {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
          }
          break;
      }
      setShareMenuOpen(false);
    } catch (error) {
      console.error('Error sharing:', error);
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('Failed to share');
      }
    }
  };

  const handleBuyNow = async () => {
    if (!product?._id) {
      toast.error('Product information not available');
      return;
    }

    if (!isLoggedIn) {
      window.dispatchEvent(new Event('openLoginModal'));
      return;
    }

    setCartButtonLoading(true);
    try {
      await addToCart(product._id.toString(), quantity);
      router.push('/checkout');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setCartButtonLoading(false);
    }
  };

  const scrollRelatedProducts = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) return <PageLoader message='Loading product details...' />;

  if (error || !product) {
    return (
      <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 py-20 text-center'>
        <div className='max-w-md mx-auto'>
          <div className='mb-6'>
            <div className='p-4 bg-[#C8A15B]/10 rounded-2xl inline-block mb-4'>
              <Sparkles className='w-12 h-12 text-[#C8A15B]' />
            </div>
          </div>
          <h1 className='text-3xl font-bold text-web mb-4'>{error || 'Product Not Found'}</h1>
          <p className='text-[#4F3A2E]/70 mb-8'>The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/products')}
            className='inline-flex items-center gap-2 rounded-xl bg-web px-8 py-4 text-white font-semibold hover:shadow-xl transition-all'>
            <ArrowLeft size={18} />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Fix image paths - ensure they're properly formatted
  const fixImagePath = (path: string) => {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path;
    return `/${path}`;
  };

  const images =
    product.galleryImages && product.galleryImages.length > 0
      ? [fixImagePath(product.mainImage), ...product.galleryImages.map(fixImagePath)]
      : [fixImagePath(product.mainImage)];

  // Debug logging
  console.log('[ProductDetail] Images array:', {
    galleryImagesCount: product.galleryImages?.length || 0,
    totalImages: images.length,
    images: images,
  });

  const isInCart = product?._id ? cartItems.some(item => item._id === product._id.toString()) : false;

  const handleAddToCart = async () => {
    if (!product?._id) {
      toast.error('Product information not available');
      return;
    }

    setCartButtonLoading(true);
    try {
      await addToCart(product._id.toString(), quantity);
    } finally {
      setCartButtonLoading(false);
    }
  };

  // Calculate price breakup
  const metalValue =
    (product.goldWeight || 0) * (product.goldRatePerGram || 0) +
    (product.silverWeight || 0) * (product.silverRatePerGram || 0);
  const diamondValue = product.diamonds?.reduce((sum, d) => sum + (d.diamondPrice || 0), 0) || 0;
  const makingChargesValue = product.makingCharges || 0;
  const otherCharges =
    (product.shippingCharges || 0) +
    (product.hallMarkingCharges || 0) +
    (product.insuranceCharges || 0) +
    (product.packingCharges || 0);
  const subTotal = product.subTotal || product.price || product.displayPrice;
  const gstAmount = (subTotal * (product.taxRate || 3)) / 100;
  const discountAmount = (subTotal * (product.discount || 0)) / 100;
  const grandTotal = subTotal + gstAmount - discountAmount;

  return (
    <div className='min-h-screen bg-white'>
      {/* Back Button */}
      <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 pt-6 sm:pt-8'>
        <button
          onClick={() => router.back()}
          className='mb-6 flex items-center gap-2 text-sm font-medium text-[#4F3A2E]/70 hover:text-web transition-all group'>
          <ArrowLeft size={16} className='group-hover:-translate-x-1 transition-transform' />
          <span>Back to Products</span>
        </button>
      </div>

      {/* Main Product Section - Two Column Layout */}
      <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 pb-24 lg:pb-12'>
        <div className='grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-16 mb-16'>
          {/* Left Column - Product Images */}
          <div className='space-y-4'>
            {/* Main Image with Zoom */}
            <div
              className='relative w-full overflow-hidden rounded-lg bg-gradient-to-br from-[#F5EEE5] to-white border border-[#E6D3C2]/20 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-zoom-in'
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}>
              <div className='relative aspect-square'>
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes='(max-width: 1024px) 100vw, 60vw'
                  className={cn(
                    'object-cover transition-transform duration-500',
                    imageZoom ? 'scale-110' : 'scale-100'
                  )}
                  priority
                />
              </div>
              {/* Badges */}
              {(product.featured || product.trending) && (
                <span className='absolute left-4 top-4 rounded-full bg-gradient-to-r from-[#C8A15B] to-[#B8914F] px-4 py-1.5 text-xs font-semibold text-white shadow-lg'>
                  {product.featured ? '✨ Featured' : '🔥 Trending'}
                </span>
              )}
              {product.hasDiscount && product.discountPercent > 0 && (
                <span className='absolute right-4 top-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg'>
                  {product.discountPercent}% OFF
                </span>
              )}
              {imageZoom && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none'>
                  <ZoomIn className='w-8 h-8 text-[#C8A15B]' />
                </div>
              )}
            </div>

            {/* Horizontal Thumbnail Gallery */}
            {images.length > 1 && (
              <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'>
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-md border-2 transition-all hover:scale-105 bg-white',
                      selectedImage === index
                        ? 'border-[#C8A15B] ring-2 ring-[#C8A15B]/30'
                        : 'border-[#E6D3C2] hover:border-[#C8A15B]/60'
                    )}>
                    <Image src={img} alt={`View ${index + 1}`} fill sizes='80px' className='object-cover' />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Information */}
          <div className='flex flex-col space-y-6'>
            {/* Category Label */}
            {product.categoryName && (
              <p className='text-xs uppercase tracking-widest text-[#C8A15B] font-semibold'>
                {product.categoryName}
              </p>
            )}

            {/* Title with Wishlist & Share */}
            <div className='space-y-3'>
              <div className='flex items-start justify-between gap-4'>
                <h1 className='text-3xl sm:text-4xl font-bold text-web leading-tight flex-1'>
                  {product.name}
                </h1>
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={cn(
                      'p-2.5 rounded-lg border transition-all',
                      isInWishlist
                        ? 'border-red-500 bg-red-50 hover:bg-red-100'
                        : 'border-[#E6D3C2] hover:border-[#C8A15B] hover:bg-[#FAF7F4]'
                    )}>
                    <Heart
                      size={20}
                      className={cn(isInWishlist ? 'text-red-500 fill-red-500' : 'text-web')}
                    />
                  </button>
                  <div className='relative'>
                    <button
                      onClick={() => setShareMenuOpen(!shareMenuOpen)}
                      className='p-2.5 rounded-lg border border-[#E6D3C2] hover:border-[#C8A15B] hover:bg-[#FAF7F4] transition-all'>
                      <Share2 size={20} className='text-web' />
                    </button>
                    {shareMenuOpen && (
                      <div className='absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-[#E6D3C2] p-2 z-50 min-w-[180px]'>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className='w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAF7F4] rounded text-sm text-left transition-colors'>
                          <MessageCircle size={18} className='text-green-600' />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className='w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAF7F4] rounded text-sm text-left transition-colors'>
                          <Facebook size={18} className='text-blue-600' />
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className='w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAF7F4] rounded text-sm text-left transition-colors'>
                          <LinkIcon size={18} className='text-[#4F3A2E]' />
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating */}
              {product.rating && product.rating > 0 && (
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < Math.floor(product.rating || 0) ? 'text-[#C8A15B] fill-[#C8A15B]' : 'text-[#E6D3C2]'
                        }
                      />
                    ))}
                  </div>
                  <span className='text-sm font-semibold text-web'>{product.rating.toFixed(1)}</span>
                  <span className='text-xs text-[#4F3A2E]/70'>({product.reviewCount || 0} reviews)</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className='pb-4 border-b border-[#E6D3C2]/30'>
              <div className='flex items-baseline gap-3 flex-wrap'>
                <span className='text-4xl font-bold text-web'>₹{product.displayPrice.toLocaleString()}</span>
                {product.hasDiscount && product.discountPercent > 0 && (
                  <>
                    <span className='text-xl text-[#4F3A2E]/50 line-through'>
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <span className='text-sm font-bold bg-red-500 text-white px-3 py-1 rounded-full'>
                      {product.discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              {/* Stock */}
              <div className='flex items-center gap-2 mt-4'>
                <div className={cn('w-2 h-2 rounded-full', product.stock > 0 ? 'bg-green-500' : 'bg-red-500')}></div>
                <span className={cn('text-sm font-medium', product.stock > 0 ? 'text-green-700' : 'text-red-600')}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <div>
                <p className='text-base text-[#4F3A2E] leading-relaxed'>{product.shortDescription}</p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className='flex items-center gap-4'>
              <span className='text-sm font-semibold text-web'>Quantity:</span>
              <div className='flex items-center border border-[#E6D3C2] rounded-lg overflow-hidden'>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className='p-2.5 hover:bg-[#FAF7F4] transition-colors'
                  disabled={quantity <= 1}>
                  <Minus size={18} className='text-web' />
                </button>
                <span className='px-6 py-2.5 text-base font-semibold text-web min-w-[4rem] text-center border-x border-[#E6D3C2]'>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className='p-2.5 hover:bg-[#FAF7F4] transition-colors'
                  disabled={quantity >= product.stock}>
                  <Plus size={18} className='text-web' />
                </button>
              </div>
            </div>

            {/* Add to Cart & Buy Now Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 pt-2'>
              <button
                onClick={handleAddToCart}
                disabled={cartButtonLoading || isInCart || product.stock === 0}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all text-base',
                  isInCart
                    ? 'bg-green-500 text-white cursor-default'
                    : product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-web text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                )}>
                {cartButtonLoading ? (
                  <>
                    <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Adding...
                  </>
                ) : isInCart ? (
                  <>
                    <Check size={20} />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={cartButtonLoading || product.stock === 0}
                className={cn(
                  'flex-1 px-6 py-4 rounded-lg font-semibold text-base border-2 transition-all',
                  product.stock === 0
                    ? 'border-gray-300 text-gray-500 cursor-not-allowed bg-gray-100'
                    : 'border-[#C8A15B] text-[#C8A15B] hover:bg-[#C8A15B] hover:text-white hover:shadow-lg active:scale-[0.98]'
                )}>
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className='grid grid-cols-3 gap-4 pt-4 border-t border-[#E6D3C2]/30'>
              <div className='flex flex-col items-center gap-2 text-center'>
                <div className='p-2 rounded-full bg-[#FAF7F4]'>
                  <Truck className='w-5 h-5 text-[#C8A15B]' />
                </div>
                <span className='text-xs text-[#4F3A2E]/80 font-medium'>Free Shipping</span>
              </div>
              <div className='flex flex-col items-center gap-2 text-center'>
                <div className='p-2 rounded-full bg-[#FAF7F4]'>
                  <RotateCcw className='w-5 h-5 text-[#C8A15B]' />
                </div>
                <span className='text-xs text-[#4F3A2E]/80 font-medium'>Easy Returns</span>
              </div>
              <div className='flex flex-col items-center gap-2 text-center'>
                <div className='p-2 rounded-full bg-[#FAF7F4]'>
                  <Shield className='w-5 h-5 text-[#C8A15B]' />
                </div>
                <span className='text-xs text-[#4F3A2E]/80 font-medium'>Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Panel - Full Width */}
        <div className='mb-16'>
          {/* Section Title */}
          <h2 className='text-2xl sm:text-3xl font-bold text-web mb-6'>Product Information</h2>
          
          <div className='space-y-4'>
            {/* Price Breakup Accordion */}
            <AccordionSection title='Price Breakup' icon={Coins} defaultOpen={true}>
            <div className='space-y-3 text-sm'>
              {metalValue > 0 && (
                <div className='flex justify-between items-center py-2'>
                  <span className='text-[#4F3A2E]/70'>Metal Value</span>
                  <span className='font-semibold text-web'>₹{metalValue.toLocaleString()}</span>
                </div>
              )}
              {diamondValue > 0 && (
                <div className='flex justify-between items-center py-2'>
                  <span className='text-[#4F3A2E]/70'>Diamond Value</span>
                  <span className='font-semibold text-web'>₹{diamondValue.toLocaleString()}</span>
                </div>
              )}
              {product.gemstonePrice && product.gemstonePrice > 0 && (
                <div className='flex justify-between items-center py-2'>
                  <span className='text-[#4F3A2E]/70'>Gemstone Value</span>
                  <span className='font-semibold text-web'>₹{product.gemstonePrice.toLocaleString()}</span>
                </div>
              )}
              {makingChargesValue > 0 && (
                <div className='flex justify-between items-center py-2'>
                  <span className='text-[#4F3A2E]/70'>Making Charges</span>
                  <span className='font-semibold text-web'>₹{makingChargesValue.toLocaleString()}</span>
                </div>
              )}
              {otherCharges > 0 && (
                <div className='flex justify-between items-center py-2'>
                  <span className='text-[#4F3A2E]/70'>Other Charges</span>
                  <span className='font-semibold text-web'>₹{otherCharges.toLocaleString()}</span>
                </div>
              )}
              <div className='flex justify-between items-center py-3 pt-4 border-t border-[#E6D3C2]/50'>
                <span className='text-[#4F3A2E]/70 font-medium'>Subtotal</span>
                <span className='font-bold text-web'>₹{subTotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className='flex justify-between items-center py-2 text-red-600'>
                  <span>Discount ({product.discount}%)</span>
                  <span className='font-semibold'>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className='flex justify-between items-center py-2'>
                <span className='text-[#4F3A2E]/70'>GST ({product.taxRate || 3}%)</span>
                <span className='font-semibold text-web'>₹{gstAmount.toLocaleString()}</span>
              </div>
              <div className='flex justify-between items-center py-4 pt-5 border-t-2 border-[#C8A15B]/30 bg-[#FAF7F4]/50 -mx-2 px-2 rounded'>
                <span className='font-bold text-lg text-web'>Grand Total</span>
                <span className='font-bold text-xl text-web'>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </AccordionSection>

          {/* Metal Details Accordion */}
          {(product.hasGold || product.hasSilver || product.metalType) && (
            <AccordionSection title='Metal Details' icon={Package}>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm'>
                {(product.metalType || product.hasGold) && (
                  <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                    <span className='text-[#4F3A2E]/70 font-medium'>Metal Type</span>
                    <span className='font-semibold text-web'>
                      {product.metalType || (product.hasGold ? 'Gold' : 'Silver')}
                    </span>
                  </div>
                )}
                {(product.goldPurity || product.silverPurity || product.metalPurity) && (
                  <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                    <span className='text-[#4F3A2E]/70 font-medium'>Purity</span>
                    <span className='font-semibold text-web'>
                      {product.goldPurity || product.silverPurity || product.metalPurity}
                    </span>
                  </div>
                )}
                {(product.goldWeight || product.silverWeight || product.metalWeight) && (
                  <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                    <span className='text-[#4F3A2E]/70 font-medium'>Weight</span>
                    <span className='font-semibold text-web'>
                      {(product.goldWeight || product.silverWeight || product.metalWeight)?.toFixed(2)}g
                    </span>
                  </div>
                )}
                {(product.goldRatePerGram || product.silverRatePerGram) && (
                  <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                    <span className='text-[#4F3A2E]/70 font-medium'>Rate per gram</span>
                    <span className='font-semibold text-web'>
                      ₹{(product.goldRatePerGram || product.silverRatePerGram)?.toLocaleString()}
                    </span>
                  </div>
                )}
                {product.hallmarked && (
                  <div className='col-span-1 sm:col-span-2 flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                    <span className='text-[#4F3A2E]/70 font-medium'>Hallmark</span>
                    <span className='font-semibold text-web'>
                      {product.bis_hallmark ? 'BIS Hallmarked' : 'Hallmarked'}
                    </span>
                  </div>
                )}
              </div>
            </AccordionSection>
          )}

          {/* Diamond Details Accordion */}
          {((product.hasDiamond || product.diamonds) &&
            (product.diamonds?.some(
              d =>
                d.diamondType ||
                d.diamondShape ||
                d.diamondClarity ||
                d.diamondColor ||
                d.diamondCut ||
                d.diamondCaratWeight ||
                d.numberOfDiamonds ||
                d.certification
            ) ||
              product.diamondCarat ||
              product.numberOfStones ||
              product.diamondShape ||
              product.stoneClarity ||
              product.stoneColor ||
              product.diamondCut)) && (
            <AccordionSection title='Diamond Details' icon={Gem}>
              {product.diamonds && product.diamonds.length > 0 ? (
                <div className='space-y-4'>
                  {product.diamonds.map((diamond, index) => (
                    <div
                      key={diamond.id || index}
                      className='p-4 bg-[#FAF7F4] rounded-lg border border-[#E6D3C2]/30'>
                      <h4 className='text-xs font-semibold text-web mb-4 uppercase tracking-wider'>
                        Diamond #{index + 1}
                      </h4>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                        {diamond.diamondType && (
                          <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Type</span>
                            <span className='font-semibold text-web'>{diamond.diamondType}</span>
                          </div>
                        )}
                        {diamond.diamondShape && (
                          <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Shape</span>
                            <span className='font-semibold text-web'>{diamond.diamondShape}</span>
                          </div>
                        )}
                        {diamond.diamondCaratWeight && (
                          <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Carat Weight</span>
                            <span className='font-semibold text-web'>{diamond.diamondCaratWeight}ct</span>
                          </div>
                        )}
                        {diamond.diamondClarity && (
                          <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Clarity</span>
                            <span className='font-semibold text-web'>{diamond.diamondClarity}</span>
                          </div>
                        )}
                        {diamond.diamondColor && (
                          <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Color</span>
                            <span className='font-semibold text-web'>{diamond.diamondColor}</span>
                          </div>
                        )}
                        {diamond.diamondCut && (
                          <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Cut</span>
                            <span className='font-semibold text-web'>{diamond.diamondCut}</span>
                          </div>
                        )}
                        {diamond.numberOfDiamonds && (
                          <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Number of Stones</span>
                            <span className='font-semibold text-web'>{diamond.numberOfDiamonds}</span>
                          </div>
                        )}
                        {diamond.certification && (
                          <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Certification</span>
                            <span className='font-semibold text-web'>{diamond.certification}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm'>
                  {product.diamondCarat && (
                    <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                      <span className='text-[#4F3A2E]/70 font-medium'>Carat Weight</span>
                      <span className='font-semibold text-web'>{product.diamondCarat}ct</span>
                    </div>
                  )}
                  {product.numberOfStones && (
                    <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                      <span className='text-[#4F3A2E]/70 font-medium'>Number of Stones</span>
                      <span className='font-semibold text-web'>{product.numberOfStones}</span>
                    </div>
                  )}
                  {product.diamondShape && (
                    <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                      <span className='text-[#4F3A2E]/70 font-medium'>Shape</span>
                      <span className='font-semibold text-web'>{product.diamondShape}</span>
                    </div>
                  )}
                  {product.stoneClarity && (
                    <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                      <span className='text-[#4F3A2E]/70 font-medium'>Clarity</span>
                      <span className='font-semibold text-web'>{product.stoneClarity}</span>
                    </div>
                  )}
                  {product.stoneColor && (
                    <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                      <span className='text-[#4F3A2E]/70 font-medium'>Color</span>
                      <span className='font-semibold text-web'>{product.stoneColor}</span>
                    </div>
                  )}
                  {product.diamondCut && (
                    <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                      <span className='text-[#4F3A2E]/70 font-medium'>Cut</span>
                      <span className='font-semibold text-web'>{product.diamondCut}</span>
                    </div>
                  )}
                </div>
              )}
            </AccordionSection>
          )}

          {/* Other Material Details Accordion */}
          {(product.gemstoneName || product.brand || product.gender || product.certificationNumber) && (
            <AccordionSection title='Other Material Details' icon={Sparkles}>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm'>
                {product.gemstoneName && (
                  <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                    <span className='text-[#4F3A2E]/70 font-medium'>Gemstone</span>
                    <span className='font-semibold text-web'>{product.gemstoneName}</span>
                  </div>
                )}
                {product.brand && (
                  <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                    <span className='text-[#4F3A2E]/70 font-medium'>Brand</span>
                    <span className='font-semibold text-web'>{product.brand}</span>
                  </div>
                )}
                {product.gender && (
                  <div className='flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                    <span className='text-[#4F3A2E]/70 font-medium'>Gender</span>
                    <span className='font-semibold text-web'>{product.gender}</span>
                  </div>
                )}
                {product.certificationNumber && (
                  <div className='col-span-1 sm:col-span-2 flex justify-between items-center py-2 border-b border-[#E6D3C2]/30'>
                    <span className='text-[#4F3A2E]/70 font-medium'>Certification Number</span>
                    <span className='font-semibold text-web'>{product.certificationNumber}</span>
                  </div>
                )}
              </div>
            </AccordionSection>
          )}
          </div>
        </div>

        {/* You May Also Like Section - Horizontally Scrollable */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className='mt-16 pt-8 border-t border-[#E6D3C2]/30'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h2 className='text-2xl sm:text-3xl font-bold text-web mb-1'>You May Also Like</h2>
                <p className='text-sm text-[#4F3A2E]/70'>Discover More Favourites</p>
              </div>
              <div className='hidden md:flex gap-2'>
                <button
                  onClick={() => scrollRelatedProducts('left')}
                  className='p-2 rounded-full border border-[#E6D3C2] hover:border-[#C8A15B] hover:bg-[#FAF7F4] transition-all'>
                  <ChevronLeft className='w-5 h-5 text-web' />
                </button>
                <button
                  onClick={() => scrollRelatedProducts('right')}
                  className='p-2 rounded-full border border-[#E6D3C2] hover:border-[#C8A15B] hover:bg-[#FAF7F4] transition-all'>
                  <ChevronRight className='w-5 h-5 text-web' />
                </button>
              </div>
            </div>
            <div
              ref={scrollContainerRef}
              className='flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth'>
              {product.relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className='flex-shrink-0 w-[280px] sm:w-[300px]'>
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Add to Cart Button for Mobile */}
      <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6D3C2]/30 shadow-lg z-50 p-4'>
        <div className='flex gap-3 max-w-[1400px] mx-auto'>
          <button
            onClick={handleAddToCart}
            disabled={cartButtonLoading || isInCart || product.stock === 0}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold transition-all text-base',
              isInCart
                ? 'bg-green-500 text-white cursor-default'
                : product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-web text-white'
            )}>
            {cartButtonLoading ? (
              <>
                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                Adding...
              </>
            ) : isInCart ? (
              <>
                <Check size={20} />
                In Cart
              </>
            ) : (
              <>
                <ShoppingCart size={20} />
                Add to Cart
              </>
            )}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={cartButtonLoading || product.stock === 0}
            className={cn(
              'px-6 py-3.5 rounded-lg font-semibold text-base border-2 transition-all',
              product.stock === 0
                ? 'border-gray-300 text-gray-500 cursor-not-allowed bg-gray-100'
                : 'border-[#C8A15B] text-[#C8A15B] hover:bg-[#C8A15B] hover:text-white'
            )}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
