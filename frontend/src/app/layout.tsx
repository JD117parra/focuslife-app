import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FocusLife - Personal Productivity & Life Management',
  description:
    'Boost your productivity with FocusLife - the all-in-one app for task management, habit tracking, and personal finance monitoring. Organize your life, build positive habits, and achieve your goals.',
  keywords: [
    'productivity app',
    'task management',
    'habit tracker',
    'personal finance',
    'goal tracking',
    'life organization',
    'daily planner',
    'habit building',
    'expense tracker',
    'productivity tools',
  ],
  authors: [{ name: 'JD Parra' }],
  creator: 'JD Parra',
  publisher: 'FocusLife',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://focuslife.app',
    title: 'FocusLife - Personal Productivity & Life Management',
    description:
      'Boost your productivity with FocusLife - the all-in-one app for task management, habit tracking, and personal finance monitoring.',
    siteName: 'FocusLife',
  },
  twitter: {
    card: 'summary',
    title: 'FocusLife - Personal Productivity & Life Management',
    description:
      'Boost your productivity with FocusLife - the all-in-one app for task management, habit tracking, and personal finance monitoring.',
    creator: '@focuslife_app',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  category: 'productivity',
};

// Viewport debe ser exportado por separado en Next.js 15
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
