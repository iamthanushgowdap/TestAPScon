
'use client';

import { useState } from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usnYear, setUsnYear] = useState('');
  const [usnBranch, setUsnBranch] = useState('');
  const [usnRoll, setUsnRoll] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        toast({
            title: 'Error',
            description: 'Passwords do not match.',
            variant: 'destructive',
        });
        return;
    }
    setLoading(true);

    const usn = `1AP${usnYear}${usnBranch}${usnRoll}`;
    const userEmail = email.toLowerCase(); // Convert email to lowercase

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userEmail, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email, // Use the email from the created user which is already lowercase
        usn: usn,
        role: 'student',
        status: 'pending',
        branch: usnBranch,
        year: `20${usnYear}`,
        createdAt: new Date(),
      });

      toast({
        title: 'Registration Successful!',
        description: 'Your account has been created. Please wait for admin approval to log in.',
      });
      router.push('/login');
    } catch (error: any) {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast({
            title: 'Registration Failed',
            description: errorMessage,
            variant: 'destructive',
        });
        console.error(`${errorCode}: ${errorMessage}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-lg mx-auto glassmorphism">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-3xl font-bold">APSConnect</h1>
            </div>
            <CardTitle className="font-headline text-2xl tracking-tight">Create a Student Account</CardTitle>
            <CardDescription>Join the smart campus experience.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>USN (University Seat Number)</Label>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-md bg-muted text-muted-foreground font-mono">1AP</span>
                        <Input 
                            id="usn-year" 
                            type="text" 
                            placeholder="YY" 
                            maxLength={2} 
                            required
                            value={usnYear}
                            onChange={(e) => setUsnYear(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-16 text-center"
                        />
                        <Input 
                            id="usn-branch" 
                            type="text" 
                            placeholder="CS" 
                            maxLength={3} 
                            required
                            value={usnBranch}
                            onChange={(e) => setUsnBranch(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
                             className="w-20 text-center"
                        />
                        <Input 
                            id="usn-roll" 
                            type="text" 
                            placeholder="001" 
                            maxLength={3} 
                            required
                            value={usnRoll}
                            onChange={(e) => setUsnRoll(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-24 text-center"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>

                <Button type="submit" className="w-full mt-4" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
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
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
