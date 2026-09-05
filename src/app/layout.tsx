import type { Metadata } from 'next';
import { Bebas_Neue, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
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
    <html lang="en" className={`${bebasNeue.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased font-sans bg-[#fbf9f5] text-bakery-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
