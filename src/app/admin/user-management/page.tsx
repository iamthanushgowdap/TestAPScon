
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, User, Search, Shield, Briefcase, GraduationCap, PlusCircle, Ticket, Mail, University, BookCopy, Users, Check, X, UserCheck } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, doc, deleteDoc, query, setDoc, getDocs, updateDoc, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedSearchBar from '@/components/animated-search-bar';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import AnimatedPasswordInput from '@/components/ui/animated-password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


type UserRole = 'student' | 'faculty' | 'admin';
type UserStatus = 'pending' | 'approved' | 'declined';

interface Branch {
    id: string;
    name: string;
    status: 'online' | 'offline';
}

interface UserData {
    id: string;
    name?: string;
    email: string;
    usn?: string;
    role: UserRole;
    status: UserStatus;
    branch?: string | string[];
    semesters?: string[];
    title?: string;
    phone?: string;
}

const semesters = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];


export default function UserManagementPage() {
    const [allStudents, setAllStudents] = useState<UserData[]>([]);
    const [pendingStudents, setPendingStudents] = useState<UserData[]>([]);
    const [allFaculty, setAllFaculty] = useState<UserData[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<UserData[]>([]);
    const [filteredPendingStudents, setFilteredPendingStudents] = useState<UserData[]>([]);
    const [filteredFaculty, setFilteredFaculty] = useState<UserData[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [permissionError, setPermissionError] = useState(false);
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState('students');
    const [activeStudentTab, setActiveStudentTab] = useState('all');

    // Dialog state
    const [isFacultyDialogOpen, setIsFacultyDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentUserToManage, setCurrentUserToManage] = useState<Partial<UserData & { password?: string }>>({});
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isSaving, setIsSaving] = useState(false);

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
        }

        setPermissionError(false);
        const q = query(collection(db, "users"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const students: UserData[] = [];
            const pending: UserData[] = [];
            const faculty: UserData[] = [];
            
            querySnapshot.forEach((doc) => {
                const user = { id: doc.id, ...doc.data() } as UserData;
                if(user.role === 'student') {
                    students.push(user);
                    if (user.status === 'pending') {
                        pending.push(user);
                    }
                } else if (user.role === 'faculty') {
                    faculty.push(user);
                }
            });
            setAllStudents(students);
            setPendingStudents(pending);
            setAllFaculty(faculty);
            setFilteredStudents(students);
            setFilteredPendingStudents(pending);
            setFilteredFaculty(faculty);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users: ", error);
            if (error.message.includes('permission-denied')) {
                setPermissionError(true);
                toast({
                    title: "Permission Denied",
                    description: "You do not have permission to view all users.",
                    variant: "destructive"
                });
            }
            setLoading(false);
        });
        
         const branchesQuery = query(collection(db, "branches"), where("status", "==", "online"));
        const branchesUnsubscribe = onSnapshot(branchesQuery, (snapshot) => {
            const fetchedBranches: Branch[] = [];
            snapshot.forEach(doc => fetchedBranches.push({ id: doc.id, ...doc.data() } as Branch));
            setBranches(fetchedBranches);
        }, (error) => {
            setBranches([]);
        });

        return () => {
            unsubscribe();
            branchesUnsubscribe();
        };
    }, [currentUser, toast]);

    useEffect(() => {
        let results;
        if (activeTab === 'students') {
            const sourceData = activeStudentTab === 'all' ? allStudents : pendingStudents;
            results = sourceData.filter(user =>
                (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.usn && user.usn.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            if (activeStudentTab === 'all') {
                setFilteredStudents(results);
            } else {
                setFilteredPendingStudents(results);
            }
        } else { // faculty tab
             results = allFaculty.filter(user =>
                (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredFaculty(results);
        }
    }, [searchTerm, allStudents, pendingStudents, allFaculty, activeTab, activeStudentTab]);

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteDoc(doc(db, "users", userId));
            toast({
                title: "User Deleted",
                description: "The user has been successfully removed.",
            });
        } catch (error) {
             toast({
                title: "Error Deleting User",
                description: "There was a problem removing the user.",
                variant: "destructive"
            });
        }
    };
    
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

    const openAddFacultyDialog = () => {
        setIsEditMode(false);
        setCurrentUserToManage({ branch: [], semesters: [] });
        setIsFacultyDialogOpen(true);
    };
    
    const openEditFacultyDialog = (facultyMember: UserData) => {
        setIsEditMode(true);
        const branchArray = Array.isArray(facultyMember.branch) 
            ? facultyMember.branch 
            : (typeof facultyMember.branch === 'string' ? [facultyMember.branch] : []);
        const semesterArray = Array.isArray(facultyMember.semesters) ? facultyMember.semesters : [];
        setCurrentUserToManage({...facultyMember, branch: branchArray, semesters: semesterArray});
        setIsFacultyDialogOpen(true);
    };


    const handleFacultySaveChanges = async () => {
        if (!currentUserToManage.name || !currentUserToManage.email) {
            toast({ title: "Error", description: "Name and email are required.", variant: "destructive" });
            return;
        }

        if (!isEditMode && (!currentUserToManage.password || currentUserToManage.password.length < 6)) {
             toast({ title: "Error", description: "A password of at least 6 characters is required for new faculty.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = {
                name: currentUserToManage.name,
                email: currentUserToManage.email,
                phone: currentUserToManage.phone || '',
                branch: currentUserToManage.branch || [],
                semesters: currentUserToManage.semesters || [],
                title: currentUserToManage.title || '',
                role: 'faculty',
                status: 'approved',
            };

            if (isEditMode) {
                const docRef = doc(db, 'users', currentUserToManage.id!);
                await updateDoc(docRef, dataToSave);
                toast({ title: "Success", description: "Faculty member updated." });
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, currentUserToManage.email, currentUserToManage.password!);
                const user = userCredential.user;
                
                await setDoc(doc(db, "users", user.uid), {
                    ...dataToSave,
                    createdAt: new Date(),
                });
                toast({ title: "Success", description: "New faculty member created successfully." });
            }
            setIsFacultyDialogOpen(false);
        } catch (error: any) {
             toast({ title: "Error", description: error.message || "Could not save changes.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };


    const renderAllStudentsView = () => (
        isMobile ? (
            <div className="space-y-4">
                {filteredStudents.map(user => (
                    <Card key={user.id} className="glassmorphism">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name || 'U'} />
                                    <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                        <Badge variant={user.status === 'approved' ? 'default' : 'secondary'} className="capitalize">{user.status}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1 pt-1 border-t">
                                        <p className="flex items-center gap-1.5"><Ticket className="h-4 w-4" /> {user.usn}</p>
                                        <p className="flex items-center gap-1.5"><University className="h-4 w-4" /> {user.branch as string}</p>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive" className="flex-1">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the student's record.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
                        <TableHead>Student</TableHead>
                        <TableHead>USN</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredStudents.map(user => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name || 'U'} />
                                        <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.name || 'N/A'}</div>
                                        <div className="text-muted-foreground text-xs">{user.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="font-mono">{user.usn}</TableCell>
                            <TableCell>{user.branch as string}</TableCell>
                            <TableCell>
                                <Badge variant={user.status === 'pending' ? 'secondary' : user.status === 'approved' ? 'default' : 'destructive'} className="capitalize">
                                    {user.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="icon" variant="destructive" className="h-8 w-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete the student's record.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    );
    
     const renderPendingStudentsView = () => (
        isMobile ? (
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
                ))}
            </div>
        ) : (
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
                            <TableCell>{student.branch as string}</TableCell>
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
                    ))}
                </TableBody>
            </Table>
        )
    );


    const renderFacultyView = () => (
         isMobile ? (
            <div className="space-y-4">
                {filteredFaculty.map(user => (
                    <Card key={user.id} className="glassmorphism">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name || 'U'} />
                                    <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            {user.title && <p className="text-xs text-muted-foreground">{user.title}</p>}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1 pt-1 border-t">
                                        <p className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {user.email}</p>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2">
                                        <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditFacultyDialog(user)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive" className="flex-1">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the faculty member.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
                        <TableHead>Faculty Member</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Branch(es)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredFaculty.map(user => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name || 'U'} />
                                        <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.name || 'N/A'}</div>
                                        <div className="text-muted-foreground text-xs">{user.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{user.title || 'N/A'}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {Array.isArray(user.branch) && user.branch.map(b => <Badge key={b} variant="secondary">{b}</Badge>)}
                                </div>
                            </TableCell>
                            <TableCell className="text-right flex gap-2 justify-end">
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEditFacultyDialog(user)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="icon" variant="destructive" className="h-8 w-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete the faculty member's record.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    );


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground flex items-center gap-2">
                        <Users />
                        User Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage all students and faculty in the system.
                    </p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="shrink-0">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                           <Link href="/register">
                             <GraduationCap className="mr-2 h-4 w-4" />
                             Add Student
                           </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={openAddFacultyDialog}>
                           <Briefcase className="mr-2 h-4 w-4" />
                           Add Faculty
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                            <div>
                                <CardTitle>User Lists</CardTitle>
                                <CardDescription>Switch between student and faculty management.</CardDescription>
                                <TabsList className="mt-4">
                                    <TabsTrigger value="students">
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        Students
                                    </TabsTrigger>
                                    <TabsTrigger value="faculty">
                                        <Briefcase className="mr-2 h-4 w-4" />
                                        Faculty
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                             <div className="relative pt-2 w-full sm:w-auto">
                                <AnimatedSearchBar
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search users..."
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                         {loading || !isClient ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                            </div>
                        ) : permissionError ? (
                            <div className="text-center text-destructive py-8">
                                You do not have sufficient permissions to view users.
                            </div>
                        ) : (
                            <>
                                <TabsContent value="students">
                                    <Tabs value={activeStudentTab} onValueChange={setActiveStudentTab}>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <CardTitle className="text-xl">Student Lists</CardTitle>
                                                <CardDescription>Switch between all students and those pending approval.</CardDescription>
                                            </div>
                                            <TabsList>
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
                                        <TabsContent value="all" className="mt-4">
                                            {filteredStudents.length > 0 ? renderAllStudentsView() : <div className="text-center text-muted-foreground py-8">No students found.</div>}
                                        </TabsContent>
                                         <TabsContent value="pending" className="mt-4">
                                            {filteredPendingStudents.length > 0 ? renderPendingStudentsView() : <div className="text-center text-muted-foreground py-8">No pending students found.</div>}
                                        </TabsContent>
                                    </Tabs>
                                </TabsContent>
                                <TabsContent value="faculty">
                                    {filteredFaculty.length > 0 ? renderFacultyView() : <div className="text-center text-muted-foreground py-8">No faculty found.</div>}
                                </TabsContent>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Tabs>

            <Dialog open={isFacultyDialogOpen} onOpenChange={setIsFacultyDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
                        <DialogDescription>
                           {isEditMode ? "Update the details for this faculty member." : "Enter the details for the new faculty member."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input 
                                id="name" 
                                value={currentUserToManage.name || ''} 
                                onChange={(e) => setCurrentUserToManage({...currentUserToManage, name: e.target.value })}
                                className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input 
                                id="email" 
                                type="email"
                                value={currentUserToManage.email || ''} 
                                onChange={(e) => setCurrentUserToManage({...currentUserToManage, email: e.target.value })}
                                className="col-span-3"
                                readOnly={isEditMode}
                            />
                        </div>
                        {!isEditMode && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">Password</Label>
                                <div className="col-span-3">
                                   <AnimatedPasswordInput 
                                        id="password" 
                                        placeholder="Initial password"
                                        value={currentUserToManage.password || ''}
                                        onChange={(e) => setCurrentUserToManage({...currentUserToManage, password: e.target.value })}
                                   />
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Phone</Label>
                            <Input 
                                id="phone" 
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={currentUserToManage.phone || ''} 
                                onChange={(e) => setCurrentUserToManage({...currentUserToManage, phone: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title</Label>
                            <Input 
                                id="title" 
                                placeholder="e.g., HOD, Asst. Professor"
                                value={currentUserToManage.title || ''} 
                                onChange={(e) => setCurrentUserToManage({...currentUserToManage, title: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                         <div className="grid grid-cols-4 items-start gap-4 pt-2">
                            <Label className="text-right pt-2">Branch(es)</Label>
                            <div className="col-span-3">
                                <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                                     {branches.length === 0 ? (
                                        <p className="text-center text-sm text-muted-foreground py-2">No branches found.</p>
                                     ) : (
                                        branches.map((branch) => {
                                            const isSelected = (currentUserToManage.branch as string[] | undefined)?.includes(branch.name) ?? false;
                                            return (
                                                <div 
                                                    key={branch.id} 
                                                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                    onClick={() => {
                                                        const selectedBranches = (currentUserToManage.branch as string[] | undefined) || [];
                                                        if (isSelected) {
                                                            setCurrentUserToManage({ ...currentUserToManage, branch: selectedBranches.filter(b => b !== branch.name) });
                                                        } else {
                                                            setCurrentUserToManage({ ...currentUserToManage, branch: [...selectedBranches, branch.name] });
                                                        }
                                                    }}
                                                >
                                                    <Checkbox
                                                        id={`branch-${branch.id}`}
                                                        checked={isSelected}
                                                        readOnly
                                                        className="pointer-events-none"
                                                    />
                                                    <Label htmlFor={`branch-${branch.id}`} className="font-normal cursor-pointer flex-1">
                                                        {branch.name}
                                                    </Label>
                                                </div>
                                            );
                                        })
                                     )}
                                </div>
                                {currentUserToManage.branch && (currentUserToManage.branch as string[]).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {(currentUserToManage.branch as string[]).map(b => (
                                            <Badge key={b} variant="secondary">{b}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4 pt-2">
                             <Label className="text-right pt-2">Semester(s)</Label>
                             <div className="col-span-3">
                                <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                                    {semesters.map((semester) => {
                                        const isSelected = currentUserToManage.semesters?.includes(semester) ?? false;
                                        return (
                                             <div 
                                                key={semester} 
                                                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                onClick={() => {
                                                    const selectedSemesters = currentUserToManage.semesters || [];
                                                    if (isSelected) {
                                                        setCurrentUserToManage({ ...currentUserToManage, semesters: selectedSemesters.filter(s => s !== semester) });
                                                    } else {
                                                        setCurrentUserToManage({ ...currentUserToManage, semesters: [...selectedSemesters, semester] });
                                                    }
                                                }}
                                            >
                                                <Checkbox
                                                    id={`semester-${semester}`}
                                                    checked={isSelected}
                                                    readOnly
                                                    className="pointer-events-none"
                                                />
                                                <Label htmlFor={`semester-${semester}`} className="font-normal cursor-pointer flex-1 flex items-center gap-2">
                                                   <BookCopy className="h-4 w-4 text-muted-foreground" /> Semester {semester}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                                 {currentUserToManage.semesters && currentUserToManage.semesters?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {currentUserToManage.semesters.map(s => (
                                            <Badge key={s} variant="outline">Sem {s}</Badge>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                         </DialogClose>
                        <Button onClick={handleFacultySaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
