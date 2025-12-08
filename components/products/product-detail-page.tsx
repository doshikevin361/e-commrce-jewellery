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
} from 'lucide-react';
import { ProductCardData } from '@/components/home/common/product-card';
import { ProductCard } from '@/components/home/common/product-card';
import { PageLoader } from '@/components/common/page-loader';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Dynamic product interface
interface ProductDetail {
  _id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
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

export function ProductDetailPage({ productId }: { productId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/products/${productId}`);

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

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

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
    if (isLoggedIn && productId) {
      checkWishlistStatus();
    }
  }, [isLoggedIn, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('/api/customer/wishlist');
      if (response.ok) {
        const data = await response.json();
        const productIds = data.products?.map((p: any) => (p._id || p.id).toString()) || [];
        setIsInWishlist(productIds.includes(productId));
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      router.push('/?login=true');
      return;
    }

    try {
      setWishlistLoading(true);
      
      if (isInWishlist) {
        const response = await fetch(`/api/customer/wishlist?productId=${productId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setIsInWishlist(false);
          toast({
            title: 'Removed',
            description: 'Product removed from wishlist',
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
            title: 'Added',
            description: 'Product added to wishlist',
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
            <Sparkles className='w-16 h-16 text-[#C8A15B] mx-auto mb-4' />
          </div>
          <h1 className='text-3xl font-bold text-[#1F3B29] mb-4'>{error || 'Product Not Found'}</h1>
          <p className='text-[#4F3A2E] mb-8 text-lg'>The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/products')}
            className='inline-flex items-center gap-2 rounded-full bg-[#1F3B29] px-8 py-4 text-white font-semibold hover:bg-[#2a4d3a] transition-all shadow-lg hover:shadow-xl'>
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

  return (
    <div className='mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12'>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className='mb-10 flex items-center gap-2 text-sm font-medium text-[#4F3A2E] hover:text-[#1F3B29] transition-colors group'>
        <ArrowLeft size={18} className='group-hover:-translate-x-1 transition-transform' />
        <span>Back to Products</span>
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 mb-12 sm:mb-16'>
        {/* Images */}
        <div className='lg:sticky lg:top-36 lg:self-start lg:h-fit'>
          <div 
            className='relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#F5EEE5] to-[#E6D3C2] mb-4 shadow-lg group cursor-zoom-in'
            onMouseEnter={() => setZoomImage(images[selectedImage])}
            onMouseLeave={() => {
              setZoomImage(null);
              setZoomPosition({ x: 50, y: 50 });
            }}
            onMouseMove={handleImageMouseMove}
          >
            <div className='relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[3/2] overflow-hidden'>
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                sizes='(max-width: 1024px) 100vw, 50vw'
                className='object-cover transition-transform duration-300 ease-out'
                style={{
                  transform: zoomImage ? `scale(2.5) translate(${-zoomPosition.x * 0.5}%, ${-zoomPosition.y * 0.5}%)` : 'scale(1)',
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
                priority
              />
            </div>
            {(product.featured || product.trending) && (
              <span className='absolute left-4 top-4 sm:left-6 sm:top-6 rounded-full bg-gradient-to-r from-[#C8A15B] to-[#B8914F] px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm'>
                {product.featured ? '✨ Featured' : '🔥 Trending'}
              </span>
            )}
            {product.hasDiscount && (
              <span className='absolute right-4 top-4 sm:right-6 sm:top-6 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold text-white shadow-lg'>
                {product.discountPercent}% OFF
              </span>
            )}
          </div>
          <div className='grid grid-cols-4 gap-3 sm:gap-4'>
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  selectedImage === index
                    ? 'border-[#C8A15B] ring-2 ring-[#C8A15B] ring-offset-2 shadow-md'
                    : 'border-[#E6D3C2] hover:border-[#C8A15B]/50'
                }`}>
                <Image src={img} alt={`${product.name} ${index + 1}`} fill sizes='20vw' className='object-cover' />
              </button>
            ))}
          </div>
          
          {/* Specifications Section - Below Images */}
          {product.specifications && product.specifications.length > 0 && (
            <div className='mt-6 p-4 sm:p-6 bg-gradient-to-br from-[#F5EEE5] to-[#E6D3C2] rounded-2xl shadow-md'>
              <h3 className='text-lg sm:text-xl font-bold text-[#1F3B29] mb-4'>Specifications</h3>
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm'>
                  <thead>
                    <tr className='bg-gradient-to-r from-[#1F3B29] to-[#2a4d3a]'>
                      <th className='px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider'>
                        Specification
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider'>
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.specifications.map((spec, index) => (
                      <tr 
                        key={index}
                        className={`border-b border-[#E6D3C2] transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-[#faf8f5]'
                        } hover:bg-[#F5EEE5]`}
                      >
                        <td className='px-4 py-3 text-sm font-medium text-[#1F3B29]'>
                          {spec.key}
                        </td>
                        <td className='px-4 py-3 text-sm text-[#4F3A2E]'>
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className='space-y-6'>
          <div>
            <p className='text-xs uppercase tracking-[0.3em] text-[#4F3A2E] mb-3 font-medium'>{product.category}</p>
            <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F3B29] mb-4 sm:mb-6 leading-tight'>{product.name}</h1>

            <div className='flex items-center gap-4 mb-6'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating || 4.5) ? 'text-[#C8A15B] fill-[#C8A15B]' : 'text-[#E6D3C2]'}
                    />
                  ))}
                </div>
                <span className='text-lg font-bold text-[#1F3B29]'>{(product.rating || 4.5).toFixed(1)}</span>
                <span className='text-sm text-[#4F3A2E]'>({product.reviewCount || 0} reviews)</span>
              </div>
            </div>
          </div>

          <div className='pb-6 border-b border-[#E6D3C2]'>
            <div className='flex items-baseline gap-2 sm:gap-3 md:gap-4 flex-wrap'>
              <span className='text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F3B29]'>₹{product.displayPrice.toLocaleString()}</span>
              {product.hasDiscount && (
                <>
                  <span className='text-xl sm:text-2xl text-[#4F3A2E] line-through opacity-60'>₹{product.originalPrice.toLocaleString()}</span>
                  <span className='text-xs sm:text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md'>
                    Save {product.discountPercent}%
                  </span>
                </>
              )}
            </div>
            {product.stock > 0 ? (
              <div className='flex items-center gap-2 mt-4'>
                <Check className='w-5 h-5 text-green-600' />
                <span className='text-sm font-medium text-green-700'>In Stock ({product.stock} available)</span>
              </div>
            ) : (
              <div className='flex items-center gap-2 mt-4'>
                <span className='text-sm font-medium text-red-600'>Out of Stock</span>
              </div>
            )}
          </div>

          <div className='space-y-6'>
            <div>
              <p className='text-base text-[#4F3A2E] leading-relaxed'>
                {product.shortDescription ||
                  `Experience the elegance and sophistication of this exquisite ${product.category.toLowerCase()}. Crafted with precision and attention to detail, perfect for any occasion.`}
              </p>
            </div>

            <div>
              <label className='block text-sm font-bold text-[#1F3B29] mb-3'>Quantity</label>
              <div className='flex items-center gap-4'>
                <div className='flex items-center border-2 border-[#E6D3C2] rounded-xl overflow-hidden bg-white'>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className='p-3 hover:bg-[#F5EEE5] transition-colors text-[#1F3B29]'>
                    <Minus size={18} />
                  </button>
                  <span className='px-6 py-3 text-[#1F3B29] font-bold text-lg min-w-[60px] text-center'>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className='p-3 hover:bg-[#F5EEE5] transition-colors text-[#1F3B29]'>
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-4'>
              <Link
                href='/cart'
                className='flex-1 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#1F3B29] to-[#2a4d3a] px-8 py-4 text-white font-bold text-lg hover:shadow-xl transition-all hover:scale-[1.02]'>
                <ShoppingCart size={22} />
                Add to Cart
              </Link>
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-4 font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
                  isInWishlist
                    ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-[#1F3B29] text-[#1F3B29] hover:bg-[#F5EEE5]'
                )}>
                <Heart size={22} className={isInWishlist ? 'fill-red-500' : ''} />
              </button>
              <button className='flex items-center justify-center gap-2 rounded-xl border-2 border-[#1F3B29] px-6 py-4 text-[#1F3B29] font-semibold hover:bg-[#F5EEE5] transition-all hover:scale-105'>
                <Share2 size={22} />
              </button>
            </div>

            {/* Comprehensive Jewelry Details */}
            {(product.hasGold || product.hasSilver || product.hasDiamond || product.jewelryType) && (
              <div className='bg-gradient-to-br from-[#F5EEE5] to-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#E6D3C2] shadow-sm'>
                <h3 className='text-lg sm:text-xl font-bold text-[#1F3B29] mb-4 sm:mb-6 flex items-center gap-2'>
                  <Sparkles className='w-4 h-4 sm:w-5 sm:h-5 text-[#C8A15B]' />
                  Jewelry Specifications
                </h3>
                <div className='space-y-4 sm:space-y-5'>
                  {/* Jewelry Type */}
                  {(product.jewelryType || product.jewelrySubType) && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-[#E6D3C2]'>
                      {product.jewelryType && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Jewelry Type</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.jewelryType}</p>
                        </div>
                      )}
                      {product.jewelrySubType && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Sub-Type</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.jewelrySubType}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Material Details */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-[#E6D3C2]'>
                    {product.hasGold && (
                      <>
                        {product.goldWeight && (
                          <div>
                            <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Gold Weight</span>
                            <p className='font-semibold text-[#1F3B29] text-lg'>{product.goldWeight}g</p>
                          </div>
                        )}
                        {product.goldPurity && (
                          <div>
                            <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Gold Purity</span>
                            <p className='font-semibold text-[#1F3B29] text-lg'>{product.goldPurity}</p>
                          </div>
                        )}
                      </>
                    )}
                    {product.hasSilver && (
                      <>
                        {product.silverWeight && (
                          <div>
                            <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Silver Weight</span>
                            <p className='font-semibold text-[#1F3B29] text-lg'>{product.silverWeight}g</p>
                          </div>
                        )}
                        {product.silverPurity && (
                          <div>
                            <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Silver Purity</span>
                            <p className='font-semibold text-[#1F3B29] text-lg'>{product.silverPurity}</p>
                          </div>
                        )}
                      </>
                    )}
                    {product.hasDiamond && (
                      <>
                        {product.diamondCarat && (
                          <div>
                            <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Diamond Carat</span>
                            <p className='font-semibold text-[#1F3B29] text-lg'>{product.diamondCarat}ct</p>
                          </div>
                        )}
                        {product.numberOfStones && (
                          <div>
                            <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Number of Stones</span>
                            <p className='font-semibold text-[#1F3B29] text-lg'>{product.numberOfStones}</p>
                          </div>
                        )}
                        {product.diamondCut && (
                          <div>
                            <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Diamond Cut</span>
                            <p className='font-semibold text-[#1F3B29] text-lg'>{product.diamondCut}</p>
                          </div>
                        )}
                        {product.diamondShape && (
                          <div>
                            <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Diamond Shape</span>
                            <p className='font-semibold text-[#1F3B29] text-lg'>{product.diamondShape}</p>
                          </div>
                        )}
                        {product.stoneClarity && (
                          <div>
                            <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Clarity</span>
                            <p className='font-semibold text-[#1F3B29] text-lg'>{product.stoneClarity}</p>
                          </div>
                        )}
                        {product.stoneColor && (
                          <div>
                            <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Color</span>
                            <p className='font-semibold text-[#1F3B29] text-lg'>{product.stoneColor}</p>
                          </div>
                        )}
                      </>
                    )}
                    {product.totalWeight && (
                      <div>
                        <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Total Weight</span>
                        <p className='font-semibold text-[#1F3B29] text-lg'>{product.totalWeight}g</p>
                      </div>
                    )}
                  </div>

                  {/* Ring Specific */}
                  {product.jewelryType === 'Ring' && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-[#E6D3C2]'>
                      {product.ringSetting && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Setting</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.ringSetting}</p>
                        </div>
                      )}
                      {product.ringSize && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Ring Size</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>
                            {product.ringSize} {product.ringSizeSystem && `(${product.ringSizeSystem})`}
                          </p>
                        </div>
                      )}
                      {product.ringWidth && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Band Width</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.ringWidth}mm</p>
                        </div>
                      )}
                      {product.ringStyle && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Style</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.ringStyle}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chain/Necklace Specific */}
                  {(product.jewelryType === 'Necklace' || product.jewelryType === 'Chain') && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-[#E6D3C2]'>
                      {product.chainType && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Chain Type</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.chainType}</p>
                        </div>
                      )}
                      {product.chainLength && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Length</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>
                            {product.chainLength} {product.chainLengthUnit || 'inches'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Earring Specific */}
                  {product.jewelryType === 'Earrings' && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-[#E6D3C2]'>
                      {product.earringType && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Earring Type</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.earringType}</p>
                        </div>
                      )}
                      {product.earringBackType && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Back Type</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.earringBackType}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bracelet Specific */}
                  {product.jewelryType === 'Bracelet' && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-[#E6D3C2]'>
                      {product.braceletType && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Bracelet Type</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.braceletType}</p>
                        </div>
                      )}
                      {product.braceletLength && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Length</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>
                            {product.braceletLength} {product.braceletLengthUnit || 'inches'}
                          </p>
                        </div>
                      )}
                      {product.braceletWidth && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Width</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.braceletWidth}mm</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Design & Style */}
                  {(product.designStyle || product.finishType || product.pattern) && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-[#E6D3C2]'>
                      {product.designStyle && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Design Style</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.designStyle}</p>
                        </div>
                      )}
                      {product.finishType && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Finish</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.finishType}</p>
                        </div>
                      )}
                      {product.pattern && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Pattern</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.pattern}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stone Setting */}
                  {product.hasDiamond && (product.stoneSetting || product.stoneArrangement) && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-[#E6D3C2]'>
                      {product.stoneSetting && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Stone Setting</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.stoneSetting}</p>
                        </div>
                      )}
                      {product.stoneArrangement && (
                        <div>
                          <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Arrangement</span>
                          <p className='font-semibold text-[#1F3B29] text-lg'>{product.stoneArrangement}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Other Details */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                    {product.gender && (
                      <div>
                        <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Gender</span>
                        <p className='font-semibold text-[#1F3B29] text-lg'>{product.gender}</p>
                      </div>
                    )}
                    {product.certification && (
                      <div>
                        <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Certification</span>
                        <p className='font-semibold text-[#1F3B29] text-lg'>
                          {product.certification} {product.certificationNumber && `(${product.certificationNumber})`}
                        </p>
                      </div>
                    )}
                    {product.hallmarked && (
                      <div>
                        <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Hallmarked</span>
                        <p className='font-semibold text-[#1F3B29] text-lg'>
                          Yes {product.hallmarkNumber && `(${product.hallmarkNumber})`}
                        </p>
                      </div>
                    )}
                    {product.bis_hallmark && (
                      <div>
                        <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>BIS Hallmark</span>
                        <p className='font-semibold text-[#1F3B29] text-lg'>Yes</p>
                      </div>
                    )}
                    {product.customizable && (
                      <div>
                        <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Customizable</span>
                        <p className='font-semibold text-[#1F3B29] text-lg'>Yes</p>
                      </div>
                    )}
                    {product.engraving_available && (
                      <div>
                        <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Engraving</span>
                        <p className='font-semibold text-[#1F3B29] text-lg'>
                          Available {product.engravingOptions && `(${product.engravingOptions})`}
                        </p>
                      </div>
                    )}
                    {product.resizing_available && (
                      <div>
                        <span className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium block mb-1'>Resizing</span>
                        <p className='font-semibold text-[#1F3B29] text-lg'>Available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Info Cards */}
            <div className='grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4'>
              <div className='bg-gradient-to-br from-[#F5EEE5] to-white p-4 rounded-xl border border-[#E6D3C2]'>
                <p className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium mb-2'>Material</p>
                <p className='text-base font-bold text-[#1F3B29]'>{product.material || 'Gold'}</p>
              </div>
              <div className='bg-gradient-to-br from-[#F5EEE5] to-white p-4 rounded-xl border border-[#E6D3C2]'>
                <p className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium mb-2'>Brand</p>
                <p className='text-base font-bold text-[#1F3B29]'>{product.brand || 'LuxeLoom'}</p>
              </div>
              {product.color && (
                <div className='bg-gradient-to-br from-[#F5EEE5] to-white p-4 rounded-xl border border-[#E6D3C2]'>
                  <p className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium mb-2'>Color</p>
                  <p className='text-base font-bold text-[#1F3B29]'>{product.color}</p>
                </div>
              )}
              {product.size && (
                <div className='bg-gradient-to-br from-[#F5EEE5] to-white p-4 rounded-xl border border-[#E6D3C2]'>
                  <p className='text-xs uppercase tracking-wide text-[#4F3A2E] font-medium mb-2'>Size</p>
                  <p className='text-base font-bold text-[#1F3B29]'>{product.size}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className='space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t border-[#E6D3C2]'>
            {/* Features */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6'>
              <div className='flex items-start gap-4 p-5 bg-gradient-to-br from-[#F5EEE5] to-white rounded-xl border border-[#E6D3C2] hover:shadow-md transition-shadow'>
                <div className='p-3 bg-[#C8A15B]/10 rounded-lg'>
                  <Truck size={24} className='text-[#C8A15B]' />
                </div>
                <div>
                  <p className='text-sm font-bold text-[#1F3B29] mb-1'>Free Shipping</p>
                  <p className='text-xs text-[#4F3A2E]'>On orders over ₹5,000</p>
                </div>
              </div>
              <div className='flex items-start gap-4 p-5 bg-gradient-to-br from-[#F5EEE5] to-white rounded-xl border border-[#E6D3C2] hover:shadow-md transition-shadow'>
                <div className='p-3 bg-[#C8A15B]/10 rounded-lg'>
                  <Shield size={24} className='text-[#C8A15B]' />
                </div>
                <div>
                  <p className='text-sm font-bold text-[#1F3B29] mb-1'>Secure Payment</p>
                  <p className='text-xs text-[#4F3A2E]'>100% protected</p>
                </div>
              </div>
              <div className='flex items-start gap-4 p-5 bg-gradient-to-br from-[#F5EEE5] to-white rounded-xl border border-[#E6D3C2] hover:shadow-md transition-shadow'>
                <div className='p-3 bg-[#C8A15B]/10 rounded-lg'>
                  <RotateCcw size={24} className='text-[#C8A15B]' />
                </div>
                <div>
                  <p className='text-sm font-bold text-[#1F3B29] mb-1'>Easy Returns</p>
                  <p className='text-xs text-[#4F3A2E]'>30-day policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className='mb-8 sm:mb-12 border-b-2 border-[#E6D3C2]'>
        <div className='flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide'>
          {['Description', 'Care Instructions', 'Reviews'].map(tab => {
            const tabId = tab.toLowerCase().replace(/\s+/g, '-');
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tabId)}
                className={`pb-3 sm:pb-5 px-2 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tabId
                    ? 'border-[#C8A15B] text-[#1F3B29]'
                    : 'border-transparent text-[#4F3A2E] hover:text-[#1F3B29] hover:border-[#E6D3C2]'
                }`}>
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className='mb-12 sm:mb-16'>
        {activeTab === 'description' && (
          <div className='max-w-4xl'>
            <h3 className='text-xl sm:text-2xl font-bold text-[#1F3B29] mb-4 sm:mb-6'>Product Description</h3>
            <div
              className='text-[#4F3A2E] space-y-4 prose prose-lg max-w-none leading-relaxed'
              dangerouslySetInnerHTML={{
                __html:
                  product.longDescription ||
                  `<p class="text-lg">This stunning ${product.category.toLowerCase()} features exquisite craftsmanship and premium materials. Perfect for special occasions or everyday elegance, this piece is designed to be treasured for generations.</p><p class="text-lg">Each piece is carefully inspected to ensure the highest quality standards. We stand behind our craftsmanship with a comprehensive warranty and excellent customer service.</p>`,
              }}
            />
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className='max-w-4xl'>
            <h3 className='text-2xl font-bold text-[#1F3B29] mb-6'>Technical Specifications</h3>
            <div className='bg-gradient-to-br from-[#F5EEE5] to-white p-8 rounded-2xl border border-[#E6D3C2]'>
              {product.hasGold || product.hasSilver || product.hasDiamond || product.jewelryType ? (
                <p className='text-[#4F3A2E]'>All specifications are displayed above in the product details section.</p>
              ) : (
                <p className='text-[#4F3A2E]'>No additional specifications available for this product.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'care-instructions' && (
          <div className='max-w-4xl'>
            <h3 className='text-xl sm:text-2xl font-bold text-[#1F3B29] mb-4 sm:mb-6'>Care Instructions</h3>
            <div className='bg-gradient-to-br from-[#F5EEE5] to-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-[#E6D3C2] space-y-3 sm:space-y-4'>
              <div className='space-y-3'>
                <h4 className='font-bold text-[#1F3B29] text-lg'>Cleaning</h4>
                <p className='text-[#4F3A2E]'>
                  Clean your jewelry regularly with a soft, lint-free cloth. For deeper cleaning, use a mild soap solution and a soft brush,
                  then rinse with warm water and pat dry.
                </p>
              </div>
              <div className='space-y-3'>
                <h4 className='font-bold text-[#1F3B29] text-lg'>Storage</h4>
                <p className='text-[#4F3A2E]'>
                  Store your jewelry in a cool, dry place away from direct sunlight. Keep pieces separate to prevent scratching. Use
                  individual pouches or compartments in a jewelry box.
                </p>
              </div>
              <div className='space-y-3'>
                <h4 className='font-bold text-[#1F3B29] text-lg'>Maintenance</h4>
                <p className='text-[#4F3A2E]'>
                  Avoid contact with harsh chemicals, perfumes, and lotions. Remove jewelry before swimming, showering, or engaging in
                  physical activities. Have your jewelry professionally inspected annually.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className='max-w-4xl'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
              <h3 className='text-xl sm:text-2xl font-bold text-[#1F3B29]'>Customer Reviews</h3>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating || 4.5) ? 'text-[#C8A15B] fill-[#C8A15B]' : 'text-[#E6D3C2]'}
                    />
                  ))}
                </div>
                <span className='text-lg font-bold text-[#1F3B29]'>{(product.rating || 4.5).toFixed(1)}</span>
                <span className='text-sm text-[#4F3A2E]'>({product.reviewCount || 0} reviews)</span>
              </div>
            </div>
            <div className='space-y-6'>
              {[
                {
                  name: 'Sarah Johnson',
                  rating: 5,
                  date: '2 days ago',
                  comment:
                    'Absolutely beautiful! The quality exceeded my expectations. The craftsmanship is impeccable and it arrived exactly as described. Highly recommend!',
                },
                {
                  name: 'Emily Chen',
                  rating: 5,
                  date: '1 week ago',
                  comment:
                    'Perfect gift for my anniversary. She loved it! The packaging was elegant and the piece itself is stunning. Will definitely shop here again.',
                },
                {
                  name: 'Michael Rodriguez',
                  rating: 4,
                  date: '2 weeks ago',
                  comment:
                    'Great quality and fast shipping. The jewelry looks exactly like the photos. Only minor issue was the sizing, but customer service was very helpful.',
                },
              ].map((review, i) => (
                <div
                  key={i}
                  className='bg-gradient-to-br from-white to-[#F5EEE5] rounded-2xl p-6 border border-[#E6D3C2] shadow-sm hover:shadow-md transition-shadow'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-[#C8A15B] to-[#B8914F] flex items-center justify-center text-white font-bold'>
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className='font-bold text-[#1F3B29]'>{review.name}</p>
                          <div className='flex items-center gap-1 mt-1'>
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} size={16} className={j < review.rating ? 'text-[#C8A15B] fill-[#C8A15B]' : 'text-[#E6D3C2]'} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className='text-xs text-[#4F3A2E] font-medium'>{review.date}</span>
                  </div>
                  <p className='text-[#4F3A2E] leading-relaxed'>{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className='mt-12 sm:mt-16 md:mt-20 pt-8 sm:pt-12 border-t-2 border-[#E6D3C2]'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 md:mb-10'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F3B29]'>Related Products</h2>
            <Link
              href='/products'
              className='flex items-center gap-2 text-[#1F3B29] font-semibold hover:text-[#C8A15B] transition-colors group'>
              <span className='text-sm sm:text-base'>View All</span>
              <ChevronRight size={16} className='sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform' />
            </Link>
          </div>
          <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8'>
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
