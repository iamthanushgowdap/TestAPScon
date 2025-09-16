
'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Sidebar, { type NavItem } from './sidebar';

import { 
    LayoutDashboard, Users, Shield, GraduationCap, 
    Bell, BarChart, FileText, UserCheck, Briefcase, 
    Network, CalendarDays, Upload, PieChart, ListTodo, 
    BookCopy, BotMessageSquare, User as UserIcon, LogOut 
} from 'lucide-react';


const studentNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'bx-grid-alt' },
  { href: '/timetable', label: 'Timetable', icon: 'bx-calendar' },
  { href: '/assignments', label: 'Assignments', icon: 'bx-upload' },
  { href: '/attendance', label: 'Attendance', icon: 'bx-pie-chart-alt-2' },
  { href: '/tasks', label: 'Tasks', icon: 'bx-list-check' },
  { href: '/resources', label: 'Resources', icon: 'bx-book-alt' },
  { href: '/chat', label: 'Cera.AI', icon: 'bx-bot' },
];

const facultyNavItems: NavItem[] = [
  { href: '/faculty/dashboard', label: 'Dashboard', icon: 'bx-grid-alt' },
  { href: '/faculty/student-management', label: 'Student Management', icon: 'bx-group' },
  { href: '/faculty/timetable', label: 'Timetable', icon: 'bx-calendar' },
  { href: '/faculty/assignments', label: 'Assignments', icon: 'bx-upload' },
  { href: '/faculty/attendance', label: 'Attendance', icon: 'bx-clipboard' },
  { href: '/chat', label: 'Cera.AI', icon: 'bx-bot' },
];

const adminNavItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'bx-grid-alt' },
  { href: '/admin/approve', label: 'Approve Users', icon: 'bx-user-check' },
  { href: '/admin/user-management', label: 'User Management', icon: 'bx-group' },
  { href: '/admin/faculty-management', label: 'Faculty Management', icon: 'bx-briefcase' },
  { href: '/admin/branch-management', label: 'Branch Management', icon: 'bx-network-chart' },
  { href: '/admin/timetable', label: 'Timetable', icon: 'bx-calendar' },
  { href: '/admin/assignments', label: 'Assignments', icon: 'bx-upload' },
  { href: '/chat', label: 'Cera.AI', icon: 'bx-bot' },
];

const getNavItems = (role?: string | null): NavItem[] => {
    switch(role) {
        case 'admin': return adminNavItems;
        case 'faculty': return facultyNavItems;
        case 'student': return studentNavItems;
        default: return [];
    }
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<{name: string, role: string, job: string} | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if(userDocSnap.exists()) {
                const data = userDocSnap.data();
                setUserData({
                    name: data.name || currentUser.displayName || "User",
                    role: data.role || "student",
                    job: data.role === 'admin' ? "Administrator" : data.role === 'faculty' ? (data.title || "Faculty") : (data.branch || "Student")
                });
            } else {
                 setUserData({
                    name: currentUser.displayName || "User",
                    role: "student",
                    job: "Student"
                 });
            }

        } else {
            setUser(null);
            setUserData(null);
            if (!['/login', '/register', '/'].includes(pathname)) {
                 router.push('/login');
            }
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
        });
        router.push('/login');
    } catch (error) {
        toast({
            title: 'Logout Failed',
            description: 'There was an error logging you out.',
            variant: 'destructive',
        });
    }
  };
  
  if (loading) {
    // You can return a global loader here if you want
    return null;
  }

  // Don't render layout for public pages
  if (!user && !['/login', '/register', '/'].includes(pathname)) {
    return null;
  }
   if (['/login', '/register', '/'].includes(pathname)) {
    return <>{children}</>;
  }

  const navItems = getNavItems(userData?.role);

  return (
    <>
        <Sidebar 
            navItems={navItems}
            userName={userData?.name || "User"}
            userJob={userData?.job || "Role"}
            userImage={user?.photoURL || "https://drive.google.com/uc?export=view&id=1ETZYgPpWbbBtpJnhi42_IR3vOwSOpR4z"}
            onLogout={handleLogout}
        />
        <section className="home-section">
            {children}
        </section>
    </>
  );
}
