
'use client';

import { GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-md mx-auto glassmorphism">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-3xl font-bold">APSConnect</h1>
            </div>
            <CardTitle className="font-headline text-2xl tracking-tight">Create an Account</CardTitle>
            <CardDescription>Join the smart campus experience.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full mt-4">
                Register
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
