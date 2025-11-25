import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/components/settings/settings-provider';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/toastify.css';
import { ToastContainer } from 'react-toastify';


const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

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
    <html lang='en' suppressHydrationWarning className='scroll-smooth'>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
          <SettingsProvider>
            <CategoriesProvider>{children}</CategoriesProvider>
          </SettingsProvider>
        </ThemeProvider>
        <ToastContainer
          position='top-center'
          autoClose={3000}
          hideProgressBar
          closeOnClick
          pauseOnHover={false}
          pauseOnFocusLoss={false}
          draggable={false}
          theme='colored'
        />

        <Analytics />
      </body>
    </html>
  );
}
