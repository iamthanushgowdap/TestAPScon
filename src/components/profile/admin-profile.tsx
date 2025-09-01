
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Shield, KeyRound, Bell, Palette, Bot, Edit, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged } from "firebase/auth";

interface AdminData {
    name: string;
    email: string;
    photoURL?: string;
}

export default function AdminProfile() {
    const [userData, setUserData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
       const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData({
                        name: data.name || user.displayName || 'Admin',
                        email: user.email || '',
                        photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200`,
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
        setIsEditing(true);
        const userRef = doc(db, "users", auth.currentUser.uid);
        try {
            await updateDoc(userRef, {
                name: userData.name,
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
            setIsEditing(false);
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
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-32 w-full" />
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
                <p className="text-muted-foreground mt-1">Manage your administrator account details and settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Overview */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="glassmorphism">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                                <AvatarImage src={userData.photoURL} alt={userData.name} data-ai-hint="person photo" />
                                <AvatarFallback className="text-4xl">{userData.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                             <Button size="sm" variant="ghost" className="mb-4">
                                <Edit className="mr-2 h-4 w-4" /> Change Photo
                            </Button>
                            <h2 className="text-2xl font-bold font-headline">{userData.name}</h2>
                            <p className="text-muted-foreground">{userData.email}</p>
                             <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                                <Shield className="mr-1 h-3 w-3" />
                                Administrator
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glassmorphism">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Bot /> Cera.AI Assistant</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <p className="text-sm text-muted-foreground">Use AI to streamline your tasks.</p>
                             <Button variant="outline" size="sm" className="w-full">"Generate a report of all pending user approvals"</Button>
                             <Button variant="outline" size="sm" className="w-full">"Broadcast a test announcement"</Button>
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
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={userData.email} readOnly />
                            </div>
                             <Button onClick={handleSaveChanges} disabled={isEditing}><Save className="mr-2 h-4 w-4" />{isEditing ? 'Saving...' : 'Save Changes'}</Button>
                        </CardContent>
                    </Card>

                    <Card className="glassmorphism">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><KeyRound /> Security</CardTitle>
                            <CardDescription>Manage your password and security settings.</CardDescription>
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
                                <Label htmlFor="approval-notifs" className="flex-1 cursor-pointer">Pending Approvals</Label>
                                <Switch id="approval-notifs" defaultChecked />
                            </div>
                             <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50">
                                <Label htmlFor="system-notifs" className="flex-1 cursor-pointer">System Alerts</Label>
                                <Switch id="system-notifs" defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
