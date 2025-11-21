'use client';

import { useScrollAnimation } from './use-scroll-animation';

export function ShopByCampaign() {
  const { ref, isVisible } = useScrollAnimation();
  const campaigns = [
    {
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      category: 'Flannels',
      items: '9 items',
    },
    {
      image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400',
      category: 'Flannels',
      items: '9 items',
    },
    {
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      category: 'Flannels',
      items: '9 items',
    },
    {
      image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400',
      category: 'Flannels',
      items: '9 items',
    },
  ];

  return (
    <section ref={ref} className='container mx-auto px-4 py-12'>
      <h2 className={`text-3xl font-bold text-[#4C1D95] mb-8 transform transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>Shop By Campaign</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {campaigns.map((campaign, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-lg overflow-hidden shadow-sm group transform transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className='aspect-square bg-gray-100 overflow-hidden'>
              <img
                src={campaign.image}
                alt={campaign.category}
                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
              />
            </div>
            <div className='p-4 bg-gray-50'>
              <p className='text-sm text-gray-600 mb-1'>{campaign.category}</p>
              <p className='text-sm text-gray-500 mb-3'>{campaign.items}</p>
              <button className='w-full bg-[#4C1D95] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#3B1A6E] hover:scale-105 transition-all duration-300'>
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

