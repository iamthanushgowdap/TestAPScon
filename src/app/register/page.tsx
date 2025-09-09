
'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Branch {
    id: string;
    name: string;
}

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usnYear, setUsnYear] = useState('');
  const [usnRoll, setUsnRoll] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
        try {
            const q = query(collection(db, "branches"), where("status", "==", "online"));
            const querySnapshot = await getDocs(q);
            const fetchedBranches: Branch[] = [];
            querySnapshot.forEach(doc => {
                fetchedBranches.push({ id: doc.id, name: doc.data().name } as Branch);
            });
            setBranches(fetchedBranches);
        } catch (error) {
            console.error("Error fetching branches: ", error);
            toast({
                title: "Error",
                description: "Could not load branches. Please try again later.",
                variant: "destructive"
            });
        } finally {
            setLoadingBranches(false);
        }
    };
    fetchBranches();
  }, [toast]);


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
     if (!selectedBranch) {
        toast({ title: 'Error', description: 'Please select a branch.', variant: 'destructive' });
        return;
    }
    setLoading(true);

    const usn = `1AP${usnYear}${selectedBranch.toUpperCase()}${usnRoll}`;
    const userEmail = email.toLowerCase();

    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, userEmail, password);
      const user = userCredential.user;
      
      // Step 1.5: Update Firebase Auth profile with display name
      await updateProfile(user, {
        displayName: name,
      });

      // Step 2: Create a corresponding user document in Firestore with the user's UID as the document ID
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: userEmail,
        usn: usn,
        role: 'student',
        status: 'pending',
        branch: selectedBranch,
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
        let errorMessage = error.message;
        if (errorCode === 'auth/email-already-in-use') {
            errorMessage = 'This email address is already registered. Please login instead.';
        }
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
        className="w-full max-w-lg"
      >
        <Card className="mx-auto glassmorphism">
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
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" placeholder="Your full name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>USN (University Seat Number)</Label>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-md bg-muted text-muted-foreground font-mono text-sm">1AP</span>
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
                         <span className="p-2 rounded-md bg-muted text-muted-foreground font-mono text-sm">{selectedBranch.substring(0,2) || '..'}</span>
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
                    <Label htmlFor="branch">Branch</Label>
                    <Select onValueChange={setSelectedBranch} value={selectedBranch}>
                        <SelectTrigger id="branch" disabled={loadingBranches}>
                            <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select your branch"} />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map(branch => (
                                <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input id="confirm-password" type="password" placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={loading || loadingBranches}>
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
