'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, BookOpen, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { blogCards } from '@/app/utils/dummyData';

export function BlogDetailPage({ blogId }: { blogId: string }) {
  const router = useRouter();
  const blog = blogCards.find(b => b.id.toString() === blogId);

  if (!blog) {
    return (
      <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-12 text-center'>
        <h1 className='text-2xl font-bold text-[#1F3B29] mb-4'>Blog Post Not Found</h1>
        <button
          onClick={() => router.push('/blog')}
          className='inline-flex items-center gap-2 rounded-full bg-[#1F3B29] px-6 py-3 text-white font-semibold'>
          <ArrowLeft size={18} />
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      <button
        onClick={() => router.back()}
        className='mb-6 flex items-center gap-2 text-sm text-[#4F3A2E] hover:text-[#1F3B29] transition-colors'>
        <ArrowLeft size={18} />
        <span>Back to Blog</span>
      </button>

      <article className='max-w-4xl mx-auto'>
        <div className='mb-6 flex items-center gap-4 text-sm text-[#4F3A2E]'>
          <span className='px-3 py-1 rounded-full bg-[#C8A15B]/10 text-[#C8A15B] font-semibold uppercase'>
            {blog.category}
          </span>
          <div className='flex items-center gap-2'>
            <Calendar size={16} />
            <span>{blog.date}</span>
          </div>
        </div>

        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F3B29] mb-6'>{blog.title}</h1>

        <div className='relative h-64 sm:h-96 md:h-[500px] rounded-2xl overflow-hidden mb-8'>
          <Image src={blog.img} alt={blog.title} fill sizes='100vw' className='object-cover' />
        </div>

        <div className='prose prose-lg max-w-none mb-8'>
          <p className='text-lg text-[#4F3A2E] leading-relaxed mb-6'>{blog.desc}</p>
          
          <div className='space-y-4 text-[#4F3A2E]'>
            <p>
              At LuxeLoom, we believe that jewelry is more than just an accessory—it's a reflection of your personal style 
              and a celebration of life's most precious moments. Our commitment to excellence drives everything we do, 
              from the initial design concept to the final polished piece.
            </p>
            <p>
              Each piece in our collection is crafted with meticulous attention to detail, using only the finest materials 
              and time-honored techniques. We work with skilled artisans who bring decades of experience to every creation, 
              ensuring that each piece meets our exacting standards of quality and beauty.
            </p>
            <p>
              Whether you're looking for a statement piece for a special occasion or something elegant for everyday wear, 
              our collection offers something for every taste and style. We invite you to explore our designs and discover 
              the perfect piece that speaks to you.
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4 mb-12 pt-8 border-t border-[#E6D3C2]'>
          <span className='text-sm font-semibold text-[#1F3B29]'>Share:</span>
          <div className='flex items-center gap-3'>
            <button className='w-10 h-10 rounded-full border border-[#E6D3C2] flex items-center justify-center hover:bg-[#F5EEE5] transition-colors'>
              <Facebook size={18} className='text-[#1F3B29]' />
            </button>
            <button className='w-10 h-10 rounded-full border border-[#E6D3C2] flex items-center justify-center hover:bg-[#F5EEE5] transition-colors'>
              <Twitter size={18} className='text-[#1F3B29]' />
            </button>
            <button className='w-10 h-10 rounded-full border border-[#E6D3C2] flex items-center justify-center hover:bg-[#F5EEE5] transition-colors'>
              <Linkedin size={18} className='text-[#1F3B29]' />
            </button>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <div className='mt-16'>
        <h2 className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-8'>Related Posts</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {blogCards.filter(b => b.id !== blog.id).slice(0, 3).map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className='group rounded-xl border border-[#E6D3C2] overflow-hidden hover:border-[#C8A15B] transition-all hover:shadow-xl'>
              <div className='relative h-48 overflow-hidden'>
                <Image
                  src={post.img}
                  alt={post.title}
                  fill
                  sizes='(max-width: 768px) 100vw, 33vw'
                  className='object-cover group-hover:scale-110 transition-transform duration-500'
                />
              </div>
              <div className='p-5'>
                <div className='flex items-center gap-3 mb-2 text-xs text-[#4F3A2E]'>
                  <span className='px-2 py-1 rounded bg-[#C8A15B]/10 text-[#C8A15B]'>{post.category}</span>
                  <span>{post.date}</span>
                </div>
                <h3 className='text-lg font-bold text-[#1F3B29] mb-2 group-hover:text-[#C8A15B] transition-colors line-clamp-2'>
                  {post.title}
                </h3>
                <p className='text-sm text-[#4F3A2E] line-clamp-2'>{post.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

