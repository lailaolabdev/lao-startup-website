import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { cookies } from 'next/headers';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { LanguageProvider, Language } from '@/context/LanguageContext';

const notoLaos = localFont({
  src: [
    {
      path: '../../public/fonts/NotoSans-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/NotoSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/NotoSans-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
  ],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'MSIC - MSME and Startup Innovation Center',
  description:
    'MSIC is the government business incubation center for MSMEs and startups under the Ministry of Industry and Commerce in Lao PDR.',
  keywords: 'MSIC, MSME and Startup Innovation Center, Laos MSME, Lao Startup, business incubation, Ministry of Industry and Commerce',
  robots: 'index, follow',
  icons: {
    icon: '/msic-logo.jpg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Language) || 'EN';

  return (
    <html lang={lang.toLowerCase()} className="h-full bg-slate-950 text-white scroll-smooth">
      <body className={`${notoLaos.className} min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased`}>
        {/* Google Analytics Script */}
        <GoogleAnalytics />

        <LanguageProvider initialLang={lang}>
          {/* Global Navigation Header */}
          <Header />

          {/* Page Main Content Area */}
          <main className="flex-1 flex flex-col -mt-16">{children}</main>

          {/* Global Footer */}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
