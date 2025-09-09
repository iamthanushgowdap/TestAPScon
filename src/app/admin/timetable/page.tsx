
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, PlusCircle, Clock, BookOpen, User, Library, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TimetableEntry {
    id: string;
    startTime: string;
    endTime: string;
    subject: string;
    faculty: string;
    location: string;
}

interface TimetableData {
    [day: string]: TimetableEntry[];
}

interface Branch {
    id: string;
    name: string;
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const semesters = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export default function AdminTimetablePage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [timetable, setTimetable] = useState<TimetableData | null>(null);
    const [loadingBranches, setLoadingBranches] = useState(true);
    const [loadingTimetable, setLoadingTimetable] = useState(false);
    const { toast } = useToast();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentEntry, setCurrentEntry] = useState<Partial<TimetableEntry>>({});
    const [selectedDay, setSelectedDay] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const q = collection(db, "branches");
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedBranches: Branch[] = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setBranches(fetchedBranches);
            setLoadingBranches(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (selectedBranch && selectedSemester) {
            setLoadingTimetable(true);
            const timetableDocId = `${selectedBranch}_${selectedSemester}`;
            const timetableDocRef = doc(db, 'timetables', timetableDocId);

            const unsubscribe = onSnapshot(timetableDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setTimetable(docSnap.data().schedule);
                } else {
                    const emptySchedule: TimetableData = {};
                    weekDays.forEach(day => emptySchedule[day] = []);
                    setTimetable(emptySchedule);
                }
                setLoadingTimetable(false);
            }, (error) => {
                console.error("Error fetching timetable:", error);
                toast({ title: "Error", description: "Failed to fetch timetable.", variant: "destructive" });
                setLoadingTimetable(false);
            });

            return () => unsubscribe();
        } else {
            setTimetable(null);
        }
    }, [selectedBranch, selectedSemester, toast]);

    const openAddDialog = (day: string) => {
        setSelectedDay(day);
        setIsEditMode(false);
        setCurrentEntry({ id: new Date().toISOString() });
        setIsDialogOpen(true);
    };

    const openEditDialog = (day: string, entry: TimetableEntry) => {
        setSelectedDay(day);
        setIsEditMode(true);
        setCurrentEntry(entry);
        setIsDialogOpen(true);
    };

    const handleSaveChanges = async () => {
        if (!selectedBranch || !selectedSemester || !timetable) return;
        setIsSaving(true);
        
        const timetableDocId = `${selectedBranch}_${selectedSemester}`;
        const timetableDocRef = doc(db, 'timetables', timetableDocId);

        let newDaySchedule = [...(timetable[selectedDay] || [])];
        
        if (isEditMode) {
            newDaySchedule = newDaySchedule.map(entry => entry.id === currentEntry.id ? (currentEntry as TimetableEntry) : entry);
        } else {
            newDaySchedule.push(currentEntry as TimetableEntry);
        }

        const newTimetable = { ...timetable, [selectedDay]: newDaySchedule };

        try {
            await setDoc(timetableDocRef, { 
                branch: selectedBranch,
                semester: selectedSemester,
                schedule: newTimetable 
            }, { merge: true });
            toast({ title: "Success", description: "Timetable updated successfully." });
            setIsDialogOpen(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to save timetable.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async (day: string, entryId: string) => {
        if (!selectedBranch || !selectedSemester || !timetable) return;
        const timetableDocId = `${selectedBranch}_${selectedSemester}`;
        const timetableDocRef = doc(db, 'timetables', timetableDocId);
        
        const newDaySchedule = (timetable[day] || []).filter(entry => entry.id !== entryId);
        const newTimetable = { ...timetable, [day]: newDaySchedule };

        try {
            await updateDoc(timetableDocRef, { schedule: newTimetable });
            toast({ title: "Success", description: "Entry deleted." });
        } catch (error) {
             toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" });
        }
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <CalendarDays />
                    Timetable Management
                </h1>
                <p className="text-muted-foreground mt-1">
                    Create, edit, and manage timetables for all branches and semesters.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Timetable</CardTitle>
                    <CardDescription>Choose a branch and semester to view or edit its timetable.</CardDescription>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <Select onValueChange={setSelectedBranch} value={selectedBranch} disabled={loadingBranches}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select Branch"} />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map(branch => (
                                    <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setSelectedSemester} value={selectedSemester} disabled={!selectedBranch}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {semesters.map(sem => (
                                    <SelectItem key={sem} value={sem}>Semester {sem}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>

            {loadingTimetable && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
                </div>
            )}

            {timetable && !loadingTimetable && (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {weekDays.map(day => (
                        <Card key={day} className="glassmorphism flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>{day}</CardTitle>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openAddDialog(day)}>
                                    <PlusCircle className="h-5 w-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1">
                                {(timetable[day] || []).length > 0 ? (
                                    (timetable[day] || [])
                                    .sort((a,b) => a.startTime.localeCompare(b.startTime))
                                    .map((entry, index) => (
                                    <div key={entry.id} className="rounded-lg p-3 bg-background/50 border relative group">
                                        <div className="font-bold text-base text-foreground flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" /> {entry.subject}
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                            <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {entry.startTime} - {entry.endTime}</div>
                                            <div className="flex items-center gap-2"><User className="h-4 w-4" /> {entry.faculty}</div>
                                            <div className="flex items-center gap-2"><Library className="h-4 w-4" /> {entry.location}</div>
                                        </div>
                                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditDialog(day, entry)}><Edit className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(day, entry.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))) : (
                                    <div className="text-center text-muted-foreground py-8 border border-dashed rounded-md h-full flex flex-col justify-center">
                                        <p>No classes scheduled.</p>
                                        <Button variant="link" onClick={() => openAddDialog(day)}>Add Entry</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            )}
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit' : 'Add'} Timetable Entry for {selectedDay}</DialogTitle>
                         <DialogDescription>
                           Fill in the details for the class schedule.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input id="startTime" type="time" value={currentEntry.startTime || ''} onChange={e => setCurrentEntry({...currentEntry, startTime: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time</Label>
                                <Input id="endTime" type="time" value={currentEntry.endTime || ''} onChange={e => setCurrentEntry({...currentEntry, endTime: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="e.g., Data Structures" value={currentEntry.subject || ''} onChange={e => setCurrentEntry({...currentEntry, subject: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="faculty">Faculty</Label>
                            <Input id="faculty" placeholder="e.g., Prof. S. Chen" value={currentEntry.faculty || ''} onChange={e => setCurrentEntry({...currentEntry, faculty: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" placeholder="e.g., Lab-3" value={currentEntry.location || ''} onChange={e => setCurrentEntry({...currentEntry, location: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
