import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { APP_CONFIG } from '@constel/config';
import './globals.css';

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} - Internship Learning Platform`,
  description: `${APP_CONFIG.tagline} Powered by ${APP_CONFIG.name}.`,
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
