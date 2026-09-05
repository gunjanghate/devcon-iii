import type { Metadata } from 'next';
import { Syne, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "Ramesh's Bakery - The Uncopyable Loyalty Card",
  description: "Tamper-proof digital punch card for Ramesh's Artisan Bakery. 10 stamps, 1 free cake.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased font-sans bg-bakery-50 text-bakery-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
