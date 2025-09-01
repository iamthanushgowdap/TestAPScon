
'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BotMessageSquare, LayoutDashboard, Users, Shield, Database, Megaphone, GraduationCap, Bell, BarChart, FileText, UserCheck, User as UserIcon, LogOut } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/approve', label: 'Approve Users', icon: UserCheck },
  { href: '#', label: 'User Management', icon: Users },
  { href: '#', label: 'Security', icon: Shield },
  { href: '#', label: 'Database', icon: Database },
  { href: '#', label: 'Analytics', icon: BarChart },
  { href: '#', label: 'Reports', icon: FileText },
  { href: '#', label: 'Announcements', icon: Megaphone },
  { href: '/chat', label: 'Cera.AI', icon: BotMessageSquare },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
            router.push('/login');
        } else {
            setUser(currentUser)
        }
    });
    return () => unsubscribe();
  }, [router]);

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


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="font-headline text-2xl font-bold text-foreground">
              APSConnect
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b md:justify-end">
            <SidebarTrigger className="md:hidden" />
            <div className='flex items-center gap-4'>
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className='sr-only'>Notifications</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer">
                        <AvatarImage src={user?.photoURL || "https://picsum.photos/100/100" } alt="User" data-ai-hint="person avatar" />
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile?role=admin">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BotMessageSquare className="mr-2 h-4 w-4" />
                      <span>Cera.AI Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background">
            {children}
        </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
