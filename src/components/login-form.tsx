
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useState } from 'react';

export interface Role {
  name: 'Student' | 'Faculty' | 'Admin';
  icon: LucideIcon;
  href: string;
}

interface LoginFormProps {
  role: Role;
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});


export function LoginForm({ role }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    const userEmail = values.email.toLowerCase();
    const userPassword = values.password;

    try {
      // Step 1: Authenticate with Firebase Auth first for all roles.
      const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
      const user = userCredential.user;

      // Step 2: Fetch the user's document from Firestore using their UID.
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // Handle cases for pre-seeded admins/faculty who might not have a doc yet.
      if (!userDocSnap.exists()) {
        if (role.name === 'Admin' || role.name === 'Faculty') {
            const userData = {
                email: user.email, // Store email for reference, but UID is primary key
                role: role.name.toLowerCase(),
                status: 'approved',
                createdAt: new Date(),
            };
            await setDoc(userDocRef, userData);
            router.push(role.href);
            return;
        } else {
            // A student should always have a document created at registration.
            throw new Error("Your user profile does not exist. Please contact support.");
        }
      }

      const userDoc = userDocSnap.data();

      // Step 3: Verify role and status.
      if (userDoc.role !== role.name.toLowerCase()) {
        throw new Error(`You are not authorized to log in as ${role.name}.`);
      }
      
      if (userDoc.status !== 'approved') {
          throw new Error("Your account is pending approval from an administrator.");
      }

      // Step 4: Redirect on success.
      router.push(role.href);

    } catch (error: any) {
      let errorMessage = "Invalid credentials or account issue.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
       <div className="text-center">
        <role.icon className="mx-auto h-10 w-10 text-primary mb-2" />
        <h2 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight">
            Login as {role.name}
        </h2>
       </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
