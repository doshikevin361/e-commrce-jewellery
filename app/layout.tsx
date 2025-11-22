import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/components/settings/settings-provider';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/toastify.css';
import { ToastContainer } from 'react-toastify';


const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-commerce Admin Dashboard',
  description: 'Modern admin dashboard for e-commerce management',
  icons: {
    icon: [
      {
        url: '',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '',
        type: 'image/svg+xml',
      },
    ],
    apple: '',
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
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
          <SettingsProvider>{children}</SettingsProvider>
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
