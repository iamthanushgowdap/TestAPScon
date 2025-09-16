
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, User, Search, Shield, Briefcase, GraduationCap, PlusCircle } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, doc, deleteDoc, query, setDoc, getDocs, updateDoc } from 'firebase/firestore';
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
import { BookCopy } from 'lucide-react';


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
    branch?: string;
    semesters?: string[];
    title?: string;
}

const semesters = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];


export default function UserManagementPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [permissionError, setPermissionError] = useState(false);
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);

    // Dialog state
    const [isFacultyDialogOpen, setIsFacultyDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentFaculty, setCurrentFaculty] = useState<Partial<UserData & { password?: string }>>({});
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
            const fetchedUsers: UserData[] = [];
            querySnapshot.forEach((doc) => {
                fetchedUsers.push({ id: doc.id, ...doc.data() } as UserData);
            });
            setUsers(fetchedUsers);
            setFilteredUsers(fetchedUsers);
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
        const results = users.filter(user =>
            (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.usn && user.usn.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

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
    
    const RoleIcon = ({ role }: { role: UserRole }) => {
        switch (role) {
            case 'admin': return <Shield className="h-4 w-4 text-red-400" />;
            case 'faculty': return <Briefcase className="h-4 w-4 text-purple-400" />;
            case 'student': return <GraduationCap className="h-4 w-4 text-blue-400" />;
            default: return <User className="h-4 w-4" />;
        }
    }
    
    const openAddFacultyDialog = () => {
        setIsEditMode(false);
        setCurrentFaculty({ branch: [], semesters: [] });
        setIsFacultyDialogOpen(true);
    };

    const handleFacultySaveChanges = async () => {
        if (!currentFaculty.name || !currentFaculty.email) {
            toast({ title: "Error", description: "Name and email are required.", variant: "destructive" });
            return;
        }

        if (!isEditMode && (!currentFaculty.password || currentFaculty.password.length < 6)) {
             toast({ title: "Error", description: "A password of at least 6 characters is required for new faculty.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = {
                name: currentFaculty.name,
                email: currentFaculty.email,
                phone: currentFaculty.phone || '',
                branch: currentFaculty.branch || [],
                semesters: currentFaculty.semesters || [],
                title: currentFaculty.title || '',
                role: 'faculty',
                status: 'approved',
            };

            if (isEditMode) {
                const docRef = doc(db, 'users', currentFaculty.id!);
                await updateDoc(docRef, dataToSave);
                toast({ title: "Success", description: "Faculty member updated." });
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, currentFaculty.email, currentFaculty.password!);
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


    const renderDesktopView = () => (
         <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredUsers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            {permissionError ? "You do not have permission to view users." : "No users found."}
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredUsers.map(user => (
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
                        <TableCell className="font-mono">{user.role === 'student' ? user.usn : user.title || 'N/A'}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <RoleIcon role={user.role} />
                                <span className="capitalize">{user.role}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={
                                user.status === 'pending' ? 'secondary' :
                                user.status === 'approved' ? 'default' : 'destructive'
                            } className="capitalize">
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
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the user
                                        and remove their data from our servers.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                )))}
            </TableBody>
        </Table>
    );

    const renderMobileView = () => (
         <div className="space-y-4">
            {filteredUsers.length === 0 ? (
                 <div className="text-center text-muted-foreground py-8">
                    {permissionError ? "You do not have permission to view users." : "No users found."}
                </div>
            ) : (
                filteredUsers.map(user => (
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
                                    <div className="flex items-center gap-2">
                                        <RoleIcon role={user.role} />
                                        <Badge variant={
                                            user.status === 'pending' ? 'secondary' :
                                            user.status === 'approved' ? 'default' : 'destructive'
                                        } className="capitalize">
                                            {user.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground pt-1 border-t">
                                     {user.usn || user.title || 'No Identifier'}
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
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the user.
                                                </AlertDialogDescription>
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
            )))}
        </div>
    );


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground flex items-center gap-2">
                        <User />
                        User Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View, edit, and manage all users in the system.
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
            
            <Card>
                <CardHeader>
                    <CardTitle>All Registered Users</CardTitle>
                    <CardDescription>
                        A complete list of students, faculty, and administrators.
                    </CardDescription>
                     <div className="relative pt-2">
                        <AnimatedSearchBar
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, or USN..."
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading || !isClient ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : (
                        isMobile ? renderMobileView() : renderDesktopView()
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFacultyDialogOpen} onOpenChange={setIsFacultyDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Faculty</DialogTitle>
                        <DialogDescription>
                           Enter the details for the new faculty member.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input 
                                id="name" 
                                value={currentFaculty.name || ''} 
                                onChange={(e) => setCurrentFaculty({...currentFaculty, name: e.target.value })}
                                className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input 
                                id="email" 
                                type="email"
                                value={currentFaculty.email || ''} 
                                onChange={(e) => setCurrentFaculty({...currentFaculty, email: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">Password</Label>
                            <div className="col-span-3">
                               <AnimatedPasswordInput 
                                    id="password" 
                                    placeholder="Initial password"
                                    value={currentFaculty.password || ''}
                                    onChange={(e) => setCurrentFaculty({...currentFaculty, password: e.target.value })}
                               />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Phone</Label>
                            <Input 
                                id="phone" 
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={currentFaculty.phone || ''} 
                                onChange={(e) => setCurrentFaculty({...currentFaculty, phone: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title</Label>
                            <Input 
                                id="title" 
                                placeholder="e.g., HOD, Asst. Professor"
                                value={currentFaculty.title || ''} 
                                onChange={(e) => setCurrentFaculty({...currentFaculty, title: e.target.value })}
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
                                            const isSelected = currentFaculty.branch?.includes(branch.name) ?? false;
                                            return (
                                                <div 
                                                    key={branch.id} 
                                                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                    onClick={() => {
                                                        const selectedBranches = (currentFaculty.branch as string[] | undefined) || [];
                                                        if (isSelected) {
                                                            setCurrentFaculty({ ...currentFaculty, branch: selectedBranches.filter(b => b !== branch.name) });
                                                        } else {
                                                            setCurrentFaculty({ ...currentFaculty, branch: [...selectedBranches, branch.name] });
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
                                {currentFaculty.branch && currentFaculty.branch?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {(currentFaculty.branch as string[]).map(b => (
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
                                        const isSelected = currentFaculty.semesters?.includes(semester) ?? false;
                                        return (
                                             <div 
                                                key={semester} 
                                                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                onClick={() => {
                                                    const selectedSemesters = currentFaculty.semesters || [];
                                                    if (isSelected) {
                                                        setCurrentFaculty({ ...currentFaculty, semesters: selectedSemesters.filter(s => s !== semester) });
                                                    } else {
                                                        setCurrentFaculty({ ...currentFaculty, semesters: [...selectedSemesters, semester] });
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
                                 {currentFaculty.semesters && currentFaculty.semesters?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {currentFaculty.semesters.map(s => (
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
