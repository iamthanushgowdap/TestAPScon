
'use client';

import {
  GraduationCap,
  School,
  Shield,
  ClipboardCheck,
  CalendarDays,
  FileText,
  BotMessageSquare,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { GoogleIcon, MicrosoftIcon } from '@/components/social-icons';
import { motion } from 'framer-motion';

const roles = [
  { name: 'Student', icon: GraduationCap, href: '/dashboard' },
  { name: 'Faculty', icon: Briefcase, href: '/faculty/dashboard' },
  { name: 'Admin', icon: Shield, href: '/admin/dashboard' },
];

const features = [
  {
    icon: ClipboardCheck,
    title: 'Track Attendance Easily',
    description: 'Monitor your class attendance with a simple, intuitive interface.',
  },
  {
    icon: CalendarDays,
    title: 'Access Timetable & Assignments',
    description: 'Stay organized with your schedule and never miss a deadline.',
  },
  {
    icon: BotMessageSquare,
    title: 'Chat with Cera.AI Instantly',
    description: 'Get instant help from your AI companion for any campus-related questions.',
  },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Side: Carousel */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hidden flex-col justify-center text-foreground md:flex"
        >
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-4xl font-bold">APSConnect</h1>
          </div>
          <p className="mb-8 text-lg text-muted-foreground">
            Your smart campus companion is here.
          </p>
          <Carousel
            opts={{
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {features.map((feature, index) => (
                <CarouselItem key={index}>
                  <Card className="border-none bg-transparent shadow-none">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <feature.icon className="mb-4 h-16 w-16 text-primary" />
                      <h3 className="mb-2 text-2xl font-semibold font-headline">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-[-1rem]" />
            <CarouselNext className="right-[-1rem]" />
          </Carousel>
        </motion.div>

        {/* Right Side: Login */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <Card className="w-full max-w-md mx-auto glassmorphism">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h2 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome to APSConnect
                </h2>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                  Please select your role to continue.
                </p>
              </div>

              <div className="space-y-4">
                {roles.map((role, index) => (
                  <motion.div
                    key={role.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    <Button
                      asChild
                      className="w-full h-14 sm:h-16 text-base sm:text-lg justify-start p-4 hover:scale-[1.02] transition-transform duration-200"
                    >
                      <Link href={role.href}>
                        <role.icon className="mr-4 h-5 w-5 sm:h-6 sm:w-6" />
                        <span>Login as {role.name}</span>
                        <ArrowRight className="ml-auto h-5 w-5" />
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="relative my-6 sm:my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                  <GoogleIcon className="h-6 w-6" />
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                  <MicrosoftIcon className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
