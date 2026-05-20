import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Nav from '@/components/Nav';
import './globals.css';
import './print.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rental Planner',
  description: 'Kleinschalige verhuurplanning: klussen, materiaal en documenten',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={`${geist.className} min-h-screen bg-zinc-50 text-zinc-900 antialiased`}>
        <Nav />
        <main className="mx-auto max-w-5xl px-4 py-6 print:max-w-none print:p-0">{children}</main>
      </body>
    </html>
  );
}
