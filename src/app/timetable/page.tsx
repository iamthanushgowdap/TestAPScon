
'use client';

import { useState, useEffect } from 'react';
import AppLayout from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, Library, Calendar, BookOpen } from "lucide-react";
import { cn } from '@/lib/utils';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface TimetableEntry {
    startTime: string;
    endTime: string;
    subject: string;
    faculty: string;
    location: string;
    color: string;
}

interface TimetableData {
    [day: string]: TimetableEntry[];
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const colorCycle = [
    'border-blue-500/80 bg-blue-500/10',
    'border-green-500/80 bg-green-500/10',
    'border-red-500/80 bg-red-500/10',
    'border-purple-500/80 bg-purple-500/10',
    'border-yellow-500/80 bg-yellow-500/10',
    'border-pink-500/80 bg-pink-500/10',
];

export default function TimetablePage() {
    const [timetable, setTimetable] = useState<TimetableData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        const { branch, semester } = userData;

                        if (branch && semester) {
                            const timetableDocId = `${branch}_${semester}`;
                            const timetableDocRef = doc(db, 'timetables', timetableDocId);
                            const timetableDocSnap = await getDoc(timetableDocRef);

                            if (timetableDocSnap.exists()) {
                                setTimetable(timetableDocSnap.data().schedule);
                            } else {
                                setError('Timetable not found for your branch and semester.');
                                setTimetable({});
                            }
                        } else {
                             setError('Your profile is missing branch or semester information.');
                             setTimetable({});
                        }
                    } else {
                        setError('Could not find your user profile.');
                    }
                } catch (e) {
                    console.error("Error fetching timetable: ", e);
                    setError('Failed to fetch timetable.');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AppLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Weekly Timetable</h1>
                    <p className="text-muted-foreground mt-2">Your class schedule for the week.</p>
                </header>

                <div className="mt-8">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-6 w-32" />
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-16 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : error || !timetable || Object.keys(timetable).length === 0 ? (
                        <Card className="glassmorphism text-center py-16">
                            <CardContent>
                                 <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                 <h3 className="text-xl font-semibold">No Timetable Available</h3>
                                 <p className="text-muted-foreground mt-2">{error || 'Your timetable has not been set up yet. Please check back later.'}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {weekDays.map(day => (
                                <Card key={day} className="glassmorphism">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold">{day}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {(timetable[day] && timetable[day].length > 0) ? (
                                            timetable[day]
                                                .sort((a,b) => a.startTime.localeCompare(b.startTime))
                                                .map((item, index) => (
                                                    <div key={index} className={cn(
                                                        "rounded-lg p-4 border-l-4 space-y-2 transition-all hover:shadow-lg hover:-translate-y-1",
                                                        item.color || colorCycle[index % colorCycle.length]
                                                    )}>
                                                        <div className="font-bold text-base text-foreground flex items-center gap-2">
                                                            <BookOpen className="h-4 w-4" />
                                                            {item.subject}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground space-y-1">
                                                            <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {item.startTime} - {item.endTime}</div>
                                                            <div className="flex items-center gap-2"><User className="h-4 w-4" /> {item.faculty}</div>
                                                            <div className="flex items-center gap-2"><Library className="h-4 w-4" /> {item.location}</div>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="text-center text-muted-foreground py-8">
                                                <p>No classes scheduled.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
