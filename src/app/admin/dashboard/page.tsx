
'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Percent, Wallet, Shield, Database, Megaphone, Bot, ArrowRight } from "lucide-react";
import { Bar, Pie, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Cell, BarChart } from "recharts";
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, User } from 'firebase/auth';
import { format, subMonths, getMonth, getYear } from 'date-fns';

const feeData = [
    { name: 'Paid', value: 800 },
    { name: 'Pending', value: 200 },
    { name: 'Overdue', value: 50 },
];
const FEE_COLORS = ['hsl(var(--chart-2))', 'hsl(var(--chart-4))', 'hsl(var(--destructive))'];

const adminActions = [
    { title: "Manage User Roles", icon: Shield, href: "#" },
    { title: "Database Backup", icon: Database, href: "#" },
    { title: "Broadcast Announcement", icon: Megaphone, href: "#" },
];


export default function AdminDashboardPage() {
    const [studentCount, setStudentCount] = useState(0);
    const [facultyCount, setFacultyCount] = useState(0);
    const [averageAttendance, setAverageAttendance] = useState(0);
    const [attendanceTrendData, setAttendanceTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [permissionError, setPermissionError] = useState(false);
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<User | null>(null);

     useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const usersQuery = query(collection(db, 'users'));
        const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
            let students = 0;
            let faculty = 0;
            snapshot.forEach(doc => {
                const user = doc.data();
                if (user.role === 'student') {
                    students++;
                } else if (user.role === 'faculty') {
                    faculty++;
                }
            });
            setStudentCount(students);
            setFacultyCount(faculty);
            setLoading(false);
            setPermissionError(false);
        }, (error) => {
            console.error(`Firestore error (users):`, error.message);
            if (error.message.includes('permission-denied')) {
                if (!permissionError) {
                     toast({
                        title: "Permission Denied",
                        description: `Could not fetch user data.`,
                        variant: "destructive"
                    });
                    setPermissionError(true);
                }
            }
            setStudentCount(0);
            setFacultyCount(0);
            setLoading(false);
        });

        const attendanceQuery = query(collection(db, 'attendance'));
        const attendanceUnsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
            let totalPresent = 0;
            let totalEntries = 0;
            const monthlyData: { [key: string]: { present: number; total: number } } = {};

            snapshot.forEach(doc => {
                const record = doc.data();
                const attendees = record.attendees || {};
                const recordDate = new Date(record.date);

                Object.values(attendees).forEach((status) => {
                    totalEntries++;
                    if (status === 'present') {
                        totalPresent++;
                    }
                });
                
                const monthKey = format(recordDate, 'yyyy-MM');
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { present: 0, total: 0 };
                }
                 Object.values(attendees).forEach((status) => {
                    monthlyData[monthKey].total++;
                    if (status === 'present') {
                        monthlyData[monthKey].present++;
                    }
                });

            });
            
            setAverageAttendance(totalEntries > 0 ? Math.round((totalPresent / totalEntries) * 100) : 0);

            const trendData = [];
            for (let i = 5; i >= 0; i--) {
                const d = subMonths(new Date(), i);
                const monthKey = format(d, 'yyyy-MM');
                const data = monthlyData[monthKey];
                trendData.push({
                    name: format(d, 'MMM'),
                    attendance: data && data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
                });
            }
            setAttendanceTrendData(trendData as any);

        }, (error) => {
            console.error(`Firestore error (attendance):`, error.message);
             if (error.message.includes('permission-denied')) {
                 toast({
                    title: "Permission Denied",
                    description: `Could not fetch attendance data.`,
                    variant: "destructive"
                });
             }
        });


        return () => {
            usersUnsubscribe();
            attendanceUnsubscribe();
        }
    }, [currentUser, toast, permissionError]);
    
    const quickStats = [
        { title: "Total Students", value: studentCount.toString(), icon: Users, color: "text-blue-400" },
        { title: "Total Faculty", value: facultyCount.toString(), icon: Briefcase, color: "text-purple-400" },
        { title: "Avg. Attendance", value: `${averageAttendance}%`, icon: Percent, color: "text-green-400" },
        { title: "Fees Collected", value: "$1.2M", icon: Wallet, color: "text-yellow-400" },
    ];


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">
                    Admin Overview
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage everything at once from a single, powerful hub.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat) => (
                    <Card key={stat.title} className="glassmorphism">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-8 w-1/2" />
                            ) : (
                                <div className="text-2xl font-bold">{stat.value}</div>
                            )}
                            {permissionError && (stat.title.includes("Students") || stat.title.includes("Faculty") || stat.title.includes("Attendance")) && (
                                <p className="text-xs text-destructive">Permission Denied</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Analytics & Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Left Column: Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="glassmorphism">
                        <CardHeader>
                            <CardTitle>Attendance Trends</CardTitle>
                            <CardDescription>Last 6 months student attendance rate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={attendanceTrendData}>
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`}/>
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: 'hsl(var(--background))', 
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: 'var(--radius)'
                                        }}
                                        cursor={{fill: 'hsl(var(--accent))'}}
                                    />
                                    <Bar dataKey="attendance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                 {/* Right Column: Actions & Fee status */}
                <div className="space-y-6">
                     <Card className="glassmorphism">
                        <CardHeader>
                            <CardTitle>Fee Collection Status</CardTitle>
                             <CardDescription>Current academic year</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={feeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                         {feeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={FEE_COLORS[index % FEE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: 'hsl(var(--background))', 
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: 'var(--radius)'
                                        }}
                                    />
                                    <Legend iconSize={10} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="glassmorphism">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             {adminActions.map(action => (
                                <Button key={action.title} variant="outline" className="w-full justify-start">
                                    <action.icon className="mr-2 h-4 w-4" />
                                    {action.title}
                                    <ArrowRight className="ml-auto h-4 w-4" />
                                </Button>
                             ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            {/* AI Assistant Card */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-accent-foreground" />
                        AI-Powered Actions
                    </CardTitle>
                    <CardDescription>
                        Let Cera.AI help you with administrative tasks.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row flex-wrap gap-2">
                    <Button variant="outline" size="sm">"Generate monthly attendance report"</Button>
                    <Button variant="outline" size="sm">"List all students with pending fees"</Button>
                    <Button variant="outline" size="sm">"What is the faculty to student ratio?"</Button>
                </CardContent>
            </Card>

        </div>
    );
}
