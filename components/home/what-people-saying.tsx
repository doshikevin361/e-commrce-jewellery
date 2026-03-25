'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { Great_Vibes } from 'next/font/google';

const scriptFont = Great_Vibes({ weight: '400', subsets: ['latin'] });

const REVIEWS = [
  {
    id: '1',
    name: 'Akanksha Khanna',
    image: '/uploads/1765269917848-mttqdya63ws.jpg',
    text: 'Fantastic purchase! The big pearl earrings are elegant, comfortable, and receive compliments every time I wear them. A definite must-have in every jewelry collection.',
  },
  {
    id: '2',
    name: 'Nutan Mishra',
    image: '/uploads/1765272258145-ta6uom4xec.jpg',
    text: 'Bold and beautiful blue triple hoop earrings – the perfect combination of elegance and trendiness. They never fail to catch attention and compliments.',
  },
  {
    id: '3',
    name: 'Divya Mishra',
    image: '/uploads/1765272281023-dyw5c7pvej.jpg',
    text: 'The gold chain I ordered feels substantial and sits beautifully. Packaging was lovely and delivery was quicker than I expected.',
  },
  {
    id: '4',
    name: 'Anuska Ananya',
    image: '/uploads/1765273359701-w2ybph2t48.webp',
    text: 'My everyday stack rings are dainty but sturdy—I have worn them for months without a single issue. Truly impressed with the finish.',
  },
  {
    id: '5',
    name: 'Priya Sharma',
    image: '/uploads/1773463651370-vtgwupov13n.jpg',
    text: 'Ordered a pendant for my mother’s birthday; she has not taken it off since. The stone catches the light in the most subtle, elegant way.',
  },
];

function StarRow() {
  return (
    <div className='flex justify-center gap-0.5' aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className='h-4 w-4 fill-[#C8AD8D] text-[#C8AD8D]' strokeWidth={0} />
      ))}
    </div>
  );
}

export function WhatPeopleAreSaying() {
  return (
    <section className='bg-white py-12 sm:py-14 lg:py-20'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <h2 className='text-center text-2xl font-semibold tracking-tight text-[#1a1a1a] sm:text-3xl'>What People Are Saying</h2>
        <p className='mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-neutral-600 sm:text-base'>
          We enjoy ourselves when you talk about us. Check out all the sweet words of our happy customers.
        </p>

        <div className='mt-10 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory sm:gap-5 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden'>
          {REVIEWS.map(item => (
            <article
              key={item.id}
              className='relative min-w-[260px] max-w-[320px] shrink-0 snap-center rounded-2xl bg-[#FDF8F3] px-4 pb-6 pt-8 shadow-sm sm:min-w-[280px] lg:min-w-0 lg:max-w-none'>
              <div className='pointer-events-none absolute inset-x-0 top-0 h-[76px] overflow-hidden rounded-t-2xl'>
                <div className='h-full w-full rounded-b-[50%] bg-[#C8AD8D]/55' />
              </div>
              <div className='relative z-10 flex flex-col items-center'>
                <div className='relative -mt-10 h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-[#FDF8F3]'>
                  <Image src={item.image} alt={`${item.name} — customer photo`} fill className='object-cover' sizes='80px' />
                </div>
                <p className={`mt-3 text-center text-2xl leading-tight text-[#8B7355] ${scriptFont.className}`}>{item.name}</p>
                <div className='mt-2'>
                  <StarRow />
                </div>
                <p className='mt-4 text-center text-sm leading-relaxed text-neutral-700'>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
