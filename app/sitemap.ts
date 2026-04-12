import type { MetadataRoute } from 'next';
import { blogCards } from '@/lib/blog-posts';
import { SITE_CANONICAL_URL } from '@/lib/site-seo';

/** Public marketing URLs to help Google index jewelmanas.com and the blog. */
const STATIC_PATHS: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/blog', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/jewellery', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/categories', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/gift-guide', priority: 0.65, changeFrequency: 'monthly' },
  { path: '/jewelry-care', priority: 0.65, changeFrequency: 'monthly' },
  { path: '/partner-stores', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/become-member', priority: 0.55, changeFrequency: 'monthly' },
  { path: '/vendors', priority: 0.55, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_CANONICAL_URL}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogCards.map(post => ({
    url: `${SITE_CANONICAL_URL}/blog/${post.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  return [...staticEntries, ...blogEntries];
}
