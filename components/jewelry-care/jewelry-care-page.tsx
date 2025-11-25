'use client';

import { Sparkles, Droplets, Sun, Shield, Heart, BookOpen } from 'lucide-react';
import { Diamond } from 'lucide-react';

export function JewelryCarePage() {
  const careTips = [
    {
      icon: <Droplets size={28} />,
      title: 'Cleaning',
      description: 'Clean your jewelry regularly with a soft cloth and mild soap solution. Avoid harsh chemicals.',
      tips: [
        'Use lukewarm water and mild dish soap',
        'Gently scrub with a soft-bristled brush',
        'Rinse thoroughly and pat dry with a soft cloth',
        'Avoid ultrasonic cleaners for delicate pieces',
      ],
    },
    {
      icon: <Sun size={28} />,
      title: 'Storage',
      description: 'Proper storage prevents scratches and maintains the brilliance of your jewelry.',
      tips: [
        'Store each piece separately in soft pouches',
        'Keep away from direct sunlight and heat',
        'Use anti-tarnish strips for silver jewelry',
        'Store in a dry, cool place',
      ],
    },
    {
      icon: <Shield size={28} />,
      title: 'Protection',
      description: 'Protect your jewelry from damage during daily activities.',
      tips: [
        'Remove jewelry before swimming or showering',
        'Avoid contact with perfumes and lotions',
        'Take off jewelry before exercising',
        'Be careful with household chemicals',
      ],
    },
    {
      icon: <Heart size={28} />,
      title: 'Maintenance',
      description: 'Regular maintenance keeps your jewelry looking new for years.',
      tips: [
        'Get professional cleaning every 6-12 months',
        'Check prongs and settings regularly',
        'Have jewelry inspected by a jeweler annually',
        'Keep original packaging for safe storage',
      ],
    },
  ];

  const materialCare = [
    {
      material: 'Gold',
      tips: [
        'Clean with warm soapy water and soft brush',
        'Polish with a microfiber cloth',
        'Store in separate compartments',
        'Avoid chlorine and bleach',
      ],
    },
    {
      material: 'Silver',
      tips: [
        'Use silver polish for tarnished pieces',
        'Store with anti-tarnish strips',
        'Wear regularly to prevent tarnishing',
        'Clean with baking soda paste for stubborn tarnish',
      ],
    },
    {
      material: 'Platinum',
      tips: [
        'Clean with warm soapy water',
        'Use a soft cloth for polishing',
        'Professional cleaning recommended',
        'Most durable, requires minimal care',
      ],
    },
    {
      material: 'Diamonds',
      tips: [
        'Clean with mild soap and warm water',
        'Use a soft toothbrush for settings',
        'Avoid harsh chemicals',
        'Professional cleaning for maximum sparkle',
      ],
    },
  ];

  return (
    <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      {/* Header */}
      <div className='mb-8 sm:mb-12 text-center'>
        <div className='inline-flex items-center gap-2 mb-4'>
          <div className='h-px w-8 bg-[#E6D3C2]' />
          <Sparkles size={24} className='text-[#C8A15B]' />
          <div className='h-px w-8 bg-[#E6D3C2]' />
        </div>
        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F3B29] mb-3'>
          Jewelry Care Guide
        </h1>
        <p className='text-sm sm:text-base text-[#4F3A2E] max-w-2xl mx-auto'>
          Learn how to maintain the beauty and longevity of your precious jewelry pieces
        </p>
      </div>

      {/* Care Tips Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16'>
        {careTips.map((tip, index) => (
          <div
            key={index}
            className='bg-white border-2 border-[#E6D3C2] rounded-xl p-6 sm:p-8 hover:border-[#C8A15B] transition-all duration-300 hover:shadow-xl'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='w-14 h-14 rounded-full bg-[#F5EEE5] flex items-center justify-center text-[#C8A15B]'>
                {tip.icon}
              </div>
              <h2 className='text-xl sm:text-2xl font-bold text-[#1F3B29]'>{tip.title}</h2>
            </div>
            <p className='text-sm sm:text-base text-[#4F3A2E] mb-4'>{tip.description}</p>
            <ul className='space-y-2'>
              {tip.tips.map((item, i) => (
                <li key={i} className='flex items-start gap-2 text-sm text-[#4F3A2E]'>
                  <span className='text-[#C8A15B] mt-1'>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Material-Specific Care */}
      <div className='mb-12 sm:mb-16'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F3B29] mb-3'>
            Material-Specific Care
          </h2>
          <p className='text-sm sm:text-base text-[#4F3A2E]'>
            Special care instructions for different jewelry materials
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
          {materialCare.map((item, index) => (
            <div
              key={index}
              className='bg-[#F5EEE5] rounded-xl p-5 sm:p-6 border border-[#E6D3C2] hover:border-[#C8A15B] transition-all'>
              <h3 className='text-lg sm:text-xl font-bold text-[#1F3B29] mb-4'>{item.material}</h3>
              <ul className='space-y-2'>
                {item.tips.map((tip, i) => (
                  <li key={i} className='text-xs sm:text-sm text-[#4F3A2E] flex items-start gap-2'>
                    <span className='text-[#C8A15B] mt-1'>✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Reference */}
      <div className='bg-gradient-to-br from-[#F5EEE5] to-white rounded-2xl p-6 sm:p-8 md:p-12 border border-[#E6D3C2]'>
        <div className='flex items-center gap-3 mb-6'>
          <BookOpen size={28} className='text-[#C8A15B]' />
          <h2 className='text-2xl sm:text-3xl font-bold text-[#1F3B29]'>Quick Reference</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h3 className='text-lg font-semibold text-[#1F3B29] mb-3'>Do's</h3>
            <ul className='space-y-2'>
              {['Clean regularly with mild soap', 'Store in separate pouches', 'Remove before activities', 'Get professional cleaning'].map((item, i) => (
                <li key={i} className='flex items-center gap-2 text-sm text-[#4F3A2E]'>
                  <span className='text-green-600'>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className='text-lg font-semibold text-[#1F3B29] mb-3'>Don'ts</h3>
            <ul className='space-y-2'>
              {['Use harsh chemicals', 'Store all pieces together', 'Wear during sports', 'Expose to extreme heat'].map((item, i) => (
                <li key={i} className='flex items-center gap-2 text-sm text-[#4F3A2E]'>
                  <span className='text-red-600'>✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

