
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { collection, query, where, doc, onSnapshot, getDoc, Unsubscribe } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged, User } from 'firebase/auth';

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
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [facultyBranches, setFacultyBranches] = useState<string[]>([]);
    const [permissionError, setPermissionError] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribeAuth();
    }, []);

    // Effect to fetch faculty's branches
    useEffect(() => {
        if (!currentUser) return;

        const fetchFacultyData = async () => {
            const facultyDocRef = doc(db, 'users', currentUser.uid);
            try {
                const docSnap = await getDoc(facultyDocRef);
                if (docSnap.exists() && docSnap.data().role === 'faculty') {
                    const branches = docSnap.data().branch || [];
                    setFacultyBranches(Array.isArray(branches) ? branches : [branches]);
                } else {
                     setPermissionError(true);
                }
            } catch (e) {
                 setPermissionError(true);
            }
        };

        fetchFacultyData();
    }, [currentUser]);
    
    // Effect to fetch students based on faculty's branches
    useEffect(() => {
        if (!currentUser || facultyBranches.length === 0) {
            if (permissionError) {
                toast({
                    title: "Access Denied",
                    description: "You do not have permission to view students.",
                    variant: "destructive"
                });
            }
            setLoading(false);
            return;
        };

        const unsubscribes: Unsubscribe[] = [];
        const allStudents: Record<string, Student> = {};

        facultyBranches.forEach(branch => {
            const q = query(
                collection(db, "users"),
                where("role", "==", "student"),
                where("branch", "==", branch)
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    allStudents[doc.id] = { id: doc.id, ...doc.data() } as Student;
                });
                setStudents(Object.values(allStudents));
                setLoading(false);
                setPermissionError(false);
            }, (error) => {
                console.error(`Error fetching students for branch ${branch}:`, error);
                if (error.message.includes('permission-denied')) {
                    setPermissionError(true);
                    toast({
                        title: "Permission Denied",
                        description: `Could not fetch students for branch: ${branch}.`,
                        variant: "destructive"
                    });
                }
                setLoading(false);
            });
            unsubscribes.push(unsubscribe);
        });
        
        // If there are branches, don't show loading forever if they are all empty
        if (facultyBranches.length > 0) {
            setLoading(false);
        }

        return () => unsubscribes.forEach(unsub => unsub());

    }, [currentUser, facultyBranches, toast, permissionError]);

    // Effect for search filtering
     useEffect(() => {
        const results = students.filter(s =>
            (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.usn && s.usn.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredStudents(results);
    }, [searchTerm, students]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground flex items-center gap-2">
                    <Users />
                    Student Management
                </h1>
                <p className="text-muted-foreground mt-1">
                    View all students assigned to your branch(es).
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Students</CardTitle>
                    <CardDescription>
                        A complete list of all students in your branch(es).
                    </CardDescription>
                    <div className="relative pt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name, email, or USN..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
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
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>USN</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        {permissionError ? "You do not have permission to view students." : "No students found for your branch(es)."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell className="font-mono">{student.usn}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{student.branch}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            student.status === 'pending' ? 'secondary' :
                                            student.status === 'approved' ? 'default' : 'destructive'
                                        } className="capitalize">
                                            {student.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
