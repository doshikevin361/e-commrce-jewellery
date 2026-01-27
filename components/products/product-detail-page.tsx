'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
  Award,
  Lock,
  Clock,
  Sparkle,
  FileText,
  Tag,
  Diamond,
} from 'lucide-react';
import { ProductCardData, ProductCard } from '@/components/home/common/product-card';
import { PageLoader } from '@/components/common/page-loader';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import 'swiper/css';
import 'swiper/css/navigation';

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
    diamondsType?: string;
    noOfDiamonds?: number;
    diamondWeight?: number;
    diamondSize?: string;
    settingType?: string;
    clarity?: string;
    diamondsColour?: string;
    diamondsShape?: string;
    diamondSetting?: string;
    certifiedLabs?: string;
    certificateNo?: string;
    certificateImages?: string[];
    occasion?: string;
    dimension?: string;
    height?: number;
    width?: number;
    length?: number;
    brand?: string;
    collection?: string;
    thickness?: number;
    description?: string;
    specifications?: { key: string; value: string }[];
    diamondDiscount?: number;
  }>;
  // Legacy diamond fields
  diamondCarat?: number;
  numberOfStones?: number;
  diamondShape?: string;
  stoneClarity?: string;
  stoneColor?: string;
  diamondCut?: string;
  diamondsType?: string;
  noOfDiamonds?: number;
  diamondWeight?: number;
  diamondSize?: string;
  settingType?: string;
  clarity?: string;
  diamondsColour?: string;
  diamondsShape?: string;
  diamondSetting?: string;
  certifiedLabs?: string;
  certificateNo?: string;
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
  gemstoneColour?: string;
  gemstoneShape?: string;
  gemstoneWeight?: number;
  ratti?: number;
  specificGravity?: number;
  hardness?: number;
  refractiveIndex?: number;
  magnification?: number;
  remarks?: string;
  gemstoneDescription?: string;
  reportNo?: string;
  gemstoneCertificateLab?: string;
  hallmarked?: boolean;
  bis_hallmark?: boolean;
  certificationNumber?: string;
  gender?: string;
  // Other product details
  occasion?: string;
  dimension?: string;
  collection?: string;
  designType?: string;
  size?: string;
  thickness?: number | string;
  // Specifications array
  specifications?: Array<{ key: string; value: string }>;
  // Tags
  tags?: string[];
  // Variants
  variants?: Array<{
    id: string;
    type: string;
    options: Array<{
      name: string;
      sku: string;
      price: number;
      stock: number;
      image: string;
    }>;
  }>;
}

