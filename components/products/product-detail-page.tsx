'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Heart, Star, Share2, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { featuredProducts, trendingPro } from '@/app/utils/dummyData';
import { ProductCardData } from '@/components/home/common/product-card';
import { ProductCard } from '@/components/home/common/product-card';

// Combine products with unique IDs
const allProducts: ProductCardData[] = [
  ...featuredProducts.map(p => ({ ...p, id: `featured-${p.id}` })),
  ...trendingPro.map(p => ({ ...p, id: `trending-${p.id}` })),
];

export function ProductDetailPage({ productId }: { productId: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductCardData | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find product by exact ID match (supports both "1" and "featured-1" formats)
    const foundProduct = allProducts.find(
      p => p.id.toString() === productId || 
           p.id.toString().endsWith(`-${productId}`) ||
           p.id.toString() === `featured-${productId}` ||
           p.id.toString() === `trending-${productId}`
    );
    setProduct(foundProduct || null);
    setLoading(false);
  }, [productId]);

  if (loading) {
    return (
      <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-12 text-center'>
        <div className='text-[#4F3A2E]'>Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-12 text-center'>
        <h1 className='text-2xl font-bold text-[#1F3B29] mb-4'>Product Not Found</h1>
        <button
          onClick={() => router.push('/products')}
          className='inline-flex items-center gap-2 rounded-full bg-[#1F3B29] px-6 py-3 text-white font-semibold'>
          <ArrowLeft size={18} />
          Back to Products
        </button>
      </div>
    );
  }

  const images = [product.image, product.image, product.image]; // Using same image for demo
  const relatedProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

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
              alt={product.title}
              fill
              sizes='(max-width: 1024px) 100vw, 50vw'
              className='object-cover'
            />
            {product.badge && (
              <span className='absolute left-4 top-4 rounded-full bg-[#C8A15B] px-4 py-2 text-sm font-semibold text-white'>
                {product.badge}
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
                <Image src={img} alt={`${product.title} ${index + 1}`} fill sizes='25vw' className='object-cover' />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <p className='text-sm uppercase tracking-[0.3em] text-[#3F5C45] mb-2'>{product.category}</p>
          <h1 className='text-3xl sm:text-4xl font-bold text-[#1F3B29] mb-4'>{product.title}</h1>

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
              <span className='text-lg font-semibold text-[#1F3B29]'>{product.rating.toFixed(1)}</span>
              <span className='text-sm text-[#4F3A2E]'>({product.reviews} reviews)</span>
            </div>
          </div>

          <div className='mb-6'>
            <div className='flex items-center gap-4 mb-2'>
              <span className='text-3xl sm:text-4xl font-bold text-[#1F3B29]'>
                ${product.price.startsWith('$') ? product.price.slice(1) : product.price}
              </span>
              {product.originalPrice && (
                <span className='text-xl text-[#4F3A2E] line-through'>
                  ${product.originalPrice.startsWith('$') ? product.originalPrice.slice(1) : product.originalPrice}
                </span>
              )}
            </div>
          </div>

          <div className='mb-8'>
            <p className='text-base text-[#4F3A2E] leading-relaxed mb-4'>
              Experience the elegance and sophistication of this exquisite piece. Crafted with precision and attention
              to detail, this {product.category.toLowerCase()} is perfect for any occasion. Made with premium materials
              and designed to last a lifetime.
            </p>
            
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

