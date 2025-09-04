
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, UserCheck, Search } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged, User } from 'firebase/auth';

type StudentStatus = 'pending' | 'approved' | 'declined';

interface PendingStudent {
    id: string;
    email: string;
    usn: string;
    branch: string;
    status: StudentStatus;
}

export default function ApproveUsersPage() {
    const [students, setStudents] = useState<PendingStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        };

        const q = query(collection(db, "users"), where("status", "==", "pending"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedStudents: PendingStudent[] = [];
             querySnapshot.forEach((doc) => {
                fetchedStudents.push({ id: doc.id, ...doc.data() } as PendingStudent);
            });
            setStudents(fetchedStudents);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching students: ", error);
            toast({ title: "Permission Denied", description: "You may not have permission to view students. Please check your Firestore security rules.", variant: "destructive" });
            setStudents([]);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, toast]);

    const handleApproval = async (id: string, newStatus: 'approved' | 'declined') => {
        const studentRef = doc(db, 'users', id);
        try {
            await updateDoc(studentRef, { status: newStatus });
            toast({
                title: `User ${newStatus}`,
                description: `The student account has been successfully ${newStatus}.`,
            });
        } catch (error) {
            console.error("Error updating status: ", error);
            toast({ title: "Error", description: "Failed to update user status. You may not have permission.", variant: "destructive" });
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground flex items-center gap-2">
                    <UserCheck />
                    Approve New Students
                </h1>
                <p className="text-muted-foreground mt-1">
                    Review and manage pending registration requests.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pending Registrations</CardTitle>
                    <CardDescription>
                        The following students have registered and are awaiting approval.
                    </CardDescription>
                     <div className="relative pt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search by USN, email, or branch..." className="pl-10" />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>USN</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No pending students found or permission denied to view them.
                                    </TableCell>
                                </TableRow>
                            )}
                            {students.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell className="font-mono">{student.usn}</TableCell>
                                    <TableCell>{student.branch}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            student.status === 'pending' ? 'secondary' :
                                            student.status === 'approved' ? 'default' : 'destructive'
                                        } className="capitalize">
                                            {student.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {student.status === 'pending' && (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-green-500 hover:bg-green-500/10 hover:text-green-600" onClick={() => handleApproval(student.id, 'approved')}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-600" onClick={() => handleApproval(student.id, 'declined')}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
