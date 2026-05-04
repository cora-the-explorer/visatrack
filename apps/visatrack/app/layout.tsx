import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'visatrack — Get Your O-1 Visa Without Losing 6 Months and $25K',
    template: '%s · visatrack',
  },
  description:
    'For DJs, creators, and influencers. We scan your Instagram, TikTok, and press in 3 minutes and tell you exactly what evidence USCIS wants — then hand-build the dossier your lawyer files.',
  metadataBase: new URL('https://visatrack.io'),
  openGraph: {
    title: 'visatrack — The O-1 visa for the internet generation',
    description:
      'Free Instagram scan. USCIS-grade evidence scorecard. Done-for-you O-1 dossier.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
