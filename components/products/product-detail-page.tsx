'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Heart, Star, Share2, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { ProductCardData } from '@/components/home/common/product-card';
import { ProductCard } from '@/components/home/common/product-card';

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
  // Jewelry specific
  metalType?: string;
  metalPurity?: string;
  metalWeight?: number;
  stoneType?: string;
  stoneWeight?: number;
  makingCharges?: number;
  certification?: string;
  occasion?: string;
  gender?: string;
  size?: string;
  livePriceEnabled?: boolean;
}

export function ProductDetailPage({ productId }: { productId: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-12 text-center'>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className='text-gray-600'>Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-12 text-center'>
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>
          {error || 'Product Not Found'}
        </h1>
        <p className="text-gray-600 mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => router.push('/products')}
          className='inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors'>
          <ArrowLeft size={18} />
          Back to Products
        </button>
      </div>
    );
  }

  // Use gallery images if available, otherwise use main image
  const images = product.galleryImages && product.galleryImages.length > 0 
    ? [product.mainImage, ...product.galleryImages] 
    : [product.mainImage, product.mainImage, product.mainImage];
  
  const relatedProducts = product.relatedProducts || [];

  return (
    <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className='mb-6 flex items-center gap-2 text-sm text-[#4F3A2E] hover:text-[#1F3B29] transition-colors'>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-12'>
        {/* Images */}
        <div>
          <div className='relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F5EEE5] mb-4'>
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              sizes='(max-width: 1024px) 100vw, 50vw'
              className='object-cover'
            />
            {(product.featured || product.trending) && (
              <span className='absolute left-4 top-4 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white'>
                {product.featured ? 'Featured' : 'Trending'}
              </span>
            )}
          </div>
          <div className='grid grid-cols-4 gap-3'>
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                  selectedImage === index ? 'border-[#C8A15B]' : 'border-[#E6D3C2]'
                }`}>
                <Image src={img} alt={`${product.name} ${index + 1}`} fill sizes='25vw' className='object-cover' />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <p className='text-sm uppercase tracking-[0.3em] text-gray-600 mb-2'>{product.category}</p>
          <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>{product.name}</h1>

          <div className='flex items-center gap-4 mb-6'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(product.rating) ? 'text-[#C8A15B] fill-[#C8A15B]' : 'text-[#E6D3C2]'}
                  />
                ))}
              </div>
              <span className='text-lg font-semibold text-gray-900'>{(product.rating || 4.5).toFixed(1)}</span>
              <span className='text-sm text-gray-600'>({product.reviewCount || 0} reviews)</span>
            </div>
          </div>

          <div className='mb-6'>
            <div className='flex items-center gap-4 mb-2'>
              <span className='text-3xl sm:text-4xl font-bold text-gray-900'>
                ₹{product.displayPrice.toLocaleString()}
              </span>
              {product.hasDiscount && (
                <span className='text-xl text-gray-500 line-through'>
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
              {product.hasDiscount && (
                <span className='text-sm bg-green-100 text-green-800 px-2 py-1 rounded'>
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          <div className='mb-8'>
            <p className='text-base text-gray-600 leading-relaxed mb-4'>
              {product.shortDescription || `Experience the elegance and sophistication of this exquisite ${product.category.toLowerCase()}. Crafted with precision and attention to detail, perfect for any occasion.`}
            </p>
            
            {/* Jewelry Details */}
            {(product.metalType || product.metalPurity || product.metalWeight) && (
              <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                <h3 className='font-semibold text-gray-900 mb-2'>Jewelry Details</h3>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  {product.metalType && (
                    <div><span className='text-gray-600'>Metal:</span> <span className='font-medium'>{product.metalType}</span></div>
                  )}
                  {product.metalPurity && (
                    <div><span className='text-gray-600'>Purity:</span> <span className='font-medium'>{product.metalPurity}</span></div>
                  )}
                  {product.metalWeight && (
                    <div><span className='text-gray-600'>Weight:</span> <span className='font-medium'>{product.metalWeight}g</span></div>
                  )}
                  {product.stoneType && (
                    <div><span className='text-gray-600'>Stone:</span> <span className='font-medium'>{product.stoneType}</span></div>
                  )}
                  {product.certification && (
                    <div><span className='text-gray-600'>Certified:</span> <span className='font-medium'>{product.certification}</span></div>
                  )}
                  {product.occasion && (
                    <div><span className='text-gray-600'>Occasion:</span> <span className='font-medium'>{product.occasion}</span></div>
                  )}
                </div>
              </div>
            )}
            
            {/* Product Details */}
            <div className='grid grid-cols-2 gap-4 p-4 bg-[#F5EEE5] rounded-xl'>
              <div>
                <p className='text-xs text-[#4F3A2E] mb-1'>Material</p>
                <p className='text-sm font-semibold text-[#1F3B29]'>{product.material || 'Gold'}</p>
              </div>
              <div>
                <p className='text-xs text-[#4F3A2E] mb-1'>Brand</p>
                <p className='text-sm font-semibold text-[#1F3B29]'>{product.brand || 'LuxeLoom'}</p>
              </div>
              {product.color && (
                <div>
                  <p className='text-xs text-[#4F3A2E] mb-1'>Color</p>
                  <p className='text-sm font-semibold text-[#1F3B29]'>{product.color}</p>
                </div>
              )}
              {product.size && (
                <div>
                  <p className='text-xs text-[#4F3A2E] mb-1'>Size</p>
                  <p className='text-sm font-semibold text-[#1F3B29]'>{product.size}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className='mb-6'>
            <label className='block text-sm font-semibold text-[#1F3B29] mb-2'>Quantity</label>
            <div className='flex items-center gap-4'>
              <div className='flex items-center border border-[#E6D3C2] rounded-lg'>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className='p-2 hover:bg-[#F5EEE5] transition-colors'>
                  <Minus size={18} />
                </button>
                <span className='px-4 py-2 text-[#1F3B29] font-semibold'>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className='p-2 hover:bg-[#F5EEE5] transition-colors'>
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 mb-8'>
            <Link
              href='/cart'
              className='flex-1 flex items-center justify-center gap-2 rounded-full bg-[#1F3B29] px-6 py-4 text-white font-semibold hover:bg-[#2a4d3a] transition-colors'>
              <ShoppingCart size={20} />
              Add to Cart
            </Link>
            <Link
              href='/wishlist'
              className='flex items-center justify-center gap-2 rounded-full border-2 border-[#1F3B29] px-6 py-4 text-[#1F3B29] font-semibold hover:bg-[#F5EEE5] transition-colors'>
              <Heart size={20} />
            </Link>
            <button className='flex items-center justify-center gap-2 rounded-full border-2 border-[#1F3B29] px-6 py-4 text-[#1F3B29] font-semibold hover:bg-[#F5EEE5] transition-colors'>
              <Share2 size={20} />
            </button>
          </div>

          {/* Features */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-[#F5EEE5] rounded-xl'>
            <div className='flex items-center gap-3'>
              <Truck size={24} className='text-[#C8A15B]' />
              <div>
                <p className='text-sm font-semibold text-[#1F3B29]'>Free Shipping</p>
                <p className='text-xs text-[#4F3A2E]'>On orders over $100</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Shield size={24} className='text-[#C8A15B]' />
              <div>
                <p className='text-sm font-semibold text-[#1F3B29]'>Secure Payment</p>
                <p className='text-xs text-[#4F3A2E]'>100% protected</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <RotateCcw size={24} className='text-[#C8A15B]' />
              <div>
                <p className='text-sm font-semibold text-[#1F3B29]'>Easy Returns</p>
                <p className='text-xs text-[#4F3A2E]'>30-day policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className='mb-12 border-b border-[#E6D3C2]'>
        <div className='flex gap-6'>
          {['Description', 'Specifications', 'Care Instructions', 'Reviews'].map((tab, index) => (
            <button
              key={tab}
              className={`pb-4 px-2 text-sm font-semibold border-b-2 transition-colors ${
                index === 0
                  ? 'border-[#C8A15B] text-[#1F3B29]'
                  : 'border-transparent text-[#4F3A2E] hover:text-[#1F3B29]'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className='mb-12'>
        <h3 className='text-xl font-bold text-[#1F3B29] mb-4'>Description</h3>
        <div className='text-[#4F3A2E] space-y-3'>
          <p>
            This stunning {product.category.toLowerCase()} features exquisite craftsmanship and premium materials. 
            Perfect for special occasions or everyday elegance, this piece is designed to be treasured for generations.
          </p>
          <p>
            Each piece is carefully inspected to ensure the highest quality standards. We stand behind our craftsmanship 
            with a comprehensive warranty and excellent customer service.
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className='mb-12'>
        <h3 className='text-xl font-bold text-[#1F3B29] mb-6'>Customer Reviews</h3>
        <div className='space-y-6'>
          {[
            { name: 'Sarah Johnson', rating: 5, date: '2 days ago', comment: 'Absolutely beautiful! The quality exceeded my expectations.' },
            { name: 'Emily Chen', rating: 5, date: '1 week ago', comment: 'Perfect gift for my anniversary. She loved it!' },
            { name: 'Michael Rodriguez', rating: 4, date: '2 weeks ago', comment: 'Great quality and fast shipping. Highly recommend!' },
          ].map((review, i) => (
            <div key={i} className='bg-[#F5EEE5] rounded-xl p-5 border border-[#E6D3C2]'>
              <div className='flex items-center justify-between mb-3'>
                <div>
                  <p className='font-semibold text-[#1F3B29]'>{review.name}</p>
                  <div className='flex items-center gap-1 mt-1'>
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        size={14}
                        className={j < review.rating ? 'text-[#C8A15B] fill-[#C8A15B]' : 'text-[#E6D3C2]'}
                      />
                    ))}
                  </div>
                </div>
                <span className='text-xs text-[#4F3A2E]'>{review.date}</span>
              </div>
              <p className='text-sm text-[#4F3A2E]'>{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className='mt-16'>
          <h2 className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-8'>Related Products</h2>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

