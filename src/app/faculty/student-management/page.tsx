
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, GraduationCap, Ticket, Mail, University, UserCheck, Check, X } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, doc, getDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedSearchBar from '@/components/animated-search-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

type StudentStatus = 'pending' | 'approved' | 'declined';

interface Student {
    id: string;
    email: string;
    usn: string;
    branch: string;
    status: StudentStatus;
    name: string;
}

export default function StudentManagementPage() {
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [filteredAllStudents, setFilteredAllStudents] = useState<Student[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [permissionError, setPermissionError] = useState(false);
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchStudents = useCallback(async (user: User) => {
        setLoading(true);
        setPermissionError(false);
        setAllStudents([]);

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
                setLoading(false);
                return;
            }

            const q = query(
                collection(db, "users"),
                where("role", "==", "student"),
                where("branch", "in", facultyBranches),
                where("status", "==", "approved") // Only fetch approved students
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const all: Student[] = [];
                querySnapshot.forEach((doc) => {
                    all.push({ id: doc.id, ...doc.data() } as Student);
                });
                setAllStudents(all);
                setFilteredAllStudents(all);
                setLoading(false);
            }, (error) => {
                 console.error("Error fetching students:", error);
                 if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
                     setPermissionError(true);
                 }
                 setLoading(false);
            });
            
            return unsubscribe;

        } catch (error: any) {
            console.error("Error setting up student fetch:", error);
            setPermissionError(true);
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


    useEffect(() => {
        const results = allStudents.filter(s =>
            (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.usn && s.usn.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredAllStudents(results);
    }, [searchTerm, allStudents]);

    const AllStudentsView = () => (
        <>
            {isMobile ? (
                <div className="space-y-4">
                    {filteredAllStudents.map(student => (
                        <Card key={student.id} className="glassmorphism">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} alt={student.name} />
                                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{student.name}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{student.email}</p>
                                            </div>
                                            <Badge variant={student.status === 'approved' ? 'default' : 'secondary'} className="capitalize">{student.status}</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1 pt-1 border-t">
                                            <p className="flex items-center gap-1.5"><Ticket className="h-4 w-4" /> {student.usn}</p>
                                            <p className="flex items-center gap-1.5"><University className="h-4 w-4" /> {student.branch}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>USN</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAllStudents.map(student => (
                            <TableRow key={student.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} alt={student.name} />
                                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{student.name}</div>
                                            <div className="text-muted-foreground text-xs">{student.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono">{student.usn}</TableCell>
                                <TableCell><Badge variant="outline">{student.branch}</Badge></TableCell>
                                <TableCell>
                                    <Badge variant={student.status === 'approved' ? 'default' : student.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">{student.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            {filteredAllStudents.length === 0 && <div className="text-center text-muted-foreground py-8">No students found.</div>}
        </>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground flex items-center gap-2">
                    <Users />
                    Student Management
                </h1>
                <p className="text-muted-foreground mt-1">
                    View all approved students in your assigned branch(es).
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                        <div>
                            <CardTitle>Approved Students</CardTitle>
                            <CardDescription>A list of all active students in your branches.</CardDescription>
                        </div>
                        <div className="relative pt-2 w-full sm:w-auto">
                            <AnimatedSearchBar
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, email, or USN..."
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     {loading || !isClient ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : permissionError ? (
                        <div className="text-center text-destructive py-8">
                            You do not have sufficient permissions to view students.
                        </div>
                    ) : (
                        <AllStudentsView />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
