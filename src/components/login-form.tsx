
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

export interface Role {
  name: 'Student' | 'Faculty' | 'Admin';
  icon: LucideIcon;
  href: string;
}

interface LoginFormProps {
  role: Role;
}

const studentSchema = z.object({
  usn: z.string().min(1, 'USN is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const facultyAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginForm({ role }: LoginFormProps) {
  const router = useRouter();
  const isStudent = role.name === 'Student';
  const schema = isStudent ? studentSchema : facultyAdminSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: isStudent ? { usn: '', password: '' } : { email: '', password: '' },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    console.log(values);
    // On successful login, navigate to the role's dashboard
    router.push(role.href);
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
                  <FormLabel>USN</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your USN" {...field} />
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
          <Button type="submit" className="w-full">
            Login
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
