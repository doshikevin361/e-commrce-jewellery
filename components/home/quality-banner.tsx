'use client';

import { Gem } from 'lucide-react';
import { useScrollAnimation } from './use-scroll-animation';

export function QualityBanner() {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section ref={ref} className='bg-[#4C1D95] text-white py-12'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8 items-center'>
          {/* Main Heading */}
          <div className={`md:col-span-1 transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <h2 className='text-3xl md:text-4xl font-bold'>Today Quality, Durability & Good Looks</h2>
          </div>

          {/* Three Feature Columns */}
          <div className='md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Column 1 */}
            <div className={`flex flex-col items-center md:items-start transform transition-all duration-700 delay-200 hover:scale-105 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className='mb-4'>
                <Gem className='w-12 h-12 text-white group-hover:scale-110 transition-transform' />
              </div>
              <h3 className='text-xl font-bold mb-2'>Organic Cotton</h3>
              <p className='text-sm text-white/80 text-center md:text-left'>
                Currently, 82% features organic or recycled materials
              </p>
            </div>

            {/* Column 2 */}
            <div className={`flex flex-col items-center md:items-start transform transition-all duration-700 delay-300 hover:scale-105 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className='mb-4'>
                <Gem className='w-12 h-12 text-white group-hover:scale-110 transition-transform' />
              </div>
              <h3 className='text-xl font-bold mb-2'>Organic Cotton</h3>
              <p className='text-sm text-white/80 text-center md:text-left'>
                Currently, 82% features organic or recycled materials
              </p>
            </div>

            {/* Column 3 */}
            <div className={`flex flex-col items-center md:items-start transform transition-all duration-700 delay-400 hover:scale-105 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className='mb-4'>
                <Gem className='w-12 h-12 text-white group-hover:scale-110 transition-transform' />
              </div>
              <h3 className='text-xl font-bold mb-2'>Organic Cotton</h3>
              <p className='text-sm text-white/80 text-center md:text-left'>
                Currently, 82% features organic or recycled materials
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

