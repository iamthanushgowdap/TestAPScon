
'use client';

import { useState, useEffect } from 'react';
import AppLayout from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, User, Calendar, BookOpen, AlertCircle } from "lucide-react";
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isPast, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Assignment {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    facultyName: string;
    subject: string;
    documentURL?: string;
    documentName?: string;
}

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const { branch, semester } = userData;

                    if (branch && semester) {
                        const q = query(
                            collection(db, "assignments"),
                            where("branch", "==", branch),
                            where("semester", "==", semester)
                        );

                        const unsubscribeSnap = onSnapshot(q, (snapshot) => {
                            const fetchedAssignments = snapshot.docs.map(doc => {
                                const data = doc.data();
                                return {
                                    id: doc.id,
                                    ...data,
                                    dueDate: data.dueDate.toDate()
                                } as Assignment;
                            });
                            setAssignments(fetchedAssignments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
                            setLoading(false);
                        }, (err) => {
                            console.error("Error fetching assignments:", err);
                            setError("Failed to load assignments.");
                            setLoading(false);
                        });
                        return () => unsubscribeSnap();
                    } else {
                        setError("Your profile is missing branch or semester details.");
                        setLoading(false);
                    }
                } else {
                     setError("Could not find your user profile.");
                     setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const DueDateBadge = ({ dueDate }: { dueDate: Date }) => {
        const isOverdue = isPast(dueDate) && !isToday(dueDate);
        const dueToday = isToday(dueDate);

        if (isOverdue) {
            return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3"/> Overdue</Badge>
        }
        if (dueToday) {
             return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> Due Today</Badge>
        }
        return <Badge variant="outline">{format(dueDate, 'PPP')}</Badge>;
    }


    return (
        <AppLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Assignments</h1>
                    <p className="text-muted-foreground mt-1">Here are all the assignments for your current semester.</p>
                </div>
                
                {loading && 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                    </div>
                }

                {!loading && error && 
                    <Card className="text-center py-12 glassmorphism">
                        <CardContent>
                            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                            <h3 className="text-xl font-semibold">An Error Occurred</h3>
                            <p className="text-muted-foreground mt-2">{error}</p>
                        </CardContent>
                    </Card>
                }

                {!loading && !error && assignments.length === 0 &&
                    <Card className="text-center py-12 glassmorphism">
                        <CardContent>
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold">No Assignments Yet</h3>
                            <p className="text-muted-foreground mt-2">Check back later for new assignments.</p>
                        </CardContent>
                    </Card>
                }
                
                {!loading && !error && assignments.length > 0 &&
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {assignments.map(assignment => (
                             <Card key={assignment.id} className={cn("glassmorphism flex flex-col", isPast(assignment.dueDate) && !isToday(assignment.dueDate) ? "opacity-60" : "")}>
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <BookOpen className="h-5 w-5 text-primary" />
                                                {assignment.title}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <User className="h-3.5 w-3.5" />
                                                    {assignment.facultyName} - {assignment.subject}
                                                </div>
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <DueDateBadge dueDate={assignment.dueDate} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assignment.description}</p>
                                </CardContent>
                                {assignment.documentURL && (
                                     <CardContent>
                                        <Button asChild variant="outline" className="w-full">
                                            <a href={assignment.documentURL} target="_blank" rel="noopener noreferrer">
                                                <Download className="mr-2 h-4 w-4" /> 
                                                {assignment.documentName || 'Download Attachment'}
                                            </a>
                                        </Button>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                }
            </div>
        </AppLayout>
    );
}
