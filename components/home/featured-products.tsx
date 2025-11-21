'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollAnimation } from './use-scroll-animation';

export function FeaturedProducts() {
  const { ref, isVisible } = useScrollAnimation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      quote: 'Incredibly warm and lightweight -this jacket is perfect for chilly days and looks great too!',
      author: 'Cienna Leigh',
      location: 'California',
    },
    {
      quote: 'Amazing quality and comfort. Highly recommended!',
      author: 'John Doe',
      location: 'New York',
    },
  ];

  return (
    <section ref={ref} className='container mx-auto px-4 py-12'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Left Side - Product Card on Striped Background */}
        <div className={`relative transform transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}>
          {/* Striped Background */}
          <div className='absolute inset-0 bg-gradient-to-br from-yellow-200 via-yellow-100 to-white' style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #FEF3C7, #FEF3C7 10px, #FDE68A 10px, #FDE68A 20px)'
          }}></div>
          
          {/* Product Card */}
          <div className='relative bg-white rounded-lg shadow-lg p-6 mt-8 ml-8 group hover:shadow-xl transition-shadow duration-300'>
            <div className='aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden'>
              <img
                src='https://images.unsplash.com/photo-1556821840-3a63f95609a4?w=400'
                alt='Haven Hooded Puffer'
                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
              />
            </div>
            <p className='text-sm text-gray-500 mb-1'>Hoodies</p>
            <h3 className='text-lg font-semibold mb-1'>Haven Hooded Puffer</h3>
            <p className='text-xl font-bold text-gray-900 mb-4'>$100.00</p>
            <button className='w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 hover:scale-105 transition-all duration-300'>
              Choose Options
            </button>
          </div>
        </div>

        {/* Right Side - Testimonial Section */}
        <div className={`bg-[#EC4899] rounded-lg p-8 text-white relative overflow-hidden transform transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        }`}>
          <div className='relative z-10'>
            <h2 className='text-2xl font-bold mb-6'>Our Favorite Products</h2>
            
            <div className='mb-6'>
              <p className='text-2xl md:text-3xl font-medium leading-relaxed mb-4 transition-all duration-500'>
                &quot;{testimonials[currentSlide].quote}&quot;
              </p>
              <div>
                <p className='font-semibold text-lg'>{testimonials[currentSlide].author}</p>
                <p className='text-white/80'>{testimonials[currentSlide].location}</p>
              </div>
            </div>

            {/* Pagination */}
            <div className='flex items-center gap-4'>
              <button
                onClick={() => setCurrentSlide(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                className='p-2 hover:bg-white/20 hover:scale-110 rounded-lg transition-all duration-300'
              >
                <ChevronLeft className='w-5 h-5' />
              </button>
              <span className='text-sm'>
                {currentSlide + 1}/{testimonials.length}
              </span>
              <button
                onClick={() => setCurrentSlide(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                className='p-2 hover:bg-white/20 hover:scale-110 rounded-lg transition-all duration-300'
              >
                <ChevronRight className='w-5 h-5' />
              </button>
            </div>
          </div>
          
          {/* Decorative Image */}
          <div className='absolute right-0 bottom-0 w-32 h-32 opacity-20'>
            <img
              src='https://images.unsplash.com/photo-1571875257727-256c39da42af?w=200'
              alt='Product'
              className='w-full h-full object-cover'
            />
          </div>
        </div>
      </div>
    </section>
  );
}

