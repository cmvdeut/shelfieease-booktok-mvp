import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWAInstall from '@/components/PWAInstall';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'ShelfieEase - Your Digital Bookshelf',
  description: 'Scan, collect, and track your reading journey. The perfect companion for BookTok enthusiasts and bibliophiles.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ShelfieEase',
  },
  openGraph: {
    title: 'ShelfieEase - Your Digital Bookshelf',
    description: 'Scan, collect, and track your reading journey.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F0F1A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased">
        {children}
        <PWAInstall />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
