'use client';

import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from './use-scroll-animation';

export function CollectionsSection() {
  const { ref, isVisible } = useScrollAnimation();
  const collections = [
    { category: 'Jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300' },
    { category: 'Jackets', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300' },
    { category: 'Bag', image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=300' },
    { category: 'Jackets', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300' },
    { category: 'Jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300' },
    { category: 'Jackets', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300' },
  ];

  return (
    <section ref={ref} className='container mx-auto px-4 py-12'>
      <h2 className={`text-3xl font-bold text-[#6B46C1] mb-6 transform transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>Collections</h2>
      <div className='flex gap-4 overflow-x-auto pb-4 scrollbar-hide'>
        {collections.map((collection, index) => (
          <div 
            key={index} 
            className={`flex-shrink-0 w-64 bg-white rounded-lg overflow-hidden shadow-sm group transform transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className='relative h-80 bg-gray-200 overflow-hidden'>
              <img
                src={collection.image}
                alt={collection.category}
                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
              />
            </div>
            <div className='p-4 flex items-center justify-between'>
              <p className='font-semibold text-gray-900'>{collection.category}</p>
              <ArrowRight className='w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform' />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

