'use client';

import { useScrollAnimation } from './use-scroll-animation';

export function OctoberFashion() {
  const { ref, isVisible } = useScrollAnimation();
  const products = [
    {
      image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400',
      name: 'Cotton Hooded Flannel',
      price: '$500.00',
    },
    {
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      name: 'Cotton Hooded Flannel',
      price: '$500.00',
    },
  ];

  const categories = [
    'Outerwear Collection',
    'Cashmere Sweaters',
    'The Cold weather',
  ];

  return (
    <section ref={ref} className='container mx-auto px-4 py-12'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
        {/* Left Side - Text and Categories */}
        <div className={`transform transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}>
          <h2 className='text-3xl font-bold text-[#4C1D95] mb-6'>The October Cleaner Fashion</h2>
          <p className='text-gray-700 mb-8 leading-relaxed'>
            We create care products that really work and are designed to make you feel good.
          </p>
          
          <div className='space-y-4 mb-8'>
            {categories.map((category, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 transform transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className='w-2 h-2 rounded-full bg-[#4C1D95]'></div>
                <p className='text-gray-700 font-medium'>{category}</p>
              </div>
            ))}
          </div>

          <button className='bg-[#4C1D95] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#3B1A6E] hover:scale-105 transition-all duration-300'>
            Shop All Products
          </button>
        </div>

        {/* Right Side - Product Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {products.map((product, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg overflow-hidden shadow-sm group transform transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className='aspect-square bg-gray-100 overflow-hidden'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                />
              </div>
              <div className='p-4'>
                <p className='text-sm text-gray-600 mb-1'>{product.name}</p>
                <p className='text-lg font-bold text-gray-900 mb-3'>{product.price}</p>
                <button className='w-full bg-[#4C1D95] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#3B1A6E] hover:scale-105 transition-all duration-300'>
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

