
'use client';

import AppLayout from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Bot, Users, Upload, ClipboardCheck, Megaphone, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const features = [
    {
        title: "Manage Student Groups",
        description: "Create and organize groups for your courses and projects.",
        icon: Users,
        href: "#"
    },
    {
        title: "Share Assignments",
        description: "Upload and distribute assignments, notes, and resources.",
        icon: Upload,
        href: "#"
    },
    {
        title: "Automate Attendance",
        description: "Mark and update student attendance digitally and efficiently.",
        icon: ClipboardCheck,
        href: "#"
    },
    {
        title: "Post Announcements",
        description: "Instantly share important circulars and notices with students.",
        icon: Megaphone,
        href: "#"
    }
];


export default function FacultyDashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<{ name: string; branch: string[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    setUserData({
                        name: data.name || currentUser.displayName || 'Faculty',
                        branch: data.branch || [],
                    });
                } else {
                     setUserData({
                        name: currentUser.displayName || 'Faculty',
                        branch: [],
                    });
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                     {loading ? (
                        <>
                            <Skeleton className="h-9 w-64 mb-2" />
                            <Skeleton className="h-5 w-48" />
                        </>
                    ) : (
                        <>
                             <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline text-foreground">
                                Welcome, {userData?.name || 'Faculty'}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <p className="text-muted-foreground">
                                    Your dashboard for:
                                </p>
                                {userData?.branch?.map(b => <Badge key={b} variant="secondary">{b}</Badge>)}
                            </div>
                        </>
                     )}
                </div>
                 <Button asChild variant="outline" className="shrink-0">
                    <Link href="/chat">
                        <Bot className="mr-2 h-4 w-4" />
                        Ask Cera.AI
                    </Link>
                </Button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search for students, groups, or courses..." className="pl-10" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature) => (
                    <Card key={feature.title} className="glassmorphism hover:border-primary/50 transition-all flex flex-col">
                        <CardHeader className="flex-row items-start gap-4">
                             <div className="p-3 bg-primary/10 rounded-lg">
                                <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{feature.title}</CardTitle>
                                <CardDescription className="text-sm mt-1">{feature.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            <Button asChild variant="secondary" className="w-full">
                                <Link href={feature.href}>
                                    Go to {feature.title.split(' ')[0]} <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

             {/* Quick Actions / Cera.AI Suggestions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-accent-foreground" />
                        AI-Powered Actions
                    </CardTitle>
                    <CardDescription>
                        Let Cera.AI help you with common tasks.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row flex-wrap gap-2">
                    <Button variant="outline" size="sm">"Show me today's absent students"</Button>
                    <Button variant="outline" size="sm">"List students with low attendance"</Button>
                    <Button variant="outline" size="sm">"Create a new assignment for Physics 101"</Button>
                </CardContent>
            </Card>

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
    );
}
