'use client';

import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { useScrollAnimation } from './use-scroll-animation';

export function InstagramSection() {
  const { ref, isVisible } = useScrollAnimation();
  const posts = [
    { 
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      username: '@somehealthy'
    },
    { 
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      username: '@somehealthy'
    },
    { 
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      username: '@somehealthy'
    },
    { 
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      username: '@somehealthy'
    },
    { 
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      username: '@somehealthy'
    },
  ];

  return (
    <section ref={ref} className='container mx-auto px-4 py-12'>
      <div className={`flex items-center justify-between mb-6 transform transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <h2 className='text-3xl font-bold text-gray-900'>We&apos;re on Gram</h2>
        <Link href='#' className='text-[#6B46C1] font-semibold hover:underline hover:scale-105 transition-transform'>
          View all
        </Link>
      </div>
      <div className='flex gap-4 overflow-x-auto pb-4 scrollbar-hide'>
        {posts.map((post, index) => (
          <div 
            key={index} 
            className={`flex-shrink-0 w-72 relative group transform transition-all duration-500 hover:-translate-y-2 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className='relative aspect-square rounded-lg overflow-hidden bg-gray-200'>
              <img
                src={post.image}
                alt={`Instagram post ${index + 1}`}
                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
              />
              <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center'>
                <Instagram className='w-8 h-8 text-white opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300' />
              </div>
            </div>
            <div className='absolute bottom-2 left-2 flex items-center gap-2 text-white text-sm'>
              <Instagram className='w-4 h-4' />
              <span>{post.username}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

