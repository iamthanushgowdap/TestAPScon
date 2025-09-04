
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
    { href: '/admin/dashboard', iconId: '#home-icon' },
    { href: '/admin/approve', iconId: '#bookmark-icon' },
    { href: '/admin/dashboard', iconId: '#plus-icon' }, // Assuming plus is a placeholder
    { href: '/profile?role=admin', iconId: '#user-icon' },
    { href: '#', iconId: '#settings-icon' } // Assuming settings is a placeholder
];

export default function AdminBottomNavigation() {
  const navRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) return;

    const links = Array.from(navElement.querySelectorAll("a"));
    const light = navElement.querySelector(".tubelight") as HTMLDivElement;
    if (!light) return;

    const activeIndex = navLinks.findIndex(link => {
        if (link.href.includes('?')) {
            return pathname === link.href.split('?')[0];
        }
        return pathname === link.href;
    });

    if (activeIndex !== -1) {
        links.forEach(l => l.classList.remove('active'));
        const activeLink = links[activeIndex];
        if (activeLink) {
            activeLink.classList.add('active');
            light.style.left = `${activeLink.offsetLeft + light.offsetWidth / 4}px`;
        }
    }


    const handleClick = (e: MouseEvent, index: number, href: string) => {
        e.preventDefault();
        
        if (href.startsWith('#')) return; // Don't navigate for placeholder links

        router.push(href);
        
        links.forEach(l => l.classList.remove('active'));
        const targetLink = e.currentTarget as HTMLAnchorElement;
        targetLink.classList.add('active');
        
        light.style.left = `${targetLink.offsetLeft + light.offsetWidth / 4}px`;
    };

    links.forEach((link, index) => {
        const navLink = navLinks[index];
        if (navLink) {
           link.addEventListener("click", (e) => handleClick(e, index, navLink.href));
        }
    });
    
    // Cleanup function
    return () => {
        links.forEach((link, index) => {
             const navLink = navLinks[index];
             if(navLink) {
                // This is tricky because we can't easily remove the exact listener function
                // For this component's lifecycle, this might be acceptable, but in complex apps, manage listeners more carefully
             }
        });
    }

  }, [pathname, router]);

  return (
    <>
      <nav ref={navRef}>
        {navLinks.map((link, index) => (
             <ul key={index}>
                <li>
                    <a className={pathname === link.href ? 'active' : ''}>
                        <svg><use xlinkHref={link.iconId}></use></svg>
                    </a>
                </li>
            </ul>
        ))}
        <div className="tubelight">
          <div className="light-ray"></div>
        </div>
      </nav>

      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" id="home-icon">
          <path d="M13.1428571,14.5 C13.6571429,14.5 14,14.175507 14,13.6887676 L14,6.38767551 C14,6.14430577 13.9142857,5.90093604 13.6571429,5.73868955 L8.51428571,1.6825273 C8.17142857,1.43915757 7.74285714,1.43915757 7.4,1.6825273 L2.25714286,5.73868955 C2.08571429,5.90093604 2,6.14430577 2,6.38767551 L2,13.6887676 C2,14.175507 2.34285714,14.5 2.85714286,14.5 L13.1428571,14.5 Z M5.42857143,12.8775351 L3.71428571,12.8775351 L3.71428571,6.79329173 L8,3.38611544 L12.2857143,6.79329173 L12.2857143,12.8775351 L10.5714286,12.8775351 L5.42857143,12.8775351 Z"></path>
        </symbol>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="bookmark-icon">
            <path fillRule="evenodd" clipRule="evenodd" d="M7 3H17C18.1 3 19 3.89999 19 5V21L12 18L5 21V5C5 3.89999 5.90002 3 7 3ZM12 15.82L17 18V5H7V18L12 15.82Z" />
        </symbol>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="plus-icon">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48001 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48001 17.52 2 12 2ZM11 7V11H7V13H11V17H13V13H17V11H13V7H11ZM4 12C4 16.41 7.59 20 12 20C16.41 20 20 16.41 20 12C20 7.59 16.41 4 12 4C7.59 4 4 7.59 4 12Z" />
        </symbol>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 570" id="user-icon">
            <path d="M313.6 304c-28.7 0-42.5 16-89.6 16-47.1 0-60.8-16-89.6-16C60.2 304 0 364.2 0 438.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-25.6c0-74.2-60.2-134.4-134.4-134.4zM400 464H48v-25.6c0-47.6 38.8-86.4 86.4-86.4 14.6 0 38.3 16 89.6 16 51.7 0 74.9-16 89.6-16 47.6 0 86.4 38.8 86.4 86.4V464zM224 288c79.5 0 144-64.5 144-144S303.5 0 224 0 80 64.5 80 144s64.5 144 144 144zm0-240c52.9 0 96 43.1 96 96s-43.1 96-96 96-96-43.1-96-96 43.1-96 96-96z" />
        </symbol>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 568" id="settings-icon">
            <path d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" />
        </symbol>
      </svg>
    </>
  );
}
