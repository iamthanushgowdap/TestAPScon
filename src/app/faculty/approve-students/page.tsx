
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, UserCheck } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
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
    name: string;
}

export default function ApproveStudentsPage() {
    const [students, setStudents] = useState<PendingStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [permissionError, setPermissionError] = useState(false);

    const fetchStudents = useCallback(async (user: User) => {
        setLoading(true);
        setPermissionError(false);

        try {
            const facultyDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(facultyDocRef);

            if (!docSnap.exists() || docSnap.data().role !== 'faculty') {
                setPermissionError(true);
                toast({
                    title: "Access Denied",
                    description: "You do not have permission to view this page.",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            const facultyBranches = docSnap.data().branch || [];
            if (facultyBranches.length === 0) {
                setStudents([]);
                setLoading(false);
                return;
            }

            const q = query(
                collection(db, "users"),
                where("status", "==", "pending"),
                where("role", "==", "student"),
                where("branch", "in", facultyBranches)
            );
            
            const querySnapshot = await getDocs(q);
            const fetchedStudents: PendingStudent[] = [];
            querySnapshot.forEach((doc) => {
                fetchedStudents.push({ id: doc.id, ...doc.data() } as PendingStudent);
            });
            setStudents(fetchedStudents);

        } catch (error: any) {
            console.error("Error fetching students:", error);
            if (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
                setPermissionError(true);
                toast({
                    title: "Permission Denied",
                    description: "You may not have permission to view pending students.",
                    variant: "destructive"
                });
            } else {
                 toast({
                    title: "Error",
                    description: "Could not fetch students.",
                    variant: "destructive"
                });
            }
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);


    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                fetchStudents(user);
            } else {
                setCurrentUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, [fetchStudents]);

    const handleApproval = async (id: string, newStatus: 'approved' | 'declined') => {
        const studentRef = doc(db, 'users', id);
        try {
            await updateDoc(studentRef, { status: newStatus });
            toast({
                title: `User ${newStatus}`,
                description: `The student account has been successfully ${newStatus}.`,
            });
            // Refetch students after approval
            if(currentUser) {
                fetchStudents(currentUser);
            }
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
                    Review and manage pending registration requests for your branch(es).
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pending Registrations</CardTitle>
                    <CardDescription>
                        The following students have registered and are awaiting approval.
                    </CardDescription>
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
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>USN</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        {permissionError ? "You do not have permission to view pending students." : "No pending students found for your branch(es)."}
                                    </TableCell>
                                </TableRow>
                            )}
                            {students.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell className="font-mono">{student.usn}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{student.branch}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-green-500 hover:bg-green-500/10 hover:text-green-600" onClick={() => handleApproval(student.id, 'approved')}>
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-600" onClick={() => handleApproval(student.id, 'declined')}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
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
