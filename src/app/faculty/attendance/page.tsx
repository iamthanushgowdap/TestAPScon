
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, User, Users, Save, Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

interface FacultyData {
    branch?: string[];
    semesters?: string[];
}

interface Student {
    id: string;
    name: string;
    usn: string;
}

type AttendanceStatus = 'present' | 'absent';
type AttendanceState = Record<string, AttendanceStatus>;


export default function FacultyAttendancePage() {
    const [facultyData, setFacultyData] = useState<FacultyData | null>(null);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [subject, setSubject] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<AttendanceState>({});
    
    const [loadingFaculty, setLoadingFaculty] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setFacultyData(userDocSnap.data() as FacultyData);
                }
                setLoadingFaculty(false);
            } else {
                setCurrentUser(null);
                 setLoadingFaculty(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchStudents = useCallback(async () => {
        if (!selectedBranch || !selectedSemester) return;

        setLoadingStudents(true);
        try {
            const q = query(
                collection(db, "users"),
                where("role", "==", "student"),
                where("branch", "==", selectedBranch),
                where("semester", "==", selectedSemester),
                where("status", "==", "approved")
            );

            const querySnapshot = await getDocs(q);
            const fetchedStudents: Student[] = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                fetchedStudents.push({ id: doc.id, name: data.name, usn: data.usn });
            });
            setStudents(fetchedStudents);

            // Initialize attendance state
            const initialAttendance: AttendanceState = {};
            fetchedStudents.forEach(s => { initialAttendance[s.id] = 'present' });
            setAttendance(initialAttendance);

        } catch (error) {
            toast({ title: "Error", description: "Could not fetch students.", variant: "destructive"});
        } finally {
            setLoadingStudents(false);
        }
    }, [selectedBranch, selectedSemester, toast]);
    
    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);
    
    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };
    
    const handleMarkAll = (status: AttendanceStatus) => {
        const newAttendance: AttendanceState = {};
        students.forEach(s => { newAttendance[s.id] = status });
        setAttendance(newAttendance);
    }

    const handleSaveAttendance = async () => {
        if (!currentUser || !selectedBranch || !selectedSemester || !subject || !date) {
            toast({ title: "Missing Information", description: "Please select branch, semester, subject, and date.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        const formattedDate = format(new Date(date), 'yyyy-MM-dd');
        const docId = `${selectedBranch}_${selectedSemester}_${formattedDate}_${subject.replace(/\s+/g, '-')}`;
        
        const attendanceRecord = {
            branch: selectedBranch,
            semester: selectedSemester,
            subject: subject,
            date: formattedDate,
            facultyId: currentUser.uid,
            attendees: attendance,
            lastModified: serverTimestamp()
        };

        try {
            await setDoc(doc(db, "attendance", docId), attendanceRecord, { merge: true });
            toast({ title: "Success", description: `Attendance for ${subject} on ${formattedDate} saved.`});
        } catch (error) {
            console.error("Error saving attendance: ", error);
            toast({ title: "Error", description: "Could not save attendance.", variant: "destructive"});
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <ClipboardCheck />
                    Take Attendance
                </h1>
                <p className="text-muted-foreground mt-1">
                    Select a class and mark student attendance for the day.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Class Selection</CardTitle>
                    <CardDescription>Choose the class for which you want to take attendance.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {loadingFaculty ? <Skeleton className="h-10 w-full" /> : (
                        <Select onValueChange={setSelectedBranch} value={selectedBranch}>
                            <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                            <SelectContent>
                                {facultyData?.branch?.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    {loadingFaculty ? <Skeleton className="h-10 w-full" /> : (
                        <Select onValueChange={setSelectedSemester} value={selectedSemester}>
                            <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                            <SelectContent>
                                {facultyData?.semesters?.map(s => <SelectItem key={s} value={s}>Semester {s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                     <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Subject Name" className="pl-9" value={subject} onChange={e => setSubject(e.target.value)} />
                    </div>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-9" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            {(selectedBranch && selectedSemester) && (
                 <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2"><Users /> Student List</CardTitle>
                                <CardDescription>Mark each student as present or absent.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleMarkAll('present')}>Mark All Present</Button>
                                <Button variant="outline" size="sm" onClick={() => handleMarkAll('absent')}>Mark All Absent</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingStudents ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                            </div>
                        ) : students.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No students found for this class.</p>
                        ): (
                            <div className="space-y-2">
                                {students.map(student => (
                                    <div key={student.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
                                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{student.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{student.usn}</p>
                                            </div>
                                        </div>
                                        <RadioGroup 
                                            value={attendance[student.id]} 
                                            onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="present" id={`${student.id}-present`} />
                                                <Label htmlFor={`${student.id}-present`}>Present</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="absent" id={`${student.id}-absent`} />
                                                <Label htmlFor={`${student.id}-absent`}>Absent</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end mt-6">
                            <Button onClick={handleSaveAttendance} disabled={isSaving || loadingStudents}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? 'Saving...' : 'Save Attendance'}
                            </Button>
                        </div>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
