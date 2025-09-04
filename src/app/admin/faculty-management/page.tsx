
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Search, Briefcase, PlusCircle, ChevronsUpDown, Check } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { collection, onSnapshot, doc, deleteDoc, query, where, addDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Branch {
    id: string;
    name: string;
    status: 'online' | 'offline';
}

interface FacultyData {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    branch?: string[] | string;
    title?: string;
}

export default function FacultyManagementPage() {
    const [faculty, setFaculty] = useState<FacultyData[]>([]);
    const [filteredFaculty, setFilteredFaculty] = useState<FacultyData[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    
    // State for the dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentFaculty, setCurrentFaculty] = useState<Partial<FacultyData & { password?: string, branch?: string[] }>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [openBranchPopover, setOpenBranchPopover] = useState(false);


    useEffect(() => {
        const q = query(collection(db, "users"), where("role", "==", "faculty"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedFaculty: FacultyData[] = [];
            querySnapshot.forEach((doc) => {
                fetchedFaculty.push({ id: doc.id, ...doc.data() } as FacultyData);
            });
            setFaculty(fetchedFaculty);
            setFilteredFaculty(fetchedFaculty);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching faculty: ", error);
            if(error.message.includes('permission-denied')) {
                 toast({
                    title: "Permission Denied",
                    description: `Could not fetch faculty data. Please check your Firestore security rules.`,
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
            console.error("Error fetching branches for faculty form: ", error);
            if(error.message.includes('permission-denied')) {
                 toast({
                    title: "Permission Denied",
                    description: `Could not fetch branches. Check your security rules.`,
                    variant: "destructive"
                });
            }
            setBranches([]);
        });

        return () => {
            unsubscribe();
            branchesUnsubscribe();
        }
    }, [toast]);

    useEffect(() => {
        const results = faculty.filter(f =>
            (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredFaculty(results);
    }, [searchTerm, faculty]);

    const handleDelete = async (userId: string) => {
        // Note: This only deletes the Firestore record. For a full implementation,
        // you would need a Firebase Function to delete the corresponding Auth user.
        try {
            await deleteDoc(doc(db, "users", userId));
            toast({
                title: "Faculty Deleted",
                description: "The faculty member has been successfully removed from the database.",
            });
        } catch (error) {
             toast({
                title: "Error Deleting Faculty",
                description: "There was a problem removing the faculty member.",
                variant: "destructive"
            });
        }
    };
    
    const openAddDialog = () => {
        setIsEditMode(false);
        setCurrentFaculty({ branch: [] });
        setIsDialogOpen(true);
    };

    const openEditDialog = (facultyMember: FacultyData) => {
        setIsEditMode(true);
        const branchArray = Array.isArray(facultyMember.branch) 
            ? facultyMember.branch 
            : (typeof facultyMember.branch === 'string' ? [facultyMember.branch] : []);
        setCurrentFaculty({...facultyMember, branch: branchArray});
        setIsDialogOpen(true);
    };
    
    const handleSaveChanges = async () => {
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
                title: currentFaculty.title || '',
                role: 'faculty',
                status: 'approved',
            };

            if (isEditMode) {
                const docRef = doc(db, 'users', currentFaculty.id!);
                await updateDoc(docRef, dataToSave);
                toast({ title: "Success", description: "Faculty member updated." });
            } else {
                // Create user in Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, currentFaculty.email, currentFaculty.password!);
                const user = userCredential.user;
                
                // Create Firestore document with the same UID
                await setDoc(doc(db, "users", user.uid), {
                    ...dataToSave,
                    createdAt: new Date(),
                });
                toast({ title: "Success", description: "New faculty member created successfully." });
            }
            setIsDialogOpen(false);
        } catch (error: any) {
             toast({ title: "Error", description: error.message || "Could not save changes.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const renderBranchBadges = (branchData: string | string[] | undefined) => {
        if (!branchData) {
            return 'N/A';
        }
        const branches = Array.isArray(branchData) ? branchData : [branchData];
        return branches.map(b => <Badge key={b} variant="secondary">{b}</Badge>);
    }


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground flex items-center gap-2">
                        <Briefcase />
                        Faculty Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Add, view, edit, and manage all faculty members.
                    </p>
                </div>
                 <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Faculty
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Faculty Members</CardTitle>
                    <CardDescription>
                       A complete list of all faculty in the system.
                    </CardDescription>
                     <div className="relative pt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or email..." 
                            className="pl-10" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Branch(es)</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFaculty.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No faculty members found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredFaculty.map(f => (
                                <TableRow key={f.id}>
                                    <TableCell className="font-medium">{f.name || 'N/A'}</TableCell>
                                    <TableCell>{f.email}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {renderBranchBadges(f.branch)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{f.title || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEditDialog(f)}>
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
                                                    <AlertDialogDescription>
                                                        This will permanently delete the faculty member's record. This action cannot be undone. A full implementation would also delete the user from Firebase Authentication.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(f.id)}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
                        <DialogDescription>
                           {isEditMode ? "Update the details for this faculty member." : "Enter the details for the new faculty member."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
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
                                readOnly={isEditMode}
                            />
                        </div>
                        {!isEditMode && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password"
                                    value={currentFaculty.password || ''} 
                                    onChange={(e) => setCurrentFaculty({...currentFaculty, password: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        )}
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Branch(es)</Label>
                            <Popover open={openBranchPopover} onOpenChange={setOpenBranchPopover}>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openBranchPopover}
                                    className="col-span-3 justify-between"
                                    >
                                    <span className="truncate">
                                        {currentFaculty.branch?.length ? `${currentFaculty.branch.length} selected` : "Select branch(es)..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                    <Command>
                                    <CommandInput placeholder="Search branch..." />
                                    <CommandList>
                                        <CommandEmpty>No branch found.</CommandEmpty>
                                        <CommandGroup>
                                        {branches.map((branch) => (
                                            <CommandItem
                                                key={branch.id}
                                                value={branch.name}
                                                onSelect={(currentValue) => {
                                                    const selectedBranches = currentFaculty.branch || [];
                                                    const isSelected = selectedBranches.includes(branch.name);
                                                    const newBranches = isSelected
                                                        ? selectedBranches.filter(b => b !== branch.name)
                                                        : [...selectedBranches, branch.name];
                                                    setCurrentFaculty({ ...currentFaculty, branch: newBranches });
                                                }}
                                            >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    currentFaculty.branch?.includes(branch.name) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {branch.name}
                                            </CommandItem>
                                        ))}
                                        </CommandGroup>
                                    </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                         {currentFaculty.branch?.length > 0 && (
                            <div className="grid grid-cols-4 items-start gap-4">
                                <div className="col-start-2 col-span-3 flex flex-wrap gap-1">
                                    {currentFaculty.branch.map(b => (
                                        <Badge key={b} variant="secondary">{b}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );

}

    
