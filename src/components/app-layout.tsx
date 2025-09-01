'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BotMessageSquare, BookCopy, LayoutDashboard, ListTodo, GraduationCap, Bell, CalendarClock } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule', label: 'Schedule', icon: CalendarClock },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/resources', label: 'Resources', icon: BookCopy },
  { href: '/chat', label: 'Cera.AI', icon: BotMessageSquare },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="font-headline text-2xl font-bold text-foreground">
              APSConnect
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
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
                <Avatar className="h-9 w-9">
                    <AvatarImage src="https://picsum.photos/100/100" alt="User" data-ai-hint="person avatar" />
                    <AvatarFallback>T</AvatarFallback>
                </Avatar>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
