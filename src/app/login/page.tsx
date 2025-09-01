
'use client';

import { useState } from 'react';
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
  ChevronLeft,
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
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm, Role } from '@/components/login-form';

const roles: Role[] = [
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
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

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
          className="overflow-hidden"
        >
          <Card className="w-full max-w-md mx-auto glassmorphism">
            <CardContent className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {selectedRole ? (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button onClick={handleBack} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                    </button>
                    <LoginForm role={selectedRole} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="role-selection"
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                  >
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
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                        >
                          <Button
                            onClick={() => handleRoleSelect(role)}
                            className="w-full h-14 sm:h-16 text-base sm:text-lg justify-start p-4 hover:scale-[1.02] transition-transform duration-200"
                          >
                            <role.icon className="mr-4 h-5 w-5 sm:h-6 sm:w-6" />
                            <span>Login as {role.name}</span>
                            <ArrowRight className="ml-auto h-5 w-5" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-medium text-primary hover:underline">
                                Register
                            </Link>
                        </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
