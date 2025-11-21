'use client';

import { useState } from 'react';
import { useScrollAnimation } from './use-scroll-animation';

export function FeatureCollection() {
  const { ref, isVisible } = useScrollAnimation();
  const [activeTab, setActiveTab] = useState('new-items');
  
  const products = [
    { category: 'Hoodies', name: 'Haven Hooded Puffer', price: '$100.00', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300' },
    { category: 'Hoodies', name: 'Haven Hooded Puffer', price: '$100.00', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300' },
    { category: 'Hoodies', name: 'Haven Hooded Puffer', price: '$100.00', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300' },
    { category: 'Hoodies', name: 'Haven Hooded Puffer', price: '$100.00', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300' },
    { category: 'Hoodies', name: 'Haven Hooded Puffer', price: '$100.00', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300' },
    { category: 'Hoodies', name: 'Haven Hooded Puffer', price: '$100.00', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300' },
    { category: 'Hoodies', name: 'Haven Hooded Puffer', price: '$100.00', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300' },
    { category: 'Hoodies', name: 'Haven Hooded Puffer', price: '$100.00', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300' },
  ];

  return (
    <section ref={ref} className='container mx-auto px-4 py-12'>
      <div className={`flex items-center justify-between mb-8 transform transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <h2 className='text-3xl font-bold text-[#6B46C1]'>Feature Collection</h2>
        <div className='flex items-center gap-6'>
          <button
            onClick={() => setActiveTab('new-items')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'new-items'
                ? 'border-[#6B46C1] text-[#6B46C1] font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            New Items
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'trending'
                ? 'border-[#6B46C1] text-[#6B46C1] font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Trending Now
          </button>
          <button
            onClick={() => setActiveTab('bestsellers')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'bestsellers'
                ? 'border-[#6B46C1] text-[#6B46C1] font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Best Sellers
          </button>
        </div>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {products.map((product, index) => (
          <div 
            key={index} 
            className={`group transform transition-all duration-500 hover:-translate-y-2 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <div className='relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-3'>
              <img
                src={product.image}
                alt={product.name}
                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
              />
              <button className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 whitespace-nowrap shadow-lg'>
                Choose Options
              </button>
            </div>
            <p className='text-sm text-gray-500 mb-1'>{product.category}</p>
            <h3 className='font-semibold mb-1'>{product.name}</h3>
            <p className='text-gray-900 font-bold'>{product.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