// Premium Accordion component
function PremiumAccordion({
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
    <div className='border border-web/20 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full px-8 py-5 hover:bg-gray-100/50 transition-colors group'>
        <div className='flex items-center gap-4'>
          <div className='p-2 rounded-xl bg-gray-100 group-hover:bg-web/10 transition-colors'>
            <Icon className='w-5 h-5 text-web' />
          </div>
          <h3 className='text-lg font-semibold text-[#1F3B29] tracking-wide'>{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className='w-5 h-5 text-[#4F3A2E]/60 group-hover:text-web transition-colors' />
        ) : (
          <ChevronDown className='w-5 h-5 text-[#4F3A2E]/60 group-hover:text-web transition-colors' />
        )}
      </button>
      {isOpen && <div className='px-8 pb-8 pt-4 animate-in fade-in-50 slide-in-from-top-2 duration-300'>{children}</div>}
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
  const [recentlyViewed, setRecentlyViewed] = useState<ProductCardData[]>([]);
  const swiperRef = useRef<any>(null);

  const isInWishlist = product?._id ? isProductInWishlist(product._id.toString()) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // API has Cache-Control headers, browser will cache automatically
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

        // Save to recently viewed
        if (typeof window !== 'undefined') {
          const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
          const updated = [
            {
              id: productData._id,
              _id: productData._id,
              title: productData.name,
              category: productData.categoryName || productData.category,
              price: `₹${productData.displayPrice.toLocaleString()}`,
              originalPrice: productData.hasDiscount ? `₹${productData.originalPrice.toLocaleString()}` : undefined,
              rating: productData.rating || 4.5,
              reviews: productData.reviewCount || 0,
              image: productData.mainImage,
            },
            ...viewed.filter((p: any) => p.id !== productData._id),
          ].slice(0, 10);
          localStorage.setItem('recentlyViewed', JSON.stringify(updated));
          setRecentlyViewed(updated.slice(1)); // Exclude current product
        }
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
    // Load recently viewed
    if (typeof window !== 'undefined') {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(viewed.filter((p: any) => p.id !== product?._id).slice(0, 8));
    }
  }, [product?._id]);

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

  // Helper function - must be defined before hooks
  const fixImagePath = (path: string) => {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path;
    return `/${path}`;
  };

  // All hooks must be called before any conditional returns
  const images = useMemo(() => {
    if (!product) return ['/placeholder.jpg'];
    return product.galleryImages && product.galleryImages.length > 0
      ? [fixImagePath(product.mainImage), ...product.galleryImages.map(fixImagePath)]
      : [fixImagePath(product.mainImage)];
  }, [product?.mainImage, product?.galleryImages]);

  const isInCart = product?._id ? cartItems.some(item => item._id === product._id.toString()) : false;

  // Conditional returns must come after all hooks
  if (loading) return <PageLoader message='Loading product details...' />;

  if (error || !product) {
    return (
      <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-20 text-center'>
        <div className='max-w-md mx-auto'>
          <div className='mb-6'>
            <div className='p-4 bg-web/10 rounded-2xl inline-block mb-4'>
              <Sparkles className='w-12 h-12 text-web' />
            </div>
          </div>
          <h1 className='text-3xl font-bold text-[#1F3B29] mb-4'>{error || 'Product Not Found'}</h1>
          <p className='text-[#4F3A2E]/70 mb-8'>The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

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
    (product.goldWeight || 0) * (product.goldRatePerGram || 0) + (product.silverWeight || 0) * (product.silverRatePerGram || 0);
  const diamondValue = product.diamonds?.reduce((sum, d) => sum + (d.diamondPrice || 0), 0) || 0;
  const makingChargesValue = product.makingCharges || 0;
  const otherCharges =
    (product.shippingCharges || 0) + (product.hallMarkingCharges || 0) + (product.insuranceCharges || 0) + (product.packingCharges || 0);
  const subTotal = product.subTotal || product.price || product.displayPrice;
  const gstAmount = (subTotal * (product.taxRate || 3)) / 100;
  const discountAmount = (subTotal * (product.discount || 0)) / 100;
  const grandTotal = subTotal + gstAmount - discountAmount;

  return (
    <div className='min-h-screen bg-white'>
      {/* Back Button */}
      {/* Main Product Section - Premium Two Column Layout */}
      <div className='mx-auto w-full max-w-[1400px] pb-24 lg:pb-16 pt-6'>
        <div className='grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-10 xl:gap-12 mb-12 lg:mb-16'>
          {/* Left Column - Premium Image Gallery with Side Thumbnails */}
          <div className='flex flex-col lg:flex-row gap-4 lg:gap-6'>
            {/* Gallery Thumbnails - Left Side (Desktop) / Bottom (Mobile) */}
            {images.length > 1 && (
              <div className='flex lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] scrollbar-hide pb-2 lg:pb-0'>
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 overflow-hidden rounded-md border transition-all duration-200 bg-white',
                      selectedImage === index ? 'border-[#001e38] ring-1 ring-[#001e38]/20' : 'border-web/70 hover:border-[#001e38]/40',
                    )}>
                    <Image src={img} alt={`View ${index + 1}`} fill sizes='96px' className='object-cover' />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image with Smooth Zoom */}
            <div className='flex-1 relative'>
              <div
                className='relative w-full overflow-hidden rounded-md bg-white border border-web/70 shadow-sm transition-colors cursor-zoom-in'
                onMouseEnter={() => setImageZoom(true)}
                onMouseLeave={() => setImageZoom(false)}>
                <div className='relative aspect-square w-full'>
                  <Image
                    src={images[selectedImage]}
                    alt={product.name}
                    fill
                    sizes='(max-width: 1024px) 100vw, 50vw'
                    className={cn('object-cover transition-transform duration-700 ease-out', imageZoom ? 'scale-110' : 'scale-100')}
                    priority
                  />
                </div>

                {/* Premium Badges */}
                <div className='absolute top-4 right-4 flex flex-col gap-2'>
                  {product.featured && (
                    <span className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-web to-[#1a2d1f] px-4 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-sm whitespace-nowrap'>
                      ✨ Featured
                    </span>
                  )}
                  {product.trending && !product.featured && (
                    <span className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-sm whitespace-nowrap'>
                      🔥 Trending
                    </span>
                  )}
                  {product.hasDiscount && product.discountPercent > 0 && (
                    <span className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-sm whitespace-nowrap'>
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Zoom Indicator */}
                {imageZoom && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none'>
                    <div className='p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg'>
                      <ZoomIn className='w-6 h-6 text-web' />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Premium Product Information */}
          <div className='flex flex-col space-y-5 lg:space-y-6 lg:pt-2'>
            {/* Category Label */}
            {product.categoryName && <p className='text-xs uppercase tracking-[0.25em] text-web font-bold mb-1'>{product.categoryName}</p>}

            {/* Title with Wishlist & Share */}
            <div className='space-y-3'>
              <div className='flex items-start justify-between gap-4'>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-[#001e38] leading-[1.2] flex-1 tracking-tight'>
                  {product.name}
                </h1>
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={cn(
                      'p-2.5 lg:p-3 rounded-xl border-2 transition-all duration-300 hover:scale-110 active:scale-95',
                      isInWishlist
                        ? 'border-red-500 bg-red-50 hover:bg-red-100 shadow-md'
                        : 'border-webhover:border-web hover:bg-gray-100 hover:shadow-md bg-white',
                    )}>
                    <Heart size={20} className={cn('transition-colors', isInWishlist ? 'text-red-500 fill-red-500' : 'text-[#1F3B29]')} />
                  </button>
                  <div className='relative'>
                    <button
                      onClick={() => setShareMenuOpen(!shareMenuOpen)}
                      className='p-2.5 lg:p-3 rounded-xl border-2 border-webhover:border-web hover:bg-gray-100 bg-white transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-md'>
                      <Share2 size={20} className='text-[#1F3B29]' />
                    </button>
                    {shareMenuOpen && (
                      <div className='absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-web/50 p-2 z-50 min-w-[200px] animate-in fade-in-50 slide-in-from-top-2'>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className='w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-100 rounded-xl text-sm text-left transition-colors'>
                          <MessageCircle size={20} className='text-green-600' />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className='w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-100 rounded-xl text-sm text-left transition-colors'>
                          <Facebook size={20} className='text-blue-600' />
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className='w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-100 rounded-xl text-sm text-left transition-colors'>
                          <LinkIcon size={20} className='text-[#4F3A2E]' />
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating */}
              {product.rating && product.rating > 0 && (
                <div className='flex items-center gap-2.5'>
                  <div className='flex items-center gap-0.5'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.floor(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-web'}
                      />
                    ))}
                  </div>
                  <span className='text-base font-bold text-[#001e38]'>{product.rating.toFixed(1)}</span>
                  <span className='text-sm text-[#4F3A2E]/70'>({product.reviewCount || 0} reviews)</span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className='pb-5 border-b border-web/30'>
              <div className='flex items-baseline gap-3 flex-wrap mb-4'>
                <span className='text-3xl sm:text-4xl font-bold text-[#001e38] tracking-tight'>
                  ₹{product.displayPrice.toLocaleString()}
                </span>
                {product.hasDiscount && product.discountPercent > 0 && (
                  <>
                    <span className='text-xl sm:text-2xl text-[#4F3A2E]/50 line-through decoration-[#4F3A2E]/50'>
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <span className='text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full shadow-md'>
                      {product.discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              {/* Stock Status */}
              <div className='flex items-center gap-2.5'>
                <div className={cn('w-2.5 h-2.5 rounded-full shadow-sm', product.stock > 0 ? 'bg-green-500' : 'bg-red-500')}></div>
                <span className={cn('text-sm font-semibold', product.stock > 0 ? 'text-green-700' : 'text-red-600')}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <div className='pt-1'>
                <p className='text-base text-[#4F3A2E] leading-relaxed'>{product.shortDescription}</p>
              </div>
            )}

            {/* Tags */}
            {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
              <div className='flex flex-wrap items-center gap-2 pt-2'>
                <Tag size={16} className='text-[#4F3A2E]/70' />
                <div className='flex flex-wrap gap-2'>
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 text-xs font-medium bg-gray-100 text-[#1F3B29] rounded-full border border-web/50'>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className='flex items-center gap-4 pt-2'>
              <span className='text-sm font-semibold text-[#1F3B29] uppercase tracking-wide'>Quantity:</span>
              <div className='flex items-center border rounded-xl overflow-hidden shadow-sm bg-white'>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className='p-2.5 lg:p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={quantity <= 1}>
                  <Minus size={18} className='text-[#1F3B29]' />
                </button>
                <span className='px-6 lg:px-8 py-2.5 text-base font-bold text-[#1F3B29] min-w-[4rem] text-center border-x-2 border-webbg-white'>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className='p-2.5 lg:p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={quantity >= product.stock}>
                  <Plus size={18} className='text-[#1F3B29]' />
                </button>
              </div>
            </div>

            {/* Add to Cart & Buy Now Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 pt-1'>
              <button
                onClick={handleAddToCart}
                disabled={cartButtonLoading || isInCart || product.stock === 0}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-6 py-3.5 lg:py-4 rounded-xl font-semibold text-base transition-all duration-300 shadow-md hover:shadow-lg',
                  isInCart
                    ? 'bg-web text-white cursor-default'
                    : product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#001e38] text-white hover:scale-[1.02] active:scale-[0.98] hover:bg-[#002a52]',
                )}>
                {cartButtonLoading ? (
                  <>
                    <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    <span>Adding...</span>
                  </>
                ) : isInCart ? (
                  <>
                    <Check size={20} />
                    <span>In Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={cartButtonLoading || product.stock === 0}
                className={cn(
                  'flex-1 px-6 py-3.5 lg:py-4 rounded-xl font-semibold text-base border-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
                  product.stock === 0
                    ? 'border-gray-300 text-gray-500 cursor-not-allowed bg-gray-100'
                    : 'border-web text-web hover:bg-web bg-white hover:text-white',
                )}>
                <span>Buy Now</span>
              </button>
            </div>

            {/* Product Details Tabs Section */}
            <div className='pt-6'>
              <Tabs defaultValue='specifications' className='w-full'>
                <TabsList className='w-full justify-start bg-gray-100 p-1.5 rounded-2xl border border-web/30 mb-6'>
                  <TabsTrigger
                    value='description'
                    className='data-[state=active]:bg-white data-[state=active]:text-web data-[state=active]:shadow-sm px-6 py-3 rounded-xl font-semibold text-sm transition-all'>
                    Description
                  </TabsTrigger>
                  <TabsTrigger
                    value='specifications'
                    className='data-[state=active]:bg-white data-[state=active]:text-web data-[state=active]:shadow-sm px-6 py-3 rounded-xl font-semibold text-sm transition-all'>
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger
                    value='reviews'
                    className='data-[state=active]:bg-white data-[state=active]:text-web data-[state=active]:shadow-sm px-6 py-3 rounded-xl font-semibold text-sm transition-all'>
                    Reviews
                  </TabsTrigger>
                </TabsList>

                {/* Description Tab */}
                <TabsContent value='description' className='mt-0'>
                  <div className='bg-white rounded-2xl border border-web/30 shadow-sm p-6 lg:p-8'>
                    {product.longDescription ? (
                      <div className='prose prose-sm lg:prose-base max-w-none prose-headings:text-[#1F3B29] prose-headings:font-bold prose-headings:tracking-tight prose-headings:mb-4 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-[#4F3A2E] prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-[#1F3B29] prose-strong:font-semibold prose-ul:text-[#4F3A2E] prose-ul:my-4 prose-ol:text-[#4F3A2E] prose-ol:my-4 prose-li:text-[#4F3A2E] prose-li:my-2 prose-li:pl-2 prose-a:text-web prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-colors prose-img:rounded-xl prose-img:shadow-md prose-img:my-6 prose-img:w-full prose-img:max-w-full prose-hr:border-web/30 prose-hr:my-6 prose-blockquote:border-l-web prose-blockquote:border-l-4 prose-blockquote:bg-gray-100 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:my-4 prose-blockquote:text-[#4F3A2E] prose-code:text-[#1F3B29] prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto prose-table:w-full prose-table:my-4 prose-th:bg-gray-100 prose-th:text-[#1F3B29] prose-th:font-semibold prose-th:p-3 prose-th:border prose-th:border-web/30 prose-td:border prose-td:border-web/30 prose-td:p-3'>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            a: ({ node, ...props }) => (
                              <a
                                {...props}
                                className='text-web font-medium no-underline hover:underline transition-colors'
                                target='_blank'
                                rel='noopener noreferrer'
                              />
                            ),
                            img: ({ node, ...props }) => (
                              <img {...props} className='rounded-xl shadow-md my-6 w-full max-w-full h-auto' alt={props.alt || ''} />
                            ),
                          }}>
                          {product.longDescription}
                        </ReactMarkdown>
                      </div>
                    ) : product.shortDescription ? (
                      <p className='text-base lg:text-lg text-[#4F3A2E] leading-relaxed'>{product.shortDescription}</p>
                    ) : (
                      <p className='text-[#4F3A2E]/70 italic'>No description available for this product.</p>
                    )}
                  </div>
                </TabsContent>

                {/* Specifications Tab */}
                <TabsContent value='specifications' className='mt-0'>
                  <div className='space-y-6'>
                    {(() => {
                      const isValid = (value: any): boolean => {
                        if (value === null || value === undefined) return false;
                        if (typeof value === 'string') return value.trim().length > 0;
                        if (typeof value === 'number') return value > 0;
                        if (typeof value === 'boolean') return value === true;
                        return true;
                      };

                      const hasValidFields =
                        product.hasGold ||
                        product.hasSilver ||
                        isValid(product.metalType) ||
                        isValid(product.goldPurity) ||
                        isValid(product.silverPurity) ||
                        isValid(product.metalPurity) ||
                        isValid(product.goldWeight) ||
                        isValid(product.silverWeight) ||
                        isValid(product.metalWeight) ||
                        isValid(product.goldRatePerGram) ||
                        isValid(product.silverRatePerGram) ||
                        product.hallmarked;

                      if (!hasValidFields) return null;

                      return (
                        <PremiumAccordion title='Metal Details' icon={Package}>
                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm'>
                            {(isValid(product.metalType) || product.hasGold || product.hasSilver) && (
                              <div className='flex justify-between items-center py-3 border-b border-web/20'>
                                <span className='text-[#4F3A2E]/70 font-medium'>Metal Type</span>
                                <span className='font-bold text-[#1F3B29]'>
                                  {product.metalType || (product.hasGold ? 'Gold' : product.hasSilver ? 'Silver' : '—')}
                                </span>
                              </div>
                            )}
                            {(isValid(product.goldPurity) || isValid(product.silverPurity) || isValid(product.metalPurity)) && (
                              <div className='flex justify-between items-center py-3 border-b border-web/20'>
                                <span className='text-[#4F3A2E]/70 font-medium'>Purity</span>
                                <span className='font-bold text-[#1F3B29]'>
                                  {product.goldPurity || product.silverPurity || product.metalPurity}
                                </span>
                              </div>
                            )}
                            {(isValid(product.goldWeight) || isValid(product.silverWeight) || isValid(product.metalWeight)) && (
                              <div className='flex justify-between items-center py-3 border-b border-web/20'>
                                <span className='text-[#4F3A2E]/70 font-medium'>Weight</span>
                                <span className='font-bold text-[#1F3B29]'>
                                  {(product.goldWeight || product.silverWeight || product.metalWeight)?.toFixed(2)}g
                                </span>
                              </div>
                            )}
                            {(isValid(product.goldRatePerGram) || isValid(product.silverRatePerGram)) && (
                              <div className='flex justify-between items-center py-3 border-b border-web/20'>
                                <span className='text-[#4F3A2E]/70 font-medium'>Rate per gram</span>
                                <span className='font-bold text-[#1F3B29]'>
                                  ₹{(product.goldRatePerGram || product.silverRatePerGram)?.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {product.hallmarked && (
                              <div className='col-span-1 sm:col-span-2 flex justify-between items-center py-3 border-b border-web/20'>
                                <span className='text-[#4F3A2E]/70 font-medium'>Hallmark</span>
                                <span className='font-bold text-[#1F3B29]'>{product.bis_hallmark ? 'BIS Hallmarked' : 'Hallmarked'}</span>
                              </div>
                            )}
                          </div>
                        </PremiumAccordion>
                      );
                    })()}

                    <PremiumAccordion title='Price Breakup' icon={Coins}>
                      <div className='space-y-4 text-sm'>
                        {metalValue > 0 && (
                          <div className='flex justify-between items-center py-3 border-b border-web/20'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Metal Value</span>
                            <span className='font-bold text-[#1F3B29]'>₹{metalValue.toLocaleString()}</span>
                          </div>
                        )}
                        {diamondValue > 0 && (
                          <div className='flex justify-between items-center py-3 border-b border-web/20'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Diamond Value</span>
                            <span className='font-bold text-[#1F3B29]'>₹{diamondValue.toLocaleString()}</span>
                          </div>
                        )}
                        {product.gemstonePrice && product.gemstonePrice > 0 && (
                          <div className='flex justify-between items-center py-3 border-b border-web/20'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Gemstone Value</span>
                            <span className='font-bold text-[#1F3B29]'>₹{product.gemstonePrice.toLocaleString()}</span>
                          </div>
                        )}
                        {makingChargesValue > 0 && (
                          <div className='flex justify-between items-center py-3'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Making Charges</span>
                            <span className='font-bold text-[#1F3B29]'>₹{makingChargesValue.toLocaleString()}</span>
                          </div>
                        )}
                        {otherCharges > 0 && (
                          <div className='flex justify-between items-center py-3 border-b border-web/20'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Other Charges</span>
                            <span className='font-bold text-[#1F3B29]'>₹{otherCharges.toLocaleString()}</span>
                          </div>
                        )}
                        <div className='flex justify-between items-center py-4 pt-5 border-t-2 border-web/30'>
                          <span className='text-[#4F3A2E] font-semibold'>Subtotal</span>
                          <span className='font-bold text-lg text-[#1F3B29]'>₹{subTotal.toLocaleString()}</span>
                        </div>
                        {product.discount && product.discount > 0 && product.discount <= 100 && discountAmount > 0 && (
                          <div className='flex justify-between items-center py-3 text-red-600'>
                            <span className='font-medium'>Discount ({product.discount}%)</span>
                            <span className='font-bold'>-₹{discountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className='flex justify-between items-center py-3'>
                          <span className='text-[#4F3A2E]/70 font-medium'>GST ({product.taxRate || 3}%)</span>
                          <span className='font-bold text-[#1F3B29]'>₹{gstAmount.toLocaleString()}</span>
                        </div>
                        <div className='flex justify-between items-center py-5 pt-6 border-t-2 border-web/30 bg-gradient-to-r from-[#FAF7F4] to-white px-4 -mx-2'>
                          <span className='font-bold text-xl text-[#1F3B29]'>Grand Total</span>
                          <span className='font-bold text-2xl text-[#1F3B29]'>₹{grandTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </PremiumAccordion>

                    {(product.hasDiamond || product.diamonds) &&
                      (product.diamonds?.some(
                        d =>
                          d.diamondType ||
                          d.diamondsType ||
                          d.diamondShape ||
                          d.diamondsShape ||
                          d.diamondClarity ||
                          d.clarity ||
                          d.diamondColor ||
                          d.diamondsColour ||
                          d.diamondCut ||
                          d.diamondCaratWeight ||
                          d.diamondWeight ||
                          d.numberOfDiamonds ||
                          d.noOfDiamonds ||
                          d.diamondPrice ||
                          d.diamondDiscount ||
                          d.diamondSize ||
                          d.settingType ||
                          d.diamondSetting ||
                          d.certifiedLabs ||
                          d.certification ||
                          d.certificateNo ||
                          (d.certificateImages && d.certificateImages.length > 0) ||
                          d.occasion ||
                          d.dimension ||
                          d.height ||
                          d.width ||
                          d.length ||
                          d.thickness ||
                          d.brand ||
                          d.collection ||
                          (d.specifications && d.specifications.length > 0) ||
                          d.description,
                      ) ||
                        product.diamondCarat ||
                        product.numberOfStones ||
                        product.diamondShape ||
                        product.stoneClarity ||
                        product.stoneColor ||
                        product.diamondCut ||
                        product.diamondsType ||
                        product.noOfDiamonds ||
                        product.diamondWeight ||
                        product.diamondSize ||
                        product.settingType ||
                        product.clarity ||
                        product.diamondsColour ||
                        product.diamondsShape ||
                        product.diamondSetting ||
                        product.certifiedLabs ||
                        product.certificateNo ||
                        product.occasion ||
                        product.dimension ||
                        product.height ||
                        product.width ||
                        product.length ||
                        product.thickness ||
                        product.brand ||
                        product.collection) && (
                        <PremiumAccordion title='Diamond Details' icon={Diamond}>
                          <div className='space-y-6'>
                            {product.diamonds && product.diamonds.length > 0 ? (
                              product.diamonds.map((diamond, index) => {
                                const diamondRows = [
                                  { label: 'Type', value: diamond.diamondsType || diamond.diamondType },
                                  { label: 'No. of Diamonds', value: diamond.noOfDiamonds ?? diamond.numberOfDiamonds },
                                  {
                                    label: 'Discount',
                                    value:
                                      typeof diamond.diamondDiscount === 'number' && diamond.diamondDiscount > 0
                                        ? `${diamond.diamondDiscount}%`
                                        : undefined,
                                  },
                                  {
                                    label: 'Price',
                                    value:
                                      typeof diamond.diamondPrice === 'number' && diamond.diamondPrice > 0
                                        ? `₹${diamond.diamondPrice.toLocaleString()}`
                                        : undefined,
                                  },
                                  {
                                    label: 'Weight',
                                    value:
                                      typeof (diamond.diamondWeight ?? diamond.diamondCaratWeight) === 'number' &&
                                      (diamond.diamondWeight ?? diamond.diamondCaratWeight) > 0
                                        ? `${(diamond.diamondWeight ?? diamond.diamondCaratWeight)?.toFixed(2)}ct`
                                        : undefined,
                                  },
                                  { label: 'Size', value: diamond.diamondSize },
                                  { label: 'Setting Type', value: diamond.settingType || diamond.diamondSetting },
                                  { label: 'Clarity', value: diamond.clarity || diamond.diamondClarity },
                                  { label: 'Color', value: diamond.diamondsColour || diamond.diamondColor },
                                  { label: 'Shape', value: diamond.diamondsShape || diamond.diamondShape },
                                  { label: 'Cut', value: diamond.diamondCut },
                                  { label: 'Certified Lab', value: diamond.certifiedLabs || diamond.certification },
                                  { label: 'Certificate No.', value: diamond.certificateNo },
                                  { label: 'Occasion', value: diamond.occasion },
                                  { label: 'Dimensions', value: diamond.dimension },
                                  {
                                    label: 'Height',
                                    value: typeof diamond.height === 'number' && diamond.height > 0 ? diamond.height : undefined,
                                  },
                                  {
                                    label: 'Width',
                                    value: typeof diamond.width === 'number' && diamond.width > 0 ? diamond.width : undefined,
                                  },
                                  {
                                    label: 'Length',
                                    value: typeof diamond.length === 'number' && diamond.length > 0 ? diamond.length : undefined,
                                  },
                                  {
                                    label: 'Thickness',
                                    value: typeof diamond.thickness === 'number' && diamond.thickness > 0 ? diamond.thickness : undefined,
                                  },
                                  { label: 'Brand', value: diamond.brand },
                                  { label: 'Collection', value: diamond.collection },
                                ].filter(item => {
                                  if (item.value === null || item.value === undefined) return false;
                                  if (typeof item.value === 'string') return item.value.trim().length > 0;
                                  if (typeof item.value === 'number') return item.value > 0;
                                  return true;
                                });

                                const diamondSpecs = diamond.specifications?.filter(spec => spec.key?.trim() || spec.value?.trim()) || [];

                                return (
                                  <div key={diamond.id || index} className='border border-web/30 rounded-xl p-4'>
                                    <h4 className='text-sm font-bold text-[#1F3B29] mb-4 uppercase tracking-wider'>Diamond #{index + 1}</h4>
                                    {diamondRows.length > 0 && (
                                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                                        {diamondRows.map((item, rowIndex) => (
                                          <div
                                            key={`${item.label}-${rowIndex}`}
                                            className='rounded-lg border border-web/20 bg-white/70 p-3 shadow-sm'>
                                            <span className='block text-[11px] uppercase tracking-wider text-[#4F3A2E]/60 font-semibold'>
                                              {item.label}
                                            </span>
                                            <span className='mt-1 block text-sm font-semibold text-[#1F3B29] leading-snug break-words'>
                                              {item.value}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {diamondSpecs.length > 0 && (
                                      <div className='mt-6'>
                                        <h5 className='text-xs font-semibold uppercase tracking-wider text-[#1F3B29] mb-3'>
                                          Diamond Specifications
                                        </h5>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
                                          {diamondSpecs.map((spec, specIndex) => (
                                            <div
                                              key={`${spec.key || 'spec'}-${specIndex}`}
                                              className='rounded-lg border border-web/20 bg-white/70 p-3 shadow-sm'>
                                              <span className='block text-[11px] uppercase tracking-wider text-[#4F3A2E]/60 font-semibold'>
                                                {spec.key || 'Specification'}
                                              </span>
                                              <span className='mt-1 block text-sm font-semibold text-[#1F3B29] leading-snug break-words'>
                                                {spec.value || '—'}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {diamond.description && (
                                      <div className='mt-6'>
                                        <h5 className='text-xs font-semibold uppercase tracking-wider text-[#1F3B29] mb-2'>
                                          Diamond Description
                                        </h5>
                                        <div className='prose prose-sm max-w-none prose-p:text-[#4F3A2E]/80 prose-p:leading-relaxed prose-strong:text-[#1F3B29] prose-strong:font-semibold prose-ul:text-[#4F3A2E]/80 prose-ol:text-[#4F3A2E]/80 prose-li:my-1 prose-a:text-web prose-a:font-medium prose-a:no-underline hover:prose-a:underline'>
                                          <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                              a: ({ node, ...props }) => (
                                                <a
                                                  {...props}
                                                  className='text-web font-medium no-underline hover:underline transition-colors'
                                                  target='_blank'
                                                  rel='noopener noreferrer'
                                                />
                                              ),
                                            }}>
                                            {diamond.description}
                                          </ReactMarkdown>
                                        </div>
                                      </div>
                                    )}
                                    {diamond.certificateImages && diamond.certificateImages.length > 0 && (
                                      <div className='mt-6'>
                                        <h5 className='text-xs font-semibold uppercase tracking-wider text-[#1F3B29] mb-3'>
                                          Certificate Images
                                        </h5>
                                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                                          {diamond.certificateImages.map((url, imageIndex) => (
                                            <div
                                              key={`${diamond.id || index}-certificate-${imageIndex}`}
                                              className='relative aspect-square overflow-hidden rounded-xl border border-web/20 bg-white shadow-sm'>
                                              <Image
                                                src={fixImagePath(url)}
                                                alt={`Diamond ${index + 1} certificate ${imageIndex + 1}`}
                                                fill
                                                sizes='160px'
                                                className='object-cover'
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                                {[
                                  { label: 'Type', value: product.diamondsType },
                                  { label: 'No. of Diamonds', value: product.noOfDiamonds ?? product.numberOfStones },
                                  {
                                    label: 'Weight',
                                    value:
                                      typeof (product.diamondWeight ?? product.diamondCarat) === 'number' &&
                                      (product.diamondWeight ?? product.diamondCarat) > 0
                                        ? `${(product.diamondWeight ?? product.diamondCarat)?.toFixed(2)}ct`
                                        : undefined,
                                  },
                                  { label: 'Size', value: product.diamondSize },
                                  { label: 'Setting Type', value: product.settingType || product.diamondSetting },
                                  { label: 'Clarity', value: product.clarity || product.stoneClarity },
                                  { label: 'Color', value: product.diamondsColour || product.stoneColor },
                                  { label: 'Shape', value: product.diamondsShape || product.diamondShape },
                                  { label: 'Cut', value: product.diamondCut },
                                  { label: 'Certified Lab', value: product.certifiedLabs },
                                  { label: 'Certificate No.', value: product.certificateNo },
                                  { label: 'Occasion', value: product.occasion },
                                  { label: 'Dimensions', value: product.dimension },
                                  {
                                    label: 'Height',
                                    value: typeof product.height === 'number' && product.height > 0 ? product.height : undefined,
                                  },
                                  {
                                    label: 'Width',
                                    value: typeof product.width === 'number' && product.width > 0 ? product.width : undefined,
                                  },
                                  {
                                    label: 'Length',
                                    value: typeof product.length === 'number' && product.length > 0 ? product.length : undefined,
                                  },
                                  {
                                    label: 'Thickness',
                                    value: typeof product.thickness === 'number' && product.thickness > 0 ? product.thickness : undefined,
                                  },
                                  { label: 'Brand', value: product.brand },
                                  { label: 'Collection', value: product.collection },
                                ]
                                  .filter(item => {
                                    if (item.value === null || item.value === undefined) return false;
                                    if (typeof item.value === 'string') return item.value.trim().length > 0;
                                    if (typeof item.value === 'number') return item.value > 0;
                                    return true;
                                  })
                                  .map((item, rowIndex) => (
                                    <div
                                      key={`${item.label}-${rowIndex}`}
                                      className='flex justify-between items-center py-3 border-b border-web/20'>
                                      <span className='text-[#4F3A2E]/70 font-medium'>{item.label}</span>
                                      <span className='font-bold text-[#1F3B29]'>{item.value}</span>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </PremiumAccordion>
                      )}

                    {product.gemstoneName && (
                      <PremiumAccordion title='Gemstone Details' icon={Gem}>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                          {product.gemstoneName && (
                            <div className='flex justify-between items-center py-3 border-b border-web/20'>
                              <span className='text-[#4F3A2E]/70 font-medium'>Gemstone</span>
                              <span className='font-bold text-[#1F3B29]'>{product.gemstoneName}</span>
                            </div>
                          )}
                          {product.gemstoneColour && (
                            <div className='flex justify-between items-center py-3 border-b border-web/20'>
                              <span className='text-[#4F3A2E]/70 font-medium'>Color</span>
                              <span className='font-bold text-[#1F3B29]'>{product.gemstoneColour}</span>
                            </div>
                          )}
                          {product.gemstoneShape && (
                            <div className='flex justify-between items-center py-3 border-b border-web/20'>
                              <span className='text-[#4F3A2E]/70 font-medium'>Shape</span>
                              <span className='font-bold text-[#1F3B29]'>{product.gemstoneShape}</span>
                            </div>
                          )}
                          {product.gemstoneWeight && (
                            <div className='flex justify-between items-center py-3 border-b border-web/20'>
                              <span className='text-[#4F3A2E]/70 font-medium'>Weight</span>
                              <span className='font-bold text-[#1F3B29]'>{product.gemstoneWeight}ct</span>
                            </div>
                          )}
                          {product.ratti && (
                            <div className='flex justify-between items-center py-3 border-b border-web/20'>
                              <span className='text-[#4F3A2E]/70 font-medium'>Ratti</span>
                              <span className='font-bold text-[#1F3B29]'>{product.ratti}</span>
                            </div>
                          )}
                          {product.specificGravity && (
                            <div className='flex justify-between items-center py-3 border-b border-web/20'>
                              <span className='text-[#4F3A2E]/70 font-medium'>Specific Gravity</span>
                              <span className='font-bold text-[#1F3B29]'>{product.specificGravity}</span>
                            </div>
                          )}
                          {product.hardness && (
                            <div className='flex justify-between items-center py-3 border-b border-web/20'>
                              <span className='text-[#4F3A2E]/70 font-medium'>Hardness</span>
                              <span className='font-bold text-[#1F3B29]'>{product.hardness}</span>
                            </div>
                          )}
                          {product.refractiveIndex && (
                            <div className='flex justify-between items-center py-3 border-b border-web/20'>
                              <span className='text-[#4F3A2E]/70 font-medium'>Refractive Index</span>
                              <span className='font-bold text-[#1F3B29]'>{product.refractiveIndex}</span>
                            </div>
                          )}
                          {product.magnification && (
                            <div className='flex justify-between items-center py-3 border-b border-web/20'>
                              <span className='text-[#4F3A2E]/70 font-medium'>Magnification</span>
                              <span className='font-bold text-[#1F3B29]'>{product.magnification}</span>
                            </div>
                          )}
                          {product.remarks && (
                            <div className='col-span-1 sm:col-span-2 flex justify-between items-center py-3 border-b border-web/20'>
                              <span className='text-[#4F3A2E]/70 font-medium'>Remarks</span>
                              <span className='font-bold text-[#1F3B29]'>{product.remarks}</span>
                            </div>
                          )}
                        </div>
                      </PremiumAccordion>
                    )}

                    {product.specifications && product.specifications.length > 0 && (
                      <PremiumAccordion title='Specifications' icon={FileText} defaultOpen={false}>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                          {product.specifications.map((spec, index) => (
                            <div
                              key={`${spec.key}-${index}`}
                              className='rounded-xl border border-web/20 bg-white/70 p-4 shadow-sm'>
                              <span className='block text-[11px] uppercase tracking-wider text-[#4F3A2E]/60 font-semibold'>
                                {spec.key}
                              </span>
                              <span className='mt-2 block text-sm font-semibold text-[#1F3B29] leading-snug break-words'>
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </PremiumAccordion>
                    )}

                    {product.certificationNumber && (
                      <PremiumAccordion title='Certification' icon={Award} defaultOpen={false}>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                          <div className='flex justify-between items-center py-3 border-b border-web/20'>
                            <span className='text-[#4F3A2E]/70 font-medium'>Certificate No.</span>
                            <span className='font-bold text-[#1F3B29]'>{product.certificationNumber}</span>
                          </div>
                          {product.gemstoneCertificateLab && (
                            <div className='flex justify-between items-center py-3 border-b border-web/20'>
                              <span className='text-[#4F3A2E]/70 font-medium'>Lab</span>
                              <span className='font-bold text-[#1F3B29]'>{product.gemstoneCertificateLab}</span>
                            </div>
                          )}
                          {product.reportNo && (
                            <div className='flex justify-between items-center py-3 border-b border-web/20'>
                              <span className='text-[#4F3A2E]/70 font-medium'>Report No.</span>
                              <span className='font-bold text-[#1F3B29]'>{product.reportNo}</span>
                            </div>
                          )}
                        </div>
                      </PremiumAccordion>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value='reviews' className='mt-0'>
                  <div className='bg-white rounded-2xl border border-web/30 shadow-sm p-6 lg:p-8'>
                    <div className='flex items-center gap-3 mb-6'>
                      <Sparkles className='w-5 h-5 text-web' />
                      <h3 className='text-lg font-semibold text-[#1F3B29]'>Customer Reviews</h3>
                    </div>
                    <p className='text-sm text-[#4F3A2E]/70'>No reviews yet. Be the first to review this product.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Trust Badges */}
            <div className='grid grid-cols-3 gap-3 lg:gap-4 pt-6 border-t border-web/30'>
              <div className='flex flex-col items-center gap-2 text-center p-3 lg:p-4 rounded-xl bg-web/60 bg-white transition-colors cursor-default'>
                <div className='p-2.5 rounded-full bg-gray-100'>
                  <Award className='w-5 h-5 lg:w-6 lg:h-6 text-web' />
                </div>
                <span className='text-xs text-[#4F3A2E] font-semibold leading-tight'>Certified Gold</span>
              </div>
              <div className='flex flex-col items-center gap-2 text-center p-3 lg:p-4 rounded-xl bg-white/60 hover:bg-white transition-colors cursor-default'>
                <div className='p-2.5 rounded-full bg-gray-100'>
                  <RotateCcw className='w-5 h-5 lg:w-6 lg:h-6 text-web' />
                </div>
                <span className='text-xs text-[#4F3A2E] font-semibold leading-tight'>Easy Returns</span>
              </div>
              <div className='flex flex-col items-center gap-2 text-center p-3 lg:p-4 rounded-xl bg-white/60 hover:bg-white transition-colors cursor-default'>
                <div className='p-2.5 rounded-full bg-gray-100'>
                  <Lock className='w-5 h-5 lg:w-6 lg:h-6 text-web' />
                </div>
                <span className='text-xs text-[#4F3A2E] font-semibold leading-tight'>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section - Grid View */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className='mt-20 pt-12 border-t border-web/30'>
            <div className='mb-8'>
              <h2 className='text-xl sm:text-2xl font-bold text-[#1F3B29] mb-2 tracking-tight'>You May Also Like</h2>
              <p className='text-sm text-[#4F3A2E]/70'>Discover More Favourites</p>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8'>
              {product.relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <div className='mt-20 pt-12 border-t border-web/30'>
            <div className='mb-8'>
              <h2 className='text-xl sm:text-2xl font-bold text-[#1F3B29] mb-2 tracking-tight'>Recently Viewed</h2>
              <p className='text-sm text-[#4F3A2E]/70'>Continue Your Journey</p>
            </div>
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={24}
              slidesPerView='auto'
              navigation
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              breakpoints={{
                320: { spaceBetween: 16 },
                640: { spaceBetween: 20 },
                1024: { spaceBetween: 24 },
              }}
              className='pb-4'>
              {recentlyViewed.map(viewedProduct => (
                <SwiperSlide key={viewedProduct.id} style={{ width: 'auto', minWidth: '280px', maxWidth: '320px' }}>
                  <ProductCard product={viewedProduct} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      {/* Sticky Add to Cart Button for Mobile */}
      <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-web/30 shadow-2xl z-50 p-3 safe-area-bottom'>
        <div className='flex gap-2 max-w-[1400px] mx-auto'>
          <button
            onClick={handleAddToCart}
            disabled={cartButtonLoading || isInCart || product.stock === 0}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg',
              isInCart
                ? 'bg-green-500 text-white cursor-default'
                : product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#1F3B29] text-white hover:bg-[#2a4d3a] active:scale-[0.98]',
            )}>
            {cartButtonLoading ? (
              <>
                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                <span>Adding...</span>
              </>
            ) : isInCart ? (
              <>
                <Check size={18} />
                <span>In Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={cartButtonLoading || product.stock === 0}
            className={cn(
              'flex-1 px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all shadow-md hover:shadow-lg bg-white active:scale-[0.98]',
              product.stock === 0
                ? 'border-gray-300 text-gray-500 cursor-not-allowed bg-gray-100'
                : 'border-web text-web hover:bg-web hover:text-white',
            )}>
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
