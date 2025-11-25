'use client';

import { Ruler, Circle, Link2, Gem, Download } from 'lucide-react';
import { useState } from 'react';

export function SizeGuidePage() {
  const [selectedType, setSelectedType] = useState<'ring' | 'necklace' | 'bracelet'>('ring');

  const ringSizes = [
    { us: '4', uk: 'H', eu: '47', mm: '14.9' },
    { us: '5', uk: 'J', eu: '49', mm: '15.7' },
    { us: '6', uk: 'L', eu: '52', mm: '16.5' },
    { us: '7', uk: 'N', eu: '54', mm: '17.3' },
    { us: '8', uk: 'P', eu: '56', mm: '18.1' },
    { us: '9', uk: 'R', eu: '58', mm: '18.9' },
    { us: '10', uk: 'T', eu: '60', mm: '19.8' },
  ];

  const necklaceLengths = [
    { name: 'Choker', length: '14-16 inches', description: 'Sits close to the neck' },
    { name: 'Princess', length: '17-19 inches', description: 'Classic, versatile length' },
    { name: 'Matinee', length: '20-24 inches', description: 'Elegant, formal occasions' },
    { name: 'Opera', length: '28-32 inches', description: 'Long, dramatic style' },
    { name: 'Rope', length: '32+ inches', description: 'Very long, can be doubled' },
  ];

  const braceletSizes = [
    { size: 'Small', length: '6-6.5 inches', wrist: '5.5-6 inches' },
    { size: 'Medium', length: '7-7.5 inches', wrist: '6.5-7 inches' },
    { size: 'Large', length: '8-8.5 inches', wrist: '7.5-8 inches' },
    { size: 'X-Large', length: '9+ inches', wrist: '8+ inches' },
  ];

  return (
    <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      {/* Header */}
      <div className='mb-8 sm:mb-12 text-center'>
        <div className='inline-flex items-center gap-2 mb-4'>
          <div className='h-px w-8 bg-[#E6D3C2]' />
          <Ruler size={24} className='text-[#C8A15B]' />
          <div className='h-px w-8 bg-[#E6D3C2]' />
        </div>
        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F3B29] mb-3'>
          Size Guide
        </h1>
        <p className='text-sm sm:text-base text-[#4F3A2E] max-w-2xl mx-auto'>
          Find the perfect fit for your jewelry with our comprehensive size guide
        </p>
      </div>

      {/* Type Selector */}
      <div className='flex flex-wrap justify-center gap-3 mb-8 sm:mb-12'>
        {[
          { id: 'ring', label: 'Ring Sizes', icon: <Circle size={20} /> },
          { id: 'necklace', label: 'Necklace Lengths', icon: <Gem size={20} /> },
          { id: 'bracelet', label: 'Bracelet Sizes', icon: <Link2 size={20} /> },
        ].map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id as 'ring' | 'necklace' | 'bracelet')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
              selectedType === type.id
                ? 'bg-[#1F3B29] text-white'
                : 'bg-white text-[#1F3B29] border-2 border-[#E6D3C2] hover:border-[#C8A15B]'
            }`}>
            {type.icon}
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Ring Size Guide */}
      {selectedType === 'ring' && (
        <div className='space-y-8'>
          <div className='bg-[#F5EEE5] rounded-2xl p-6 sm:p-8 mb-8'>
            <h2 className='text-xl sm:text-2xl font-bold text-[#1F3B29] mb-4'>How to Measure Your Ring Size</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {[
                { step: '1', title: 'Wrap a String', desc: 'Wrap a piece of string or paper around your finger' },
                { step: '2', title: 'Mark the Point', desc: 'Mark where the string overlaps' },
                { step: '3', title: 'Measure', desc: 'Measure the length and match to our size chart' },
              ].map(item => (
                <div key={item.step} className='bg-white rounded-lg p-4'>
                  <div className='w-10 h-10 rounded-full bg-[#C8A15B] text-white flex items-center justify-center font-bold mb-3'>
                    {item.step}
                  </div>
                  <h3 className='font-semibold text-[#1F3B29] mb-2'>{item.title}</h3>
                  <p className='text-sm text-[#4F3A2E]'>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-white border-2 border-[#E6D3C2] rounded-xl overflow-hidden'>
            <div className='bg-[#1F3B29] text-white p-4'>
              <h2 className='text-xl font-bold'>Ring Size Chart</h2>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-[#F5EEE5]'>
                  <tr>
                    <th className='px-4 py-3 text-left text-sm font-semibold text-[#1F3B29]'>US Size</th>
                    <th className='px-4 py-3 text-left text-sm font-semibold text-[#1F3B29]'>UK Size</th>
                    <th className='px-4 py-3 text-left text-sm font-semibold text-[#1F3B29]'>EU Size</th>
                    <th className='px-4 py-3 text-left text-sm font-semibold text-[#1F3B29]'>Diameter (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {ringSizes.map((size, i) => (
                    <tr key={i} className='border-b border-[#E6D3C2] hover:bg-[#F5EEE5] transition-colors'>
                      <td className='px-4 py-3 text-sm text-[#4F3A2E] font-semibold'>{size.us}</td>
                      <td className='px-4 py-3 text-sm text-[#4F3A2E]'>{size.uk}</td>
                      <td className='px-4 py-3 text-sm text-[#4F3A2E]'>{size.eu}</td>
                      <td className='px-4 py-3 text-sm text-[#4F3A2E]'>{size.mm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Necklace Length Guide */}
      {selectedType === 'necklace' && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
            {necklaceLengths.map((item, i) => (
              <div key={i} className='bg-white border-2 border-[#E6D3C2] rounded-xl p-5 sm:p-6 hover:border-[#C8A15B] transition-all'>
                <h3 className='text-lg sm:text-xl font-bold text-[#1F3B29] mb-2'>{item.name}</h3>
                <p className='text-sm sm:text-base font-semibold text-[#C8A15B] mb-2'>{item.length}</p>
                <p className='text-sm text-[#4F3A2E]'>{item.description}</p>
              </div>
            ))}
          </div>
          <div className='bg-[#F5EEE5] rounded-xl p-6'>
            <h3 className='text-lg font-semibold text-[#1F3B29] mb-3'>Measuring Tips</h3>
            <ul className='space-y-2 text-sm text-[#4F3A2E]'>
              <li>• Use a flexible measuring tape around your neck</li>
              <li>• Add 2-4 inches for a comfortable fit</li>
              <li>• Consider the style and neckline of your outfit</li>
            </ul>
          </div>
        </div>
      )}

      {/* Bracelet Size Guide */}
      {selectedType === 'bracelet' && (
        <div className='space-y-6'>
          <div className='bg-white border-2 border-[#E6D3C2] rounded-xl overflow-hidden'>
            <div className='bg-[#1F3B29] text-white p-4'>
              <h2 className='text-xl font-bold'>Bracelet Size Chart</h2>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-[#F5EEE5]'>
                  <tr>
                    <th className='px-4 py-3 text-left text-sm font-semibold text-[#1F3B29]'>Size</th>
                    <th className='px-4 py-3 text-left text-sm font-semibold text-[#1F3B29]'>Bracelet Length</th>
                    <th className='px-4 py-3 text-left text-sm font-semibold text-[#1F3B29]'>Wrist Size</th>
                  </tr>
                </thead>
                <tbody>
                  {braceletSizes.map((size, i) => (
                    <tr key={i} className='border-b border-[#E6D3C2] hover:bg-[#F5EEE5] transition-colors'>
                      <td className='px-4 py-3 text-sm text-[#4F3A2E] font-semibold'>{size.size}</td>
                      <td className='px-4 py-3 text-sm text-[#4F3A2E]'>{size.length}</td>
                      <td className='px-4 py-3 text-sm text-[#4F3A2E]'>{size.wrist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className='bg-[#F5EEE5] rounded-xl p-6'>
            <h3 className='text-lg font-semibold text-[#1F3B29] mb-3'>How to Measure</h3>
            <p className='text-sm text-[#4F3A2E] mb-3'>
              Wrap a flexible measuring tape around your wrist where you want the bracelet to sit. Add 0.5-1 inch for comfort.
            </p>
          </div>
        </div>
      )}

      {/* Download Guide */}
      <div className='mt-12 text-center bg-gradient-to-br from-[#F5EEE5] to-white rounded-2xl p-6 sm:p-8 border border-[#E6D3C2]'>
        <Download size={32} className='text-[#C8A15B] mx-auto mb-4' />
        <h3 className='text-xl font-bold text-[#1F3B29] mb-2'>Need Help?</h3>
        <p className='text-sm text-[#4F3A2E] mb-4'>
          Contact our jewelry experts for personalized sizing assistance
        </p>
        <a
          href='/contact'
          className='inline-flex items-center gap-2 rounded-full bg-[#1F3B29] px-6 py-3 text-white font-semibold hover:bg-[#2a4d3a] transition-colors'>
          Contact Us
        </a>
      </div>
    </div>
  );
}

