
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, PlusCircle, Edit, Trash2, Download, FileText, Calendar as CalendarIcon, User } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, doc, deleteDoc, addDoc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, auth, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { format, isPast, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface Assignment {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    branch: string;
    semester: string;
    subject: string;
    facultyName: string;
    facultyId: string;
    documentURL?: string;
    documentName?: string;
    createdAt: any;
}

interface Branch { id: string; name: string; }
const semesters = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export default function AdminAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    // Form data
    const [branches, setBranches] = useState<Branch[]>([]);
    
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const q = collection(db, "assignments");
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAssignments = snapshot.docs.map(doc => {
                const data = doc.data();
                return { id: doc.id, ...data, dueDate: data.dueDate.toDate() } as Assignment
            }).sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis());
            setAssignments(fetchedAssignments);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching assignments: ", error);
            setLoading(false);
        });

        const fetchBranches = async () => {
             const branchSnapshot = await getDocs(collection(db, "branches"));
             setBranches(branchSnapshot.docs.map(doc => ({id: doc.id, name: doc.data().name})));
        }
        fetchBranches();

        return () => unsubscribe();
    }, [currentUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const openAddDialog = () => {
        setIsEditMode(false);
        setCurrentAssignment({ dueDate: new Date() });
        setFile(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (assignment: Assignment) => {
        setIsEditMode(true);
        setCurrentAssignment(assignment);
        setFile(null);
        setIsDialogOpen(true);
    };

    const handleDelete = async (assignment: Assignment) => {
        try {
            await deleteDoc(doc(db, "assignments", assignment.id));
            if (assignment.documentURL) {
                const fileRef = ref(storage, `assignments/${assignment.id}/${assignment.documentName}`);
                await deleteObject(fileRef);
            }
            toast({ title: "Success", description: "Assignment deleted successfully." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete assignment.", variant: "destructive" });
        }
    };

    const handleSaveChanges = async () => {
        if (!currentUser || !currentAssignment.title || !currentAssignment.branch || !currentAssignment.semester || !currentAssignment.subject || !currentAssignment.dueDate) {
            toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            let documentURL = currentAssignment.documentURL || '';
            let documentName = currentAssignment.documentName || '';

            if (file) {
                const docId = isEditMode ? currentAssignment.id! : doc(collection(db, 'assignments')).id;
                const storageRef = ref(storage, `assignments/${docId}/${file.name}`);
                await uploadBytes(storageRef, file);
                documentURL = await getDownloadURL(storageRef);
                documentName = file.name;
            }

            const dataToSave = {
                ...currentAssignment,
                documentURL,
                documentName,
                facultyId: currentUser.uid,
                facultyName: currentUser.displayName || 'Admin',
            };

            if (isEditMode) {
                const docRef = doc(db, 'assignments', currentAssignment.id!);
                await updateDoc(docRef, dataToSave);
                toast({ title: "Success", description: "Assignment updated." });
            } else {
                await addDoc(collection(db, "assignments"), {
                    ...dataToSave,
                    createdAt: serverTimestamp()
                });
                toast({ title: "Success", description: "New assignment added." });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Could not save changes.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Upload />
                        Assignment Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Create, edit, and manage all assignments.</p>
                </div>
                 <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Assignment
                </Button>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>All Assignments</CardTitle>
                    <CardDescription>A complete list of all assignments in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            <FileText className="mx-auto h-12 w-12 mb-4" />
                            <p>No assignments found. Add one to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {assignments.map(a => (
                                <Card key={a.id} className={cn("flex flex-col", isPast(a.dueDate) && !isToday(a.dueDate) ? "opacity-60" : "")}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-base">{a.title}</CardTitle>
                                            <div className="flex gap-1">
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditDialog(a)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(a)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                        <CardDescription className="text-xs">{a.branch} - Sem {a.semester} - {a.subject}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground flex-grow">
                                        {a.description}
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" /> {a.facultyName}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="h-3 w-3" /> {format(a.dueDate, 'PPP')}
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
             </Card>

             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit' : 'Add New'} Assignment</DialogTitle>
                        <DialogDescription>
                           {isEditMode ? "Update details for this assignment." : "Enter details for the new assignment."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={currentAssignment.title || ''} onChange={(e) => setCurrentAssignment({...currentAssignment, title: e.target.value })} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={currentAssignment.description || ''} onChange={(e) => setCurrentAssignment({...currentAssignment, description: e.target.value })} />
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Branch</Label>
                                <Select value={currentAssignment.branch} onValueChange={(v) => setCurrentAssignment({...currentAssignment, branch: v})}>
                                    <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                    <SelectContent>{branches.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Semester</Label>
                                 <Select value={currentAssignment.semester} onValueChange={(v) => setCurrentAssignment({...currentAssignment, semester: v})}>
                                    <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                                    <SelectContent>{semesters.map(s => <SelectItem key={s} value={s}>Semester {s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="e.g., Data Structures" value={currentAssignment.subject || ''} onChange={(e) => setCurrentAssignment({...currentAssignment, subject: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !currentAssignment.dueDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {currentAssignment.dueDate ? format(currentAssignment.dueDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={currentAssignment.dueDate}
                                            onSelect={(date) => setCurrentAssignment({...currentAssignment, dueDate: date})}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="file">Attachment (Optional)</Label>
                            <Input id="file" type="file" onChange={handleFileChange} />
                            {isEditMode && currentAssignment.documentName && !file && (
                                <p className="text-xs text-muted-foreground">Current file: {currentAssignment.documentName}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
