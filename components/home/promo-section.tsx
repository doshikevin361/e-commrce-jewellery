'use client';

import { useState, useEffect } from 'react';
import { useScrollAnimation } from './use-scroll-animation';

export function PromoSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 20, seconds: 23, days: 4 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
              days--;
              if (days < 0) {
                days = 0;
              }
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={ref} className='container mx-auto px-4 py-8'>
      <h2 className={`text-3xl font-bold text-[#6B46C1] mb-6 transform transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>Promo Offer</h2>
      <div className={`bg-yellow-100 rounded-lg p-6 transform transition-all duration-700 delay-200 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        <div className='flex items-center justify-between flex-wrap gap-6'>
          <div>
            <p className='text-xl font-bold mb-2'>The Last Chance</p>
            <div className='flex items-center gap-2 text-3xl font-bold text-gray-900'>
              <span>{String(timeLeft.days).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <p className='text-lg font-semibold'>Save on trendy clothing, best sellers + more</p>
            <button className='bg-yellow-100 border-2 border-gray-900 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-200 hover:scale-105 transition-all duration-300'>
              Copy Code: FLASH30
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

