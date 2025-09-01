'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '@/components/splash-screen';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2500); // Display splash screen for 2.5 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
