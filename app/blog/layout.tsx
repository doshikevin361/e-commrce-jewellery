import type { Metadata } from 'next';
import { BLOG_SECTION_KEYWORDS, SITE_CANONICAL_URL, SITE_NAME } from '@/lib/site-seo';

export const metadata: Metadata = {
  title: 'Jewellery Blog — Tips, Trends & Stories',
  description:
    `Read the ${SITE_NAME} blog: jewellery styling tips, gold and diamond care, trends, and design stories — ` +
    'so you can shop fine jewellery with confidence at jewelmanas.com.',
  keywords: [...BLOG_SECTION_KEYWORDS],
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    url: `${SITE_CANONICAL_URL}/blog`,
    siteName: SITE_NAME,
    title: `Jewellery Blog | ${SITE_NAME}`,
    description:
      'Jewellery trends, styling ideas, and expert tips from Jewel Manas — your guide to fine gold and diamond jewellery.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Jewellery Blog | ${SITE_NAME}`,
    description: 'Tips, trends, and stories about fine jewellery from Jewel Manas.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
