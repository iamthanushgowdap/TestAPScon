
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, GraduationCap, Percent, KeyRound, Bell, Palette, Bot, Edit, Save } from "lucide-react";
import { Progress } from "../ui/progress";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged } from "firebase/auth";

interface StudentData {
    name: string;
    usn: string;
    email: string;
    phone?: string;
    branch: string;
    year: string;
    photoURL?: string;
}

export default function StudentProfile() {
    const [userData, setUserData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
       const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData({
                        name: data.name || user.displayName || 'Student',
                        usn: data.usn || '',
                        email: user.email || '',
                        phone: data.phone || '',
                        branch: data.branch || '',
                        year: data.year || '',
                        photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200`
                    });
                }
                setLoading(false);
            } else {
                setLoading(false);
            }
       });
       return () => unsubscribe();
    }, []);

    const handleSaveChanges = async () => {
        if (!auth.currentUser || !userData) return;
        setIsSaving(true);
        const userRef = doc(db, "users", auth.currentUser.uid);
        try {
            await updateDoc(userRef, {
                name: userData.name,
                phone: userData.phone,
            });
            toast({
                title: "Success",
                description: "Your profile has been updated.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-80 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (!userData) {
        return <div className="p-8 text-center">Could not load user data.</div>
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Your Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your student account details and settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Overview */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="glassmorphism">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                                <AvatarImage src={userData.photoURL} alt={userData.name} data-ai-hint="person student" />
                                <AvatarFallback className="text-4xl">{userData.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <Button size="sm" variant="ghost" className="mb-4">
                                <Edit className="mr-2 h-4 w-4" /> Change Photo
                            </Button>
                            <h2 className="text-2xl font-bold font-headline">{userData.name}</h2>
                            <p className="text-muted-foreground">{userData.usn}</p>
                            <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground">
                                <GraduationCap className="mr-1 h-3 w-3" />
                                Student
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glassmorphism">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Percent /> Attendance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="flex justify-between mb-1 text-sm">
                                    <span className="font-medium">Overall Attendance</span>
                                    <span className="text-primary font-semibold">85%</span>
                                </div>
                                <Progress value={85} />
                            </div>
                            <Button variant="link" size="sm" className="p-0 h-auto">View Detailed Report</Button>
                        </CardContent>
                    </Card>

                    <Card className="glassmorphism">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Bot /> Cera.AI Assistant</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <p className="text-sm text-muted-foreground">Use AI to get quick updates.</p>
                             <Button variant="outline" size="sm" className="w-full">"Update my phone number"</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="glassmorphism">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User /> Personal Information</CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" placeholder="+91 98765 43210" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} />
                                </div>
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="branch">Branch</Label>
                                    <Input id="branch" value={userData.branch} readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input id="year" value={userData.year} readOnly />
                                </div>
                            </div>
                            <Button onClick={handleSaveChanges} disabled={isSaving}>
                                <Save className="mr-2 h-4 w-4" /> 
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="glassmorphism">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><KeyRound /> Security</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="secondary">Change Password</Button>
                        </CardContent>
                    </Card>

                    <Card className="glassmorphism">
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
                            <CardDescription>Choose how you want to be notified.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50">
                                <Label htmlFor="deadline-notifs" className="flex-1 cursor-pointer">Assignment Deadlines</Label>
                                <Switch id="deadline-notifs" defaultChecked />
                            </div>
                             <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50">
                                <Label htmlFor="event-notifs" className="flex-1 cursor-pointer">Campus Events</Label>
                                <Switch id="event-notifs" defaultChecked />
                            </div>
                             <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50">
                                <Label htmlFor="attendance-notifs" className="flex-1 cursor-pointer">Low Attendance Alerts</Label>
                                <Switch id="attendance-notifs" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
