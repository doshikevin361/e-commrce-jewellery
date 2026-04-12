import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/components/settings/settings-provider';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { WebsiteLayout } from '@/components/layout/website-layout';
import { CustomerAuthHandler } from '@/components/layout/customer-auth-handler';
import { ScrollToTop } from '@/components/scroll-to-top';
import { PublicThemeLoader } from '@/components/theme/public-theme-loader';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { DEFAULT_KEYWORDS, SITE_CANONICAL_URL, SITE_NAME, organizationJsonLd } from '@/lib/site-seo';

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});


const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['monospace'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CANONICAL_URL),
  title: {
    default: `${SITE_NAME} | Premium Jewellery Online India`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    `${SITE_NAME} — Shop certified gold, diamond, and fine jewellery online. Free delivery, easy exchange, ` +
    'and elegant designs for every occasion. Explore rings, necklaces, earrings, bangles, and more at jewelmanas.com.',
  keywords: [...DEFAULT_KEYWORDS],
  authors: [{ name: SITE_NAME, url: SITE_CANONICAL_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_CANONICAL_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Premium Jewellery Online`,
    description:
      'Certified jewellery, free shipping, and design-led collections — gold, diamond, and everyday elegance at Jewel Manas.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Premium Jewellery Online India`,
    description:
      'Shop certified gold & diamond jewellery online. Free delivery, easy exchange, lifetime service.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geist.className} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
          <PublicThemeLoader />
          <SettingsProvider>
            <CustomerAuthHandler />
            <CategoriesProvider>
              <CartProvider>
                <WishlistProvider>
                  <ScrollToTop />
                  <WebsiteLayout>{children}</WebsiteLayout>
                </WishlistProvider>
              </CartProvider>
            </CategoriesProvider>
          </SettingsProvider>
        </ThemeProvider>
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1F3B29',
              border: '1px solid #E6D3C2',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
