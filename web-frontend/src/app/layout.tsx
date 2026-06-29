import type { Metadata } from 'next';
import React from 'react';
import { Space_Grotesk, Manrope } from 'next/font/google';
import './globals.css';
import Providers from '@/lib/providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | PECAÊ',
    default: 'PECAÊ - Digital Forge',
  },
  description: 'O maior ecossistema de peças automotivas do Brasil.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${spaceGrotesk.variable} ${manrope.variable}`}>
      <body className="flex flex-col min-h-screen bg-[var(--background)]">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
