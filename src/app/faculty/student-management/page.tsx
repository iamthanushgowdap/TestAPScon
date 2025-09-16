
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
    const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
    const [filteredAllStudents, setFilteredAllStudents] = useState<Student[]>([]);
    const [filteredPendingStudents, setFilteredPendingStudents] = useState<Student[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [permissionError, setPermissionError] = useState(false);
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchStudents = useCallback(async (user: User) => {
        setLoading(true);
        setPermissionError(false);
        setAllStudents([]);
        setPendingStudents([]);

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

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const all: Student[] = [];
                const pending: Student[] = [];
                querySnapshot.forEach((doc) => {
                    const student = { id: doc.id, ...doc.data() } as Student;
                    all.push(student);
                    if (student.status === 'pending') {
                        pending.push(student);
                    }
                });
                setAllStudents(all);
                setPendingStudents(pending);
                setFilteredAllStudents(all);
                setFilteredPendingStudents(pending);
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
        const source = activeTab === 'all' ? allStudents : pendingStudents;
        const results = source.filter(s =>
            (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.usn && s.usn.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (activeTab === 'all') {
            setFilteredAllStudents(results);
        } else {
            setFilteredPendingStudents(results);
        }
    }, [searchTerm, allStudents, pendingStudents, activeTab]);
    
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

    const PendingApprovalView = () => (
         <>
            {isMobile ? (
                 <div className="space-y-4">
                    {filteredPendingStudents.map(student => (
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
                                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                            </div>
                                            <Badge variant="secondary" className="capitalize">{student.status}</Badge>
                                        </div>
                                         <div className="text-sm text-muted-foreground space-y-1 pt-1 border-t">
                                            <p className="flex items-center gap-1.5"><Ticket className="h-4 w-4" /> {student.usn}</p>
                                            <p className="flex items-center gap-1.5"><University className="h-4 w-4" /> {student.branch}</p>
                                        </div>
                                        <div className="flex gap-2 justify-end pt-2">
                                            <Button size="sm" variant="outline" className="text-green-500 border-green-500/50 hover:bg-green-500/10 hover:text-green-600 flex-1" onClick={() => handleApproval(student.id, 'approved')}>
                                                <Check className="mr-2 h-4 w-4" /> Approve
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-600 flex-1" onClick={() => handleApproval(student.id, 'declined')}>
                                                <X className="mr-2 h-4 w-4" /> Decline
                                            </Button>
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
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPendingStudents.map(student => (
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
             {filteredPendingStudents.length === 0 && <div className="text-center text-muted-foreground py-8">No pending students found.</div>}
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
                    View all students and approve pending registrations for your branch(es).
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                            <div>
                                <CardTitle>Student Lists</CardTitle>
                                <CardDescription>Switch between all students and those pending approval.</CardDescription>
                                <TabsList className="mt-4">
                                    <TabsTrigger value="all">
                                        <Users className="mr-2 h-4 w-4" />
                                        All Students
                                    </TabsTrigger>
                                    <TabsTrigger value="pending" className="relative">
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Pending Approval
                                        {pendingStudents.length > 0 && (
                                            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                                                {pendingStudents.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                </TabsList>
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
                            <>
                                <TabsContent value="all">
                                    <AllStudentsView />
                                </TabsContent>
                                <TabsContent value="pending">
                                    <PendingApprovalView />
                                </TabsContent>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}
