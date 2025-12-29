'use client';

import { useState, useEffect } from 'react';
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

// Collapsible section component
function CollapsibleSection({
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
    <div className='border-b border-[#E6D3C2]/50'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full py-4 px-1 hover:bg-[#FAF7F4]/50 transition-colors group'>
        <div className='flex items-center gap-3'>
          <Icon className='w-5 h-5 text-[#C8A15B]' />
          <h3 className='text-base font-semibold text-[#1F3B29] uppercase tracking-wide'>{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className='w-5 h-5 text-[#4F3A2E]/60 group-hover:text-[#C8A15B] transition-colors' />
        ) : (
          <ChevronDown className='w-5 h-5 text-[#4F3A2E]/60 group-hover:text-[#C8A15B] transition-colors' />
        )}
      </button>
      {isOpen && <div className='pb-5 px-1 animate-in fade-in-50 slide-in-from-top-2 duration-300'>{children}</div>}
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
          <h1 className='text-3xl font-bold text-[#1F3B29] mb-4'>{error || 'Product Not Found'}</h1>
          <p className='text-[#4F3A2E]/70 mb-8'>The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/products')}
            className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1F3B29] to-[#2a4d3a] px-8 py-4 text-white font-semibold hover:shadow-xl transition-all'>
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
  const metalValue = (product.goldWeight || 0) * (product.goldRatePerGram || 0) + (product.silverWeight || 0) * (product.silverRatePerGram || 0);
  const diamondValue = product.diamonds?.reduce((sum, d) => sum + (d.diamondPrice || 0), 0) || 0;
  const makingChargesValue = product.makingCharges || 0;
  const otherCharges = (product.shippingCharges || 0) + (product.hallMarkingCharges || 0) + (product.insuranceCharges || 0) + (product.packingCharges || 0);
  const subTotal = product.subTotal || product.price || product.displayPrice;
  const gstAmount = (subTotal * (product.taxRate || 3)) / 100;
  const discountAmount = (subTotal * (product.discount || 0)) / 100;
  const grandTotal = subTotal + gstAmount - discountAmount;

  return (
    <div className='mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 py-6 sm:py-8'>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className='mb-6 flex items-center gap-2 text-sm font-medium text-[#4F3A2E]/70 hover:text-[#1F3B29] transition-all group'>
        <ArrowLeft size={16} className='group-hover:-translate-x-1 transition-transform' />
        <span>Back to Products</span>
      </button>

      {/* Main Product Grid - More Compact */}
      <div className='grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12'>
        {/* Image Gallery */}
        <div className='flex gap-3 items-start'>
          {/* Thumbnails */}
          <div className='flex flex-col gap-2'>
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  'relative w-16 h-16 overflow-hidden rounded-lg border-2 transition-all hover:scale-105 bg-white',
                  selectedImage === index
                    ? 'border-[#C8A15B] ring-2 ring-[#C8A15B]/30'
                    : 'border-[#E6D3C2] hover:border-[#C8A15B]/60'
                )}>
                <Image src={img} alt={`View ${index + 1}`} fill sizes='64px' className='object-cover' />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className='relative flex-1'>
            <div className='relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#F5EEE5] to-white border border-[#E6D3C2]/30'>
              <div className='relative aspect-square'>
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes='(max-width: 1024px) 100vw, 60vw'
                  className='object-cover'
                  priority
                />
              </div>
              {/* Badges */}
              {(product.featured || product.trending) && (
                <span className='absolute left-4 top-4 rounded-full bg-gradient-to-r from-[#C8A15B] to-[#B8914F] px-3 py-1 text-xs font-semibold text-white shadow-lg'>
                  {product.featured ? '✨ Featured' : '🔥 Trending'}
                </span>
              )}
              {product.hasDiscount && product.discountPercent > 0 && (
                <span className='absolute right-4 top-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-3 py-1 text-xs font-semibold text-white shadow-lg'>
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Info - Compact */}
        <div className='flex flex-col space-y-5'>
          {/* Header */}
          <div className='space-y-3'>
            {product.categoryName && (
              <p className='text-xs uppercase tracking-wider text-[#C8A15B] font-semibold'>{product.categoryName}</p>
            )}
            <h1 className='text-2xl sm:text-3xl font-bold text-[#1F3B29] leading-tight'>{product.name}</h1>

            {/* Rating */}
            {product.rating && product.rating > 0 && (
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating || 0) ? 'text-[#C8A15B] fill-[#C8A15B]' : 'text-[#E6D3C2]'}
                    />
                  ))}
                </div>
                <span className='text-sm font-semibold text-[#1F3B29]'>{product.rating.toFixed(1)}</span>
                <span className='text-xs text-[#4F3A2E]/70'>({product.reviewCount || 0})</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className='pb-4 border-b border-[#E6D3C2]/50'>
            <div className='flex items-baseline gap-2 flex-wrap'>
              <span className='text-3xl font-bold text-[#1F3B29]'>₹{product.displayPrice.toLocaleString()}</span>
              {product.hasDiscount && product.discountPercent > 0 && (
                <>
                  <span className='text-lg text-[#4F3A2E]/50 line-through'>₹{product.originalPrice.toLocaleString()}</span>
                  <span className='text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full'>
                    {product.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            {/* Stock */}
            <div className='flex items-center gap-2 mt-3'>
              <div className={cn('w-2 h-2 rounded-full', product.stock > 0 ? 'bg-green-500' : 'bg-red-500')}></div>
              <span className={cn('text-sm font-medium', product.stock > 0 ? 'text-green-700' : 'text-red-600')}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Description */}
          {product.shortDescription && (
            <div>
              <p className='text-sm text-[#4F3A2E] leading-relaxed'>{product.shortDescription}</p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className='flex flex-col gap-3 pt-2'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center border border-[#E6D3C2] rounded-lg overflow-hidden'>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className='p-2 hover:bg-[#FAF7F4] transition-colors'
                  disabled={quantity <= 1}>
                  <Minus size={16} className='text-[#1F3B29]' />
                </button>
                <span className='px-4 py-2 text-sm font-semibold text-[#1F3B29] min-w-[3rem] text-center'>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className='p-2 hover:bg-[#FAF7F4] transition-colors'
                  disabled={quantity >= product.stock}>
                  <Plus size={16} className='text-[#1F3B29]' />
                </button>
              </div>

              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={cn(
                  'p-3 rounded-lg border transition-all',
                  isInWishlist
                    ? 'border-red-500 bg-red-50 hover:bg-red-100'
                    : 'border-[#E6D3C2] hover:border-[#C8A15B] hover:bg-[#FAF7F4]'
                )}>
                <Heart
                  size={20}
                  className={cn(isInWishlist ? 'text-red-500 fill-red-500' : 'text-[#1F3B29]')}
                />
              </button>

              <div className='relative'>
                <button
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
                  className='p-3 rounded-lg border border-[#E6D3C2] hover:border-[#C8A15B] hover:bg-[#FAF7F4] transition-all'>
                  <Share2 size={20} className='text-[#1F3B29]' />
                </button>
                {shareMenuOpen && (
                  <div className='absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-[#E6D3C2] p-2 z-50 min-w-[160px]'>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className='w-full flex items-center gap-2 px-3 py-2 hover:bg-[#FAF7F4] rounded text-sm text-left'>
                      <MessageCircle size={16} />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className='w-full flex items-center gap-2 px-3 py-2 hover:bg-[#FAF7F4] rounded text-sm text-left'>
                      <Facebook size={16} />
                      Facebook
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className='w-full flex items-center gap-2 px-3 py-2 hover:bg-[#FAF7F4] rounded text-sm text-left'>
                      <LinkIcon size={16} />
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={cartButtonLoading || isInCart || product.stock === 0}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold transition-all text-sm',
                isInCart
                  ? 'bg-green-500 text-white cursor-default'
                  : product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#1F3B29] to-[#2a4d3a] text-white hover:shadow-lg hover:scale-[1.02]'
              )}>
              {cartButtonLoading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Adding...
                </>
              ) : isInCart ? (
                <>
                  <Check size={18} />
                  In Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Trust Badges - Compact */}
          <div className='grid grid-cols-3 gap-3 pt-4 border-t border-[#E6D3C2]/50'>
            <div className='flex flex-col items-center gap-1.5 text-center'>
              <Truck className='w-5 h-5 text-[#C8A15B]' />
              <span className='text-xs text-[#4F3A2E]/80 font-medium'>Free Shipping</span>
            </div>
            <div className='flex flex-col items-center gap-1.5 text-center'>
              <RotateCcw className='w-5 h-5 text-[#C8A15B]' />
              <span className='text-xs text-[#4F3A2E]/80 font-medium'>Easy Returns</span>
            </div>
            <div className='flex flex-col items-center gap-1.5 text-center'>
              <Shield className='w-5 h-5 text-[#C8A15B]' />
              <span className='text-xs text-[#4F3A2E]/80 font-medium'>Certified</span>
            </div>
          </div>

          {/* Collapsible Sections */}
          <div className='mt-4 border-t border-[#E6D3C2]/50'>
            {/* Price Breakup */}
            <CollapsibleSection title='Price Breakup' icon={Coins} defaultOpen={true}>
              <div className='space-y-2 text-sm'>
                {metalValue > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-[#4F3A2E]/70'>Metal</span>
                    <span className='font-semibold text-[#1F3B29]'>₹{metalValue.toLocaleString()}</span>
                  </div>
                )}
                {diamondValue > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-[#4F3A2E]/70'>Diamond</span>
                    <span className='font-semibold text-[#1F3B29]'>₹{diamondValue.toLocaleString()}</span>
                  </div>
                )}
                {product.gemstonePrice && product.gemstonePrice > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-[#4F3A2E]/70'>Gemstone</span>
                    <span className='font-semibold text-[#1F3B29]'>₹{product.gemstonePrice.toLocaleString()}</span>
                  </div>
                )}
                {makingChargesValue > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-[#4F3A2E]/70'>Making Charges</span>
                    <span className='font-semibold text-[#1F3B29]'>₹{makingChargesValue.toLocaleString()}</span>
                  </div>
                )}
                {otherCharges > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-[#4F3A2E]/70'>Other Charges</span>
                    <span className='font-semibold text-[#1F3B29]'>₹{otherCharges.toLocaleString()}</span>
                  </div>
                )}
                <div className='flex justify-between pt-2 border-t border-[#E6D3C2]/50'>
                  <span className='text-[#4F3A2E]/70'>Subtotal</span>
                  <span className='font-semibold text-[#1F3B29]'>₹{subTotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className='flex justify-between text-red-600'>
                    <span>Discount ({product.discount}%)</span>
                    <span className='font-semibold'>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-[#4F3A2E]/70'>GST ({product.taxRate || 3}%)</span>
                  <span className='font-semibold text-[#1F3B29]'>₹{gstAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between pt-2 border-t-2 border-[#C8A15B]/30'>
                  <span className='font-bold text-[#1F3B29]'>Grand Total</span>
                  <span className='font-bold text-[#1F3B29] text-lg'>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </CollapsibleSection>

            {/* Metal Details */}
            {(product.hasGold || product.hasSilver || product.metalType) && (
              <CollapsibleSection title='Metal Details' icon={Package}>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  {(product.metalType || product.hasGold) && (
                    <div>
                      <span className='text-[#4F3A2E]/70 block mb-1'>Metal Type</span>
                      <span className='font-semibold text-[#1F3B29]'>
                        {product.metalType || (product.hasGold ? 'Gold' : 'Silver')}
                      </span>
                    </div>
                  )}
                  {(product.goldPurity || product.silverPurity || product.metalPurity) && (
                    <div>
                      <span className='text-[#4F3A2E]/70 block mb-1'>Purity</span>
                      <span className='font-semibold text-[#1F3B29]'>
                        {product.goldPurity || product.silverPurity || product.metalPurity}
                      </span>
                    </div>
                  )}
                  {(product.goldWeight || product.silverWeight || product.metalWeight) && (
                    <div>
                      <span className='text-[#4F3A2E]/70 block mb-1'>Weight</span>
                      <span className='font-semibold text-[#1F3B29]'>
                        {(product.goldWeight || product.silverWeight || product.metalWeight)?.toFixed(2)}g
                      </span>
                    </div>
                  )}
                  {(product.goldRatePerGram || product.silverRatePerGram) && (
                    <div>
                      <span className='text-[#4F3A2E]/70 block mb-1'>Rate per gram</span>
                      <span className='font-semibold text-[#1F3B29]'>
                        ₹{(product.goldRatePerGram || product.silverRatePerGram)?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {product.hallmarked && (
                    <div className='col-span-2'>
                      <span className='text-[#4F3A2E]/70 block mb-1'>Hallmark</span>
                      <span className='font-semibold text-[#1F3B29]'>
                        {product.bis_hallmark ? 'BIS Hallmarked' : 'Hallmarked'}
                      </span>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Diamond Details - Only show if there are actual diamond details */}
            {((product.hasDiamond || product.diamonds) && 
              (product.diamonds?.some(d => d.diamondType || d.diamondShape || d.diamondClarity || d.diamondColor || d.diamondCut || d.diamondCaratWeight || d.numberOfDiamonds || d.certification) || 
              product.diamondCarat || product.numberOfStones || product.diamondShape || product.stoneClarity || product.stoneColor || product.diamondCut)) && (
              <CollapsibleSection title='Diamond Details' icon={Gem}>
                {product.diamonds && product.diamonds.length > 0 ? (
                  <div className='space-y-4'>
                    {product.diamonds.map((diamond, index) => (
                      <div key={diamond.id || index} className='p-3 bg-[#FAF7F4] rounded-lg border border-[#E6D3C2]/50'>
                        <h4 className='text-xs font-semibold text-[#1F3B29] mb-3 uppercase'>
                          Diamond #{index + 1}
                        </h4>
                        <div className='grid grid-cols-2 gap-3 text-sm'>
                          {diamond.diamondType && (
                            <div>
                              <span className='text-[#4F3A2E]/70 block mb-1'>Type</span>
                              <span className='font-semibold text-[#1F3B29]'>{diamond.diamondType}</span>
                            </div>
                          )}
                          {diamond.diamondShape && (
                            <div>
                              <span className='text-[#4F3A2E]/70 block mb-1'>Shape</span>
                              <span className='font-semibold text-[#1F3B29]'>{diamond.diamondShape}</span>
                            </div>
                          )}
                          {diamond.diamondCaratWeight && (
                            <div>
                              <span className='text-[#4F3A2E]/70 block mb-1'>Carat Weight</span>
                              <span className='font-semibold text-[#1F3B29]'>{diamond.diamondCaratWeight}ct</span>
                            </div>
                          )}
                          {diamond.diamondClarity && (
                            <div>
                              <span className='text-[#4F3A2E]/70 block mb-1'>Clarity</span>
                              <span className='font-semibold text-[#1F3B29]'>{diamond.diamondClarity}</span>
                            </div>
                          )}
                          {diamond.diamondColor && (
                            <div>
                              <span className='text-[#4F3A2E]/70 block mb-1'>Color</span>
                              <span className='font-semibold text-[#1F3B29]'>{diamond.diamondColor}</span>
                            </div>
                          )}
                          {diamond.diamondCut && (
                            <div>
                              <span className='text-[#4F3A2E]/70 block mb-1'>Cut</span>
                              <span className='font-semibold text-[#1F3B29]'>{diamond.diamondCut}</span>
                            </div>
                          )}
                          {diamond.numberOfDiamonds && (
                            <div>
                              <span className='text-[#4F3A2E]/70 block mb-1'>Number of Stones</span>
                              <span className='font-semibold text-[#1F3B29]'>{diamond.numberOfDiamonds}</span>
                            </div>
                          )}
                          {diamond.certification && (
                            <div>
                              <span className='text-[#4F3A2E]/70 block mb-1'>Certification</span>
                              <span className='font-semibold text-[#1F3B29]'>{diamond.certification}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    {product.diamondCarat && (
                      <div>
                        <span className='text-[#4F3A2E]/70 block mb-1'>Carat Weight</span>
                        <span className='font-semibold text-[#1F3B29]'>{product.diamondCarat}ct</span>
                      </div>
                    )}
                    {product.numberOfStones && (
                      <div>
                        <span className='text-[#4F3A2E]/70 block mb-1'>Number of Stones</span>
                        <span className='font-semibold text-[#1F3B29]'>{product.numberOfStones}</span>
                      </div>
                    )}
                    {product.diamondShape && (
                      <div>
                        <span className='text-[#4F3A2E]/70 block mb-1'>Shape</span>
                        <span className='font-semibold text-[#1F3B29]'>{product.diamondShape}</span>
                      </div>
                    )}
                    {product.stoneClarity && (
                      <div>
                        <span className='text-[#4F3A2E]/70 block mb-1'>Clarity</span>
                        <span className='font-semibold text-[#1F3B29]'>{product.stoneClarity}</span>
                      </div>
                    )}
                    {product.stoneColor && (
                      <div>
                        <span className='text-[#4F3A2E]/70 block mb-1'>Color</span>
                        <span className='font-semibold text-[#1F3B29]'>{product.stoneColor}</span>
                      </div>
                    )}
                    {product.diamondCut && (
                      <div>
                        <span className='text-[#4F3A2E]/70 block mb-1'>Cut</span>
                        <span className='font-semibold text-[#1F3B29]'>{product.diamondCut}</span>
                      </div>
                    )}
                  </div>
                )}
              </CollapsibleSection>
            )}

            {/* Other Material Details */}
            {(product.gemstoneName || product.brand || product.gender || product.certificationNumber) && (
              <CollapsibleSection title='Other Material Details' icon={Sparkles}>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  {product.gemstoneName && (
                    <div>
                      <span className='text-[#4F3A2E]/70 block mb-1'>Gemstone</span>
                      <span className='font-semibold text-[#1F3B29]'>{product.gemstoneName}</span>
                    </div>
                  )}
                  {product.brand && (
                    <div>
                      <span className='text-[#4F3A2E]/70 block mb-1'>Brand</span>
                      <span className='font-semibold text-[#1F3B29]'>{product.brand}</span>
                    </div>
                  )}
                  {product.gender && (
                    <div>
                      <span className='text-[#4F3A2E]/70 block mb-1'>Gender</span>
                      <span className='font-semibold text-[#1F3B29]'>{product.gender}</span>
                    </div>
                  )}
                  {product.certificationNumber && (
                    <div className='col-span-2'>
                      <span className='text-[#4F3A2E]/70 block mb-1'>Certification Number</span>
                      <span className='font-semibold text-[#1F3B29]'>{product.certificationNumber}</span>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}
          </div>
        </div>
      </div>

      {/* Related Products - Compact */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className='mt-12 pt-8 border-t border-[#E6D3C2]/50'>
          <h2 className='text-2xl font-bold text-[#1F3B29] mb-6'>You May Also Like</h2>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
            {product.relatedProducts.slice(0, 4).map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
