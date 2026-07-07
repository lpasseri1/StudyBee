import './globals.css';

import { Noto_Sans } from 'next/font/google';

import { ThemeProvider, THEME_INIT_SCRIPT } from '@/lib/theme';
import { ServiceWorkerRegister } from '@/components/shared/service-worker-register';

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap'
});

export const metadata = {
  title: 'StudyBee',
  description:
    'A school app built for students — schedule, grades, and study support in one place.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StudyBee'
  }
};

export const viewport = {
  themeColor: '#f8d348'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={notoSans.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen w-full flex-col font-sans" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
