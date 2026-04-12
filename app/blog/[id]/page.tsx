import type { Metadata } from 'next';
import { BlogDetailPage } from '@/components/blog/blog-detail-page';
import { blogCards } from '@/lib/blog-posts';
import { BLOG_SECTION_KEYWORDS, SITE_CANONICAL_URL, SITE_NAME } from '@/lib/site-seo';

export function generateStaticParams() {
  return blogCards.map(post => ({ id: String(post.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const blog = blogCards.find(b => b.id.toString() === id);

  if (!blog) {
    return {
      title: 'Article',
      robots: { index: false, follow: true },
    };
  }

  const description = blog.desc.length > 160 ? `${blog.desc.slice(0, 157)}…` : blog.desc;
  const canonicalPath = `/blog/${id}`;

  return {
    title: blog.title,
    description,
    keywords: [...BLOG_SECTION_KEYWORDS, blog.category, 'Jewel Manas blog', blog.title],
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'article',
      url: `${SITE_CANONICAL_URL}${canonicalPath}`,
      siteName: SITE_NAME,
      title: `${blog.title} | ${SITE_NAME} Blog`,
      description,
      images: [{ url: blog.img, alt: blog.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${blog.title} | ${SITE_NAME}`,
      description,
      images: [blog.img],
    },
  };
}

export default async function BlogDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <BlogDetailPage blogId={id} />;
}
