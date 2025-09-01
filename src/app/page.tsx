
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '@/components/splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, determine role and redirect.
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.status === 'approved') {
            switch (userData.role) {
              case 'admin':
                router.replace('/admin/dashboard');
                break;
              case 'faculty':
                router.replace('/faculty/dashboard');
                break;
              default:
                router.replace('/dashboard');
                break;
            }
          } else {
            // Not approved, send to login to show pending message
            router.replace('/login');
          }
        } else {
            // No user document, maybe pre-seeded admin/faculty
            router.replace('/login');
        }
      } else {
        // User is signed out, show splash and then go to login.
        const timer = setTimeout(() => {
          router.replace('/login');
        }, 2500); // Display splash screen for 2.5 seconds
        return () => clearTimeout(timer);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <SplashScreen />;
}
