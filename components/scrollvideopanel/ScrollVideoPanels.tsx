'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface VideoItem {
  url: string;
  hashtag: string;
  productSlug: string;
}

interface ScrollVideoPanelsProps {
  videoData: VideoItem[];
}

const ScrollVideoPanels: React.FC<ScrollVideoPanelsProps> = ({ videoData }) => {
  const [activeVideos, setActiveVideos] = useState<Set<number>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  const handleVideoClick = (slug: string) => {
    router.push(`/product/${slug}`);
  };

  useEffect(() => {
    const observers = videoRefs.current.map((video, index) => {
      if (!video) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveVideos(prev => new Set(prev).add(index));
            video.play().catch(() => {});
          } else {
            setActiveVideos(prev => {
              const set = new Set(prev);
              set.delete(index);
              return set;
            });
            video.pause();
          }
        },
        { threshold: 0.5 },
      );

      observer.observe(video);
      return observer;
    });

    return () => {
      observers.forEach((observer, index) => {
        if (observer && videoRefs.current[index]) {
          observer.unobserve(videoRefs.current[index]!);
        }
      });
    };
  }, []);
  if (!videoData) return;
  return (
    <div className='relative'>
      {/* Scroll Buttons */}
      <div className='absolute -top-10 right-4 z-20 flex gap-2'>
        <button
          onClick={() => scroll('left')}
          className='w-10 h-10 rounded-full border border-web text-web hover:bg-web hover:text-white flex items-center justify-center'>
          <ChevronLeft />
        </button>
        <button
          onClick={() => scroll('right')}
          className='w-10 h-10 rounded-full border border-web text-web hover:bg-web hover:text-white flex items-center justify-center'>
          <ChevronRight />
        </button>
      </div>

      {/* Video Scroll */}
      <div ref={scrollRef} className='flex overflow-x-auto gap-1 p-4 snap-x snap-mandatory scrollbar-hide'>
        {videoData &&
          videoData?.length > 0 &&
          videoData.map((item, index) => (
            <div
              key={index}
              onClick={() => handleVideoClick(item.productSlug)}
              className='relative flex-shrink-0 w-64 h-96 snap-center cursor-pointer'>
              <div className='absolute top-4 left-4 z-10'>
                <span className='text-white text-sm bg-black/30 px-3 py-1 rounded-full'>{item.hashtag}</span>
              </div>

              <video
                ref={el => (videoRefs.current[index] = el)}
                src={item.url}
                className='w-full h-full object-cover rounded-lg'
                loop
                muted
                playsInline
              />

              {!activeVideos.has(index) && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg'>
                  <div className='w-14 h-14 rounded-full bg-white flex items-center justify-center'>▶</div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ScrollVideoPanels;
