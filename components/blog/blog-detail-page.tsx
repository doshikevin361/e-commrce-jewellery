'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Facebook, Twitter, Linkedin } from 'lucide-react';
import { blogCards, type BlogPost } from '@/lib/blog-posts';

function ArticleBody({ blog }: { blog: BlogPost }) {
  return (
    <div className='prose prose-lg max-w-none mb-8 prose-headings:text-[#1F3B29] prose-p:text-[#4F3A2E]'>
      <p className='text-lg text-[#4F3A2E] leading-relaxed mb-8 not-prose font-medium border-l-4 border-[#C8A15B]/40 pl-4'>
        {blog.desc}
      </p>

      {blog.sections.map((section, idx) => (
        <section key={idx} className='mb-8 last:mb-0'>
          {section.heading ? (
            <h2 className='text-xl sm:text-2xl font-bold text-[#1F3B29] mb-4 not-prose'>{section.heading}</h2>
          ) : null}
          <div className='space-y-4'>
            {section.paragraphs.map((p, i) => (
              <p key={i} className='text-[#4F3A2E] leading-relaxed text-[17px]'>
                {p}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

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
        <div className='mb-6 flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-[#4F3A2E]'>
          <span className='px-3 py-1 rounded-full bg-[#C8A15B]/10 text-[#C8A15B] font-semibold uppercase'>
            {blog.category}
          </span>
          <div className='flex items-center gap-2'>
            <Calendar size={16} aria-hidden />
            <span>{blog.date}</span>
          </div>
          <span className='text-[#3F5C45]' aria-label='Reading time'>
            · {blog.readTime}
          </span>
        </div>

        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F3B29] mb-6'>{blog.title}</h1>

        <div className='relative h-64 sm:h-96 md:h-[500px] rounded-2xl overflow-hidden mb-8'>
          <Image
            src={blog.img}
            alt={blog.title}
            fill
            sizes='100vw'
            className='object-cover'
            priority
          />
        </div>

        <ArticleBody blog={blog} />

        <div className='flex items-center gap-4 mb-12 pt-8 border-t border-[#E6D3C2]'>
          <span className='text-sm font-semibold text-[#1F3B29]'>Share:</span>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              aria-label='Share on Facebook'
              className='w-10 h-10 rounded-full border border-[#E6D3C2] flex items-center justify-center hover:bg-[#F5EEE5] transition-colors'>
              <Facebook size={18} className='text-[#1F3B29]' />
            </button>
            <button
              type='button'
              aria-label='Share on X'
              className='w-10 h-10 rounded-full border border-[#E6D3C2] flex items-center justify-center hover:bg-[#F5EEE5] transition-colors'>
              <Twitter size={18} className='text-[#1F3B29]' />
            </button>
            <button
              type='button'
              aria-label='Share on LinkedIn'
              className='w-10 h-10 rounded-full border border-[#E6D3C2] flex items-center justify-center hover:bg-[#F5EEE5] transition-colors'>
              <Linkedin size={18} className='text-[#1F3B29]' />
            </button>
          </div>
        </div>
      </article>

      <div className='mt-16'>
        <h2 className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-8'>Related Posts</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {blogCards
            .filter(b => b.id !== blog.id)
            .slice(0, 3)
            .map(post => (
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
