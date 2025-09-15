
'use client';

import { useState, useEffect } from 'react';
import AppLayout from "@/components/app-layout";
import { ProactiveReminderCard } from "@/components/proactive-reminder-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, BookCopy, ListTodo, Calendar, Clock, FileText, Wallet, Percent, PartyPopper, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface ScheduleItem {
    id: string;
    time: string;
    subject: string;
    location: string;
    faculty: string;
    startTime?: string;
}

const assignmentItems = [
    { title: 'Lab Report 3', subject: 'Physics 101', dueDate: 'Tomorrow' },
    { title: 'Problem Set 5', subject: 'Calculus II', dueDate: '3 days' },
];

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [todaysSchedule, setTodaysSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingSchedule, setLoadingSchedule] = useState(true);
    const [overallAttendance, setOverallAttendance] = useState(0);
    const [loadingAttendance, setLoadingAttendance] = useState(true);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setUserName(userData.name || currentUser.displayName);
                    
                    if (userData.branch && userData.semester) {
                        // Fetch timetable
                        const timetableDocId = `${userData.branch}_${userData.semester}`;
                        const timetableDocRef = doc(db, 'timetables', timetableDocId);
                        getDoc(timetableDocRef).then(timetableDocSnap => {
                             if (timetableDocSnap.exists()) {
                                const timetableData = timetableDocSnap.data().schedule;
                                const today = format(new Date(), 'EEEE'); // e.g., "Monday"
                                const scheduleForToday = timetableData[today] || [];
                                
                                const formattedSchedule = scheduleForToday.map((item: any) => ({
                                    ...item,
                                    time: `${item.startTime} - ${item.endTime}`
                                })).sort((a: ScheduleItem, b: ScheduleItem) => a.startTime!.localeCompare(b.startTime!));

                                setTodaysSchedule(formattedSchedule);
                            }
                            setLoadingSchedule(false);
                        });

                        // Fetch attendance
                        const q = query(
                            collection(db, "attendance"),
                            where("branch", "==", userData.branch),
                            where("semester", "==", userData.semester)
                        );
                        
                        onSnapshot(q, (snapshot) => {
                            let totalPresent = 0;
                            let totalClasses = 0;
                            
                            snapshot.forEach(doc => {
                                const data = doc.data();
                                const studentStatus = data.attendees[currentUser.uid];

                                if (studentStatus) {
                                    totalClasses++;
                                    if (studentStatus === 'present') {
                                        totalPresent++;
                                    }
                                }
                            });
                            
                            setOverallAttendance(totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0);
                            setLoadingAttendance(false);
                        });

                    } else {
                        setLoadingSchedule(false);
                        setLoadingAttendance(false);
                    }
                } else {
                    setUserName(currentUser.displayName);
                    setLoadingSchedule(false);
                    setLoadingAttendance(false);
                }
            } else {
                setUser(null);
                setUserName(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const upcomingAssignment = assignmentItems[0];

    return (
        <AppLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-8 relative">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        {loading ? (
                             <Skeleton className="h-9 w-64" />
                        ) : (
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline text-foreground">
                                Hi {userName || 'Student'} 👋
                            </h1>
                        )}
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                            Here’s your personalized dashboard for the day.
                        </p>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Event Banner */}
                        <Card className="bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground overflow-hidden">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <PartyPopper className="h-8 w-8" />
                                <div>
                                    <CardTitle>Tech Fest '24 is here!</CardTitle>
                                    <CardDescription className="text-primary-foreground/80">Join us for a week of innovation, workshops, and fun. Starting next Monday.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="secondary">
                                    <Link href="#">
                                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Schedule & Assignments */}
                        <div className="grid md:grid-cols-2 gap-6">
                             {/* Today's Schedule */}
                             <Card className="glassmorphism">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Today's Schedule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {loadingSchedule ? (
                                        <>
                                            <Skeleton className="h-16 w-full" />
                                            <Skeleton className="h-16 w-full" />
                                            <Skeleton className="h-16 w-full" />
                                        </>
                                    ) : todaysSchedule.length > 0 ? (
                                        todaysSchedule.map(item => (
                                            <div key={item.id} className="flex items-start">
                                                <Clock className="h-4 w-4 mr-3 mt-1 text-muted-foreground" />
                                                <div>
                                                    <p className="font-semibold">{item.subject}</p>
                                                    <p className="text-sm text-muted-foreground">{item.time} - {item.location}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5"><UserIcon className="h-3 w-3" />{item.faculty}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-sm text-center py-4">No classes scheduled for today. Enjoy your day!</p>
                                    )}
                                </CardContent>
                            </Card>

                             {/* Assignments */}
                             <Card className="glassmorphism">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Assignments
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     {assignmentItems.map(item => (
                                        <div key={item.title} className="flex items-start">
                                            <BookCopy className="h-4 w-4 mr-3 mt-1 text-muted-foreground" />
                                            <div>
                                                <p className="font-semibold">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">{item.subject} - Due: {item.dueDate}</p>
                                            </div>
                                        </div>
                                     ))}
                                     <Button variant="outline" size="sm" className="w-full mt-2">
                                        View All
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Attendance */}
                        <Card className="glassmorphism text-center">
                            <CardHeader>
                                <CardTitle>Attendance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingAttendance ? <Skeleton className="h-32 w-32 rounded-full mx-auto" /> : (
                                    <div className="relative h-32 w-32 mx-auto">
                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                            <path
                                                className="stroke-current text-secondary"
                                                d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                strokeWidth="3"
                                            />
                                            <path
                                                className="stroke-current text-primary transition-all duration-500"
                                                strokeDasharray={`${overallAttendance}, 100`}
                                                d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold">{overallAttendance}%</span>
                                            <Percent className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground mt-3">Great standing!</p>
                            </CardContent>
                        </Card>

                         {/* Fee Details */}
                         <Card className="glassmorphism">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Fee Details</span>
                                    <Wallet className="h-5 w-5" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-muted-foreground">Tuition Fee</span>
                                        <span className="font-semibold text-green-400">Paid</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-muted-foreground">Hostel Fee</span>
                                        <span className="font-semibold text-yellow-400">Pending</span>
                                    </div>
                                </div>
                                <Button variant="secondary" className="w-full mt-4">Pay Now</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <ProactiveReminderCard 
                    taskName={upcomingAssignment.title}
                    deadline={upcomingAssignment.dueDate}
                    description={`Complete the ${upcomingAssignment.title} for ${upcomingAssignment.subject}.`}
                />

                 {/* Floating Action Button for Cera.AI */}
                <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50">
                    <Button asChild size="icon" className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-110">
                        <Link href="/chat">
                            <Bot className="h-7 w-7" />
                            <span className="sr-only">Chat with Cera.AI</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
