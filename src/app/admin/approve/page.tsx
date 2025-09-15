
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, UserCheck, Search, Mail, University, Ticket } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { collection, query, where, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedSearchBar from '@/components/animated-search-bar';


type StudentStatus = 'pending' | 'approved' | 'declined';

interface PendingStudent {
    id: string;
    email: string;
    usn: string;
    branch: string;
    status: StudentStatus;
    name: string;
}

export default function ApproveUsersPage() {
    const [students, setStudents] = useState<PendingStudent[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<PendingStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [permissionError, setPermissionError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);


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

        setPermissionError(false);
        const q = query(collection(db, "users"), where("status", "==", "pending"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedStudents: PendingStudent[] = [];
             querySnapshot.forEach((doc) => {
                fetchedStudents.push({ id: doc.id, ...doc.data() } as PendingStudent);
            });
            setStudents(fetchedStudents);
            setFilteredStudents(fetchedStudents);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching students: ", error);
            if (error.message.includes('permission-denied')) {
                setPermissionError(true);
                toast({
                    title: 'Permission Denied',
                    description: "You don't have permission to view pending approvals.",
                    variant: 'destructive'
                })
            }
            setStudents([]);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, toast]);
    
     useEffect(() => {
        const results = students.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.usn.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(results);
    }, [searchTerm, students]);

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

    const renderDesktopView = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>USN</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredStudents.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            {permissionError ? "You do not have permission to view this page." : "No pending students found."}
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
                            <TableCell>{student.branch}</TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="capitalize">
                                    {student.status}
                                </Badge>
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
                    ))
                )}
            </TableBody>
        </Table>
    );

    const renderMobileView = () => (
        <div className="space-y-4">
             {filteredStudents.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                     {permissionError ? "You do not have permission to view this page." : "No pending students found."}
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
                                         <Badge variant="secondary" className="capitalize">{student.status}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
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
                ))
            )}
        </div>
    );

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
                        <AnimatedSearchBar
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search students..."
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
