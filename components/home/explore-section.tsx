'use client';

import { useScrollAnimation } from './use-scroll-animation';

export function ExploreSection() {
  const { ref, isVisible } = useScrollAnimation();
  const items = [
    { name: 'Relic Relaxed', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300' },
    { name: 'Relic Relaxed', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300' },
    { name: 'Relic Relaxed', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300' },
    { name: 'Relic Relaxed', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300' },
    { name: 'Relic Relaxed', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300' },
  ];

  return (
    <section ref={ref} className='container mx-auto px-4 py-12'>
      <div className={`text-center mb-8 transform transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <p className='text-sm text-gray-500 mb-2'>Effortless Elegance</p>
        <h2 className='text-3xl font-bold text-gray-900'>Explore our collection of shoes & bags from chic boots to loafers</h2>
      </div>
      <div className='flex gap-4 overflow-x-auto pb-4 scrollbar-hide'>
        {items.map((item, index) => (
          <div 
            key={index} 
            className={`flex-shrink-0 w-72 transform transition-all duration-500 hover:-translate-y-2 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className='relative rounded-lg overflow-hidden bg-gray-200 aspect-square group mb-3'>
              <img
                src={item.image}
                alt={item.name}
                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
              />
            </div>
            <h3 className='font-semibold mb-2'>{item.name}</h3>
            <button className='bg-[#6B46C1] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#5B3AA1] hover:scale-105 transition-all duration-300'>
              Shop Now
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

