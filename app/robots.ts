import type { MetadataRoute } from 'next';
import { SITE_CANONICAL_URL } from '@/lib/site-seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_CANONICAL_URL}/sitemap.xml`,
    host: SITE_CANONICAL_URL,
  };
}
