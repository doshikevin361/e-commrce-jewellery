'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageLoader } from '@/components/common/page-loader';

interface FooterPage {
  pageName: string;
  content: string;
}

export default function FooterContentPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const [page, setPage] = useState<FooterPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/public/footer-pages/${slug}`, { cache: 'no-store' });
        if (!response.ok) {
          setError(response.status === 404 ? 'Page not found' : 'Failed to load page');
          setPage(null);
          return;
        }
        const data = await response.json();
        setPage({
          pageName: data.pageName || 'Footer Page',
          content: data.content || '',
        });
      } catch (err) {
        console.error('[v0] Failed to fetch footer page:', err);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  if (loading) {
    return <PageLoader message='Loading page...' className='min-h-screen' />;
  }

  if (error) {
    return (
      <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-20 text-center'>
        <h1 className='text-2xl font-semibold text-[#1F3B29]'>{error}</h1>
        <p className='mt-3 text-sm text-[#4F3A2E]/70'>Please check the link or try again later.</p>
      </div>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-12'>
      <h1 className='text-3xl font-bold text-[#1F3B29] mb-6'>{page.pageName}</h1>
      <div className='prose prose-slate max-w-none whitespace-pre-wrap'>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown>
      </div>
    </div>
  );
}

