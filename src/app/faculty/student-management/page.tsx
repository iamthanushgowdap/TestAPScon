
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, GraduationCap, Ticket, Mail, University } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { collection, query, where, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedSearchBar from '@/components/animated-search-bar';


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
    const [permissionError, setPermissionError] = useState(false);
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchStudents = useCallback(async (user: User) => {
        setLoading(true);
        setPermissionError(false);
        setStudents([]);

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
                where("branch", "in", facultyBranches)
            );

            const querySnapshot = await getDocs(q);
            const allStudents: Student[] = [];
            querySnapshot.forEach((doc) => {
                allStudents.push({ id: doc.id, ...doc.data() } as Student);
            });
            setStudents(allStudents);
            setFilteredStudents(allStudents);

        } catch (error: any) {
            console.error("Error fetching students:", error);
            if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
                setPermissionError(true);
                toast({
                    title: "Permission Denied",
                    description: "You do not have permission to view students.",
                    variant: "destructive"
                });
            } else {
                 toast({
                    title: "Error",
                    description: "Could not fetch students.",
                    variant: "destructive"
                });
            }
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
        const results = students.filter(s =>
            (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.usn && s.usn.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredStudents(results);
    }, [searchTerm, students]);

    const renderDesktopView = () => (
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
                {filteredStudents.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            {permissionError ? "You do not have permission to view students." : "No students found for your branch(es)."}
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredStudents.map(student => (
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
    );

    const renderMobileView = () => (
        <div className="space-y-4">
             {filteredStudents.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                     {permissionError ? "You do not have permission to view students." : "No students found for your branch(es)."}
                </div>
            ) : (
                filteredStudents.map(student => (
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
                                         <Badge variant={
                                            student.status === 'pending' ? 'secondary' :
                                            student.status === 'approved' ? 'default' : 'destructive'
                                        } className="capitalize">{student.status}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1 pt-1 border-t">
                                        <p className="flex items-center gap-1.5"><Ticket className="h-4 w-4" /> {student.usn}</p>
                                        <p className="flex items-center gap-1.5"><University className="h-4 w-4" /> {student.branch}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );


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
                        <AnimatedSearchBar
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, or USN..."
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading || !isClient ? (
                        <div className="space-y-4">
                             {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : (
                        isMobile ? renderMobileView() : renderDesktopView()
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
