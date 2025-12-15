import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/components/settings/settings-provider';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { WebsiteLayout } from '@/components/layout/website-layout';
import { ScrollToTop } from '@/components/scroll-to-top';
import './globals.css';
import { Toaster } from 'react-hot-toast';

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
  title: 'LuxeLoom - Exquisite Jewelry Collection',
  description: 'Discover our complete collection of exquisite jewelry. Handcrafted pieces for every occasion.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  generator: 'v0.app',
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
          <SettingsProvider>
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
        <Analytics />
      </body>
    </html>
  );
}
