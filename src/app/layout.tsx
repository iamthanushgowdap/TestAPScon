
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import '@/styles/sidebar.css';
import '@/styles/loader.css';
import '@/styles/animated-search-bar.css';

export const metadata: Metadata = {
  title: 'APSConnect: Cera.AI Companion',
  description: 'Smart Campus, Smarter You.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel='stylesheet' href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

      </head>
      <body className={cn("font-body antialiased min-h-screen", "bg-background")}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
