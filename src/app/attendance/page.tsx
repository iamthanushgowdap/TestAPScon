
'use client';

import { useState, useEffect } from 'react';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, AlertTriangle, Bell, Percent, BookOpen } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface SubjectAttendance {
    subject: string;
    present: number;
    total: number;
    percentage: number;
}

export default function AttendancePage() {
    const [attendanceData, setAttendanceData] = useState<SubjectAttendance[]>([]);
    const [overallPercentage, setOverallPercentage] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const { branch, semester } = userData;

                    if (branch && semester) {
                        const q = query(
                            collection(db, "attendance"),
                            where("branch", "==", branch),
                            where("semester", "==", semester)
                        );
                        
                        return onSnapshot(q, (snapshot) => {
                            const subjectMap: { [key: string]: { present: number; total: number } } = {};
                            
                            snapshot.forEach(doc => {
                                const data = doc.data();
                                const studentStatus = data.attendees[user.uid];

                                if (studentStatus) {
                                    if (!subjectMap[data.subject]) {
                                        subjectMap[data.subject] = { present: 0, total: 0 };
                                    }
                                    subjectMap[data.subject].total++;
                                    if (studentStatus === 'present') {
                                        subjectMap[data.subject].present++;
                                    }
                                }
                            });

                            const subjectsArray: SubjectAttendance[] = Object.keys(subjectMap).map(subject => ({
                                subject,
                                present: subjectMap[subject].present,
                                total: subjectMap[subject].total,
                                percentage: Math.round((subjectMap[subject].present / subjectMap[subject].total) * 100)
                            }));
                            
                            const totalPresent = subjectsArray.reduce((acc, s) => acc + s.present, 0);
                            const totalClasses = subjectsArray.reduce((acc, s) => acc + s.total, 0);
                            
                            setAttendanceData(subjectsArray);
                            setOverallPercentage(totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0);
                            setLoading(false);
                        });
                    }
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const pieData = [
        { name: 'Present', value: overallPercentage },
        { name: 'Absent', value: 100 - overallPercentage },
    ];

    const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];

    const getSubjectColor = (subjectName: string) => {
        // Simple hash function to get a color index
        let hash = 0;
        for (let i = 0; i < subjectName.length; i++) {
            hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = ['text-blue-400', 'text-green-400', 'text-purple-400', 'text-orange-400', 'text-pink-400'];
        return colors[Math.abs(hash) % colors.length];
    }
    
    return (
        <AppLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">Your Attendance Overview</h1>
                        <p className="text-muted-foreground mt-2">Track your progress and stay on top of your classes.</p>
                    </div>
                    <Button asChild variant="outline" className="shrink-0">
                        <Link href="/chat">
                            <Bot className="mr-2 h-4 w-4" />
                            Ask Cera.AI
                        </Link>
                    </Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Left Column: Overall Attendance Chart */}
                    <Card className="lg:col-span-1 glassmorphism flex flex-col items-center justify-center p-6">
                        <CardHeader className="text-center p-0 mb-4">
                            <CardTitle className="text-2xl">Overall Attendance</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <Skeleton className="h-56 w-56 rounded-full" /> : (
                                <div className="relative h-48 w-48 sm:h-56 sm:w-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="70%"
                                                outerRadius="100%"
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                             <Tooltip formatter={(value) => `${value}%`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-5xl font-bold text-foreground">{overallPercentage}</span>
                                        <Percent className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                            <p className="text-center text-muted-foreground mt-4">You're in great standing. Keep it up!</p>
                        </CardContent>
                    </Card>

                    {/* Right Column: Subject-wise Breakdown */}
                    <div className="lg:col-span-2">
                         <h2 className="text-xl font-semibold mb-4">Subject-wise Breakdown</h2>
                         {loading ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
                            </div>
                         ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {attendanceData.map((subject) => (
                                    <Card key={subject.subject} className={cn(
                                        "glassmorphism transition-all hover:border-primary/50",
                                        subject.percentage < 75 && "border-red-500/50 bg-red-500/10"
                                    )}>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="flex items-center gap-3">
                                                <BookOpen className={cn("h-6 w-6", getSubjectColor(subject.subject))} />
                                                <CardTitle className="text-base font-semibold">{subject.subject}</CardTitle>
                                            </div>
                                            {subject.percentage < 75 && <AlertTriangle className="h-5 w-5 text-red-400" />}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-baseline gap-2">
                                                <span className={cn("text-3xl font-bold", subject.percentage < 75 ? "text-red-400" : "text-foreground")}>{subject.percentage}%</span>
                                                <p className="text-sm text-muted-foreground">({subject.present}/{subject.total} classes)</p>
                                            </div>
                                             <div className="flex items-center gap-2 mt-4">
                                                <Button variant="ghost" size="sm" className="p-1 h-auto">
                                                    <Bell className="h-4 w-4 text-muted-foreground"/>
                                                </Button>
                                                <span className="text-xs text-muted-foreground">Set reminder for low attendance</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                             </div>
                         )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
