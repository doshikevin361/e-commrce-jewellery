import React, { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';

const ElegantProductCard = ({ product }: any) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className='w-80 bg-white rounded-none border-2 border-[#001e38] overflow-hidden hover:border-amber-700 transition-all duration-300 shadow-md hover:shadow-2xl'>
      <div className='relative group'>
        {/* Top decorative line */}
        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#001e38] via-[#001e38] to-[#001e38]'></div>

        {/* Product Image */}
        <img src={product.images[currentImage]} alt={product.name} className='w-full h-80 object-cover' />

        {/* Hover overlay */}
        <div
          className='absolute inset-0 cursor-pointer bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300'
          onMouseEnter={() => setCurrentImage(1)}
          onMouseLeave={() => setCurrentImage(0)}
        />

        {/* Discount badge and wishlist button */}
        <div className='absolute top-4 left-4 right-4 flex justify-between items-start'>
          <span className='bg-white text-[#001e38] px-4 py-1.5 text-xs font-bold tracking-wider'>{product.discount}</span>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className='w-10 h-10 bg-white border-2 border-[#001e38] flex items-center justify-center hover:bg-amber-50 transition-colors'>
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#001e38] text-[#001e38]' : 'text-[#001e38]'}`} />
          </button>
        </div>
      </div>

      {/* Product details */}
      <div className='p-6 border-t-2 border-[#001e38]'>
        <h3 className='font-serif text-xl mb-3 text-gray-800'>{product.name}</h3>

        {/* Rating */}
        <div className='flex items-center gap-2 mb-4'>
          <div className='flex items-center gap-1'>
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${star <= Math.floor(product.rating) ? 'fill-[#001e38] text-[#001e38]' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className='text-sm text-gray-500'>({product.reviews} reviews)</span>
        </div>

        {/* Price and Add to Cart */}
        <div className='flex items-end justify-between'>
          <div>
            <div className='text-sm text-gray-500 mb-1'>Price</div>
            <div className='flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-amber-700'>{product.price}</span>
              <span className='text-gray-400 line-through text-sm'>{product.originalPrice}</span>
            </div>
          </div>
          <button className='bg-[#001e38] text-white px-5 py-2.5 font-semibold hover:bg-[#001e38] transition-colors flex items-center gap-2'>
            <ShoppingCart className='w-4 h-4' />
            ADD
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElegantProductCard;
