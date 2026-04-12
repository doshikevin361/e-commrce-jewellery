/**
 * Canonical public site URL for SEO (Open Graph, sitemap, canonical links).
 * Set `NEXT_PUBLIC_SITE_URL=https://jewelmanas.com` in production .env so previews/staging can differ.
 */
export const SITE_CANONICAL_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://jewelmanas.com'
).replace(/\/$/, '');

export const SITE_NAME = 'Jewel Manas';

/** Primary brand + jewellery search terms (India-focused). */
export const DEFAULT_KEYWORDS = [
  SITE_NAME,
  'JewelManas',
  'jewelmanas.com',
  'Jewel Manas jewellery',
  'Jewel Manas jewelry',
  'online jewellery India',
  'online jewelry India',
  'gold jewellery online',
  'diamond jewellery',
  'fine jewellery',
  'certified jewellery',
  'buy jewellery online',
  'jewellery store India',
  'gold rings',
  'necklaces',
  'earrings',
  'bangles',
  'mangalsutra',
  'pendants',
  'solitaire',
  'bridal jewellery',
  'wedding jewellery',
] as const;

export const BLOG_SECTION_KEYWORDS = [
  ...DEFAULT_KEYWORDS,
  'Jewel Manas blog',
  'jewellery tips',
  'jewelry styling',
  'jewellery trends India',
  'how to care for jewellery',
  'gold and diamond guide',
] as const;

export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CANONICAL_URL}${p}`;
}

/** JSON-LD for brand discovery (Google Knowledge Panel / brand queries). */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: ['JewelManas', 'Jewel Manas India', 'jewelmanas.com'],
    url: SITE_CANONICAL_URL,
    description:
      'Jewel Manas is an online jewellery destination offering certified gold, diamond, and fine jewellery with pan-India delivery.',
    sameAs: [],
  };
}
