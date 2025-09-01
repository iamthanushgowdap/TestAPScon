
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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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

const studentSchema = z.object({
  usn: z.string().min(1, 'USN is required').regex(/^1AP\d{2}[A-Z]{2,3}\d{3}$/, 'Invalid USN format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const facultyAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginForm({ role }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isStudent = role.name === 'Student';
  const schema = isStudent ? studentSchema : facultyAdminSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: isStudent ? { usn: '', password: '' } : { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    try {
      let userCredential;
      let userDoc;

      if (isStudent) {
        const studentValues = values as z.infer<typeof studentSchema>;
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("usn", "==", studentValues.usn.toUpperCase()));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error("No account found with this USN.");
        }
        const userDocSnap = querySnapshot.docs[0];
        const userData = userDocSnap.data();
        
        userCredential = await signInWithEmailAndPassword(auth, userData.email, studentValues.password);
        userDoc = { id: userDocSnap.id, ...userData };
      } else {
        const adminValues = values as z.infer<typeof facultyAdminSchema>;
        userCredential = await signInWithEmailAndPassword(auth, adminValues.email, adminValues.password);
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
             // Create a user doc if it doesn't exist (for pre-seeded admins/faculty)
             const adminData = {
                email: adminValues.email,
                role: role.name.toLowerCase(),
                status: 'approved',
                createdAt: new Date(),
            };
            await setDoc(userDocRef, adminData);
            userDoc = { id: userDocRef.id, ...adminData };
        } else {
            userDoc = { id: userDocSnap.id, ...userDocSnap.data() };
        }
      }

      if (userDoc.role !== role.name.toLowerCase()) {
        throw new Error(`You are not authorized to log in as ${role.name}.`);
      }
      
      if (userDoc.status !== 'approved') {
          throw new Error("Your account is pending approval from an administrator.");
      }

      router.push(role.href);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials or account issue.",
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
          {isStudent ? (
            <FormField
              control={form.control}
              name="usn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>USN (e.g., 1AP23CS001)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full USN" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
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
          )}
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
