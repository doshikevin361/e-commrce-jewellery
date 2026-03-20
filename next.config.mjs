/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Puppeteer + serverless Chromium: keep out of webpack bundle for Vercel
  serverExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig
