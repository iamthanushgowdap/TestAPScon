
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Bookmark, PlusSquare, User, Settings, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/styles/bottom-navigation.css';

const navItems = [
  { href: '/dashboard', icon: Home, id: 'home-icon' },
  { href: '/timetable', icon: CalendarDays, id: 'timetable-icon' },
  { href: '/tasks', icon: PlusSquare, id: 'plus-icon' },
  { href: '/profile?role=student', icon: User, id: 'user-icon' },
  { href: '/chat', icon: Settings, id: 'settings-icon' },
];

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const tubelightRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const activeIndex = navItems.findIndex(item => {
    if (item.href.includes('?')) {
        return pathname === item.href.split('?')[0];
    }
    return pathname === item.href
  });

  useEffect(() => {
    const navElement = navRef.current;
    if (navElement && activeIndex !== -1 && tubelightRef.current) {
      const activeLink = navElement.querySelectorAll('a')[activeIndex];
      if (activeLink) {
        tubelightRef.current.style.left = `${activeLink.offsetLeft + tubelightRef.current.offsetWidth / 2}px`;
      }
    }
  }, [activeIndex, pathname]);

  const handleNavClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(href);
  };

  return (
      <nav ref={navRef} className="bottom-nav">
        {navItems.map((item, index) => (
          <ul key={item.id}>
            <li>
              <a
                onClick={(e) => handleNavClick(item.href, e)}
                className={cn({ active: activeIndex === index })}
                aria-label={item.id.replace('-icon', '')}
              >
                <item.icon />
              </a>
            </li>
          </ul>
        ))}
        <div className="tubelight" ref={tubelightRef}>
          <div className="light-ray"></div>
        </div>
      </nav>
  );
}
