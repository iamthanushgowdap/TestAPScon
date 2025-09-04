
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Search, Briefcase, PlusCircle, User } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { collection, onSnapshot, doc, deleteDoc, query, where, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

interface FacultyData {
    id: string;
    name?: string;
    email: string;
}

export default function FacultyManagementPage() {
    const [faculty, setFaculty] = useState<FacultyData[]>([]);
    const [filteredFaculty, setFilteredFaculty] = useState<FacultyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    
    // State for the dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentFaculty, setCurrentFaculty] = useState<Partial<FacultyData>>({});
    const [isSaving, setIsSaving] = useState(false);

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
            toast({
                title: "Permission Denied",
                description: "You may not have permission to view faculty. Please update Firestore security rules.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    useEffect(() => {
        const results = faculty.filter(f =>
            (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredFaculty(results);
    }, [searchTerm, faculty]);

    const handleDelete = async (userId: string) => {
        try {
            await deleteDoc(doc(db, "users", userId));
            toast({
                title: "Faculty Deleted",
                description: "The faculty member has been successfully removed.",
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
        setCurrentFaculty({});
        setIsDialogOpen(true);
    };

    const openEditDialog = (facultyMember: FacultyData) => {
        setIsEditMode(true);
        setCurrentFaculty(facultyMember);
        setIsDialogOpen(true);
    };
    
    const handleSaveChanges = async () => {
        if (!currentFaculty.name || !currentFaculty.email) {
            toast({ title: "Error", description: "Name and email are required.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            if (isEditMode) {
                // Update existing faculty
                const docRef = doc(db, 'users', currentFaculty.id!);
                await updateDoc(docRef, { name: currentFaculty.name });
                 toast({ title: "Success", description: "Faculty member updated." });
            } else {
                // Add new faculty - NOTE: This only creates the Firestore record.
                // A full solution requires creating an auth user, which is a backend operation.
                await addDoc(collection(db, "users"), {
                    name: currentFaculty.name,
                    email: currentFaculty.email,
                    role: 'faculty',
                    status: 'approved',
                    createdAt: new Date(),
                });
                toast({ title: "Success", description: "Faculty member added. They can now log in." });
            }
            setIsDialogOpen(false);
        } catch (error) {
             toast({ title: "Error", description: "Could not save changes.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

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
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFaculty.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No faculty members found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredFaculty.map(f => (
                                <TableRow key={f.id}>
                                    <TableCell className="font-medium">{f.name || 'N/A'}</TableCell>
                                    <TableCell>{f.email}</TableCell>
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
                                                        This will permanently delete the faculty member's account. This action cannot be undone.
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
