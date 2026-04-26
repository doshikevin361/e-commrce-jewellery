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


export function WhatPeopleAreSaying() {
  function StarRow({ rating }: { rating: number }) {
    return (
      <div className='flex gap-0.5'>
        {[...Array(5)].map((_, i) => (
          <svg key={i} className='h-3 w-3' viewBox='0 0 24 24'>
            <polygon
              points='12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26'
              fill={i < rating ? '#a05a64' : '#e8cdd1'}
            />
          </svg>
        ))}
      </div>
    );
  }
  return (
    <section className='bg-white py-14 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>

        {/* Header */}
        <div className='mb-12 text-center'>
          <p className='mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a05a64]'>
            Testimonials
          </p>
          <h2 className='font-serif text-3xl font-bold text-[#1a0a0e] sm:text-4xl'>
            What Our Customers Say
          </h2>
          <p className='mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#7a5a60]'>
            Real words from real people who found their perfect piece with us.
          </p>
        </div>

        {/* Cards */}
        <div className='flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0'>
          {REVIEWS.map(review => (
            <article
              key={review.id}
              className={`
                relative min-w-[280px] shrink-0 snap-center rounded-2xl border p-6 transition-all duration-200
                lg:min-w-0 hover:-translate-y-1
                ${review.featured
                  ? 'border-[#a05a64] bg-[#fff0f2]'
                  : 'border-[#e8cdd1] bg-[#fdf5f6] hover:border-[#a05a64]'}
              `}>

              {/* Featured badge */}
              {review.featured && (
                <span className='mb-3 inline-block rounded-full bg-[#f5dde1] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#a05a64]'>
                  Top Review
                </span>
              )}

              {/* Quote mark */}
              <div className='mb-2 font-serif text-4xl leading-none text-[#a05a64] opacity-60'>"</div>

              {/* Review text */}
              <p className='mb-5 text-sm leading-relaxed text-[#4a2a30]'>{review.text}</p>

              {/* Divider */}
              <div className='mb-4 h-px bg-[#e8cdd1]' />

              {/* Footer */}
              <div className='flex items-center gap-3'>
                <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#a05a64]'>
                  {review.image ? (
                    <Image src={review.image} alt={review.name} fill className='object-cover' sizes='40px' />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center bg-[#f5dde1] text-[13px] font-bold text-[#a05a64]'>
                      {review.initials}
                    </div>
                  )}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-[13px] font-bold text-[#1a0a0e]'>{review.name}</p>
                  <p className='text-[11px] text-[#a07a80]'>{review.location}</p>
                </div>
                <StarRow rating={review.rating} />
              </div>
            </article>
          ))}
        </div>

        {/* Stats bar */}
        <div className='mt-12 flex flex-wrap justify-center gap-12 border-t border-[#e8cdd1] pt-10'>
          {[
            { value: '4.9', label: 'Avg. Rating' },
            { value: '12K+', label: 'Happy Customers' },
            { value: '98%', label: 'Recommend Us' },
          ].map(stat => (
            <div key={stat.label} className='text-center'>
              <p className='font-serif text-3xl font-bold text-[#a05a64]'>{stat.value}</p>
              <p className='mt-1 text-[11px] uppercase tracking-widest text-[#a07a80]'>{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}