import { cn } from '@/lib/utils';
import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Breaddit',
  description: 'Generated by create next app',
};

interface Props {
  children: React.ReactNode; 
  authModal: React.ReactNode
};

export default function RootLayout( {children, authModal}: Props) {
  return (
    <html lang="en" className={cn("bg-white text-slate-900 antialiased light", inter.className)}>

      <body className="min-h-screen pt-12 bg-slate-50 antialiased">
        <Providers>
          {/* @ts-expect-error server components */}
          <Navbar/>

          {authModal}

          <div className="container max-w-7xl mx-auto h-full pt-12">
            {children}
          </div>

          <Toaster/>
        </Providers>
      </body>
    </html>
  );
};

