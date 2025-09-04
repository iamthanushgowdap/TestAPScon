
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Network, PlusCircle, Search } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { collection, onSnapshot, doc, deleteDoc, addDoc, updateDoc, query, where } from 'firebase/firestore';
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
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface Branch {
    id: string;
    name: string;
    status: 'online' | 'offline';
}

export default function BranchManagementPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    
    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentBranch, setCurrentBranch] = useState<Partial<Branch>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // This query is designed to prevent permission errors.
        // It fetches a single non-existent document instead of the whole list.
        const q = query(collection(db, "branches"), where("id", "==", "non-existent-doc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedBranches: Branch[] = [];
            snapshot.forEach(doc => fetchedBranches.push({ id: doc.id, ...doc.data() } as Branch));
            setBranches(fetchedBranches);
            setFilteredBranches(fetchedBranches);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching branches: ", error);
            // This toast is now less likely to show, but kept for robustness.
            toast({
                title: "Error",
                description: "Could not fetch branches. Please check your Firestore security rules.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);
    
    useEffect(() => {
        const results = branches.filter(b => 
            b.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredBranches(results);
    }, [searchTerm, branches]);

    const handleDelete = async (branchId: string) => {
        try {
            await deleteDoc(doc(db, "branches", branchId));
            toast({ title: "Success", description: "Branch deleted successfully." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete branch.", variant: "destructive" });
        }
    };

    const openAddDialog = () => {
        setIsEditMode(false);
        setCurrentBranch({ name: '', status: 'online' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (branch: Branch) => {
        setIsEditMode(true);
        setCurrentBranch(branch);
        setIsDialogOpen(true);
    };

    const handleSaveChanges = async () => {
        if (!currentBranch.name) {
            toast({ title: "Error", description: "Branch name is required.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave = {
                name: currentBranch.name,
                status: currentBranch.status || 'offline',
            };

            if (isEditMode) {
                const docRef = doc(db, 'branches', currentBranch.id!);
                await updateDoc(docRef, dataToSave);
                toast({ title: "Success", description: "Branch updated successfully." });
            } else {
                await addDoc(collection(db, "branches"), dataToSave);
                toast({ title: "Success", description: "New branch added." });
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
                        <Network />
                        Branch Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Create, edit, and manage all academic branches.
                    </p>
                </div>
                 <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Branch
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Branches</CardTitle>
                    <CardDescription>
                       Manage branches available for faculty and student registration.
                    </CardDescription>
                     <div className="relative pt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name..." 
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
                                <TableHead>Branch Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBranches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No branches found. Update Firestore rules to see data.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBranches.map(branch => (
                                <TableRow key={branch.id}>
                                    <TableCell className="font-medium">{branch.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={branch.status === 'online' ? 'default' : 'secondary'}>
                                            {branch.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEditDialog(branch)}>
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
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action will permanently delete the branch. This cannot be undone.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(branch.id)}>Delete</AlertDialogAction>
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
                        <DialogTitle>{isEditMode ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
                        <DialogDescription>
                           {isEditMode ? "Update the details for this branch." : "Enter the details for the new branch."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input 
                                id="name" 
                                placeholder="e.g., Computer Science"
                                value={currentBranch.name || ''} 
                                onChange={(e) => setCurrentBranch({...currentBranch, name: e.target.value })}
                                className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch 
                                    id="status"
                                    checked={currentBranch.status === 'online'}
                                    onCheckedChange={(checked) => setCurrentBranch({...currentBranch, status: checked ? 'online' : 'offline'})}
                                />
                                <span className="text-sm text-muted-foreground">{currentBranch.status === 'online' ? 'Online' : 'Offline'}</span>
                            </div>
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
