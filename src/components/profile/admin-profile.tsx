
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Shield, KeyRound, Bell, Palette, Bot, Edit, Save } from "lucide-react";

export default function AdminProfile() {
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
                                <AvatarImage src="https://picsum.photos/200/200" alt="Admin User" data-ai-hint="person photo" />
                                <AvatarFallback className="text-4xl">A</AvatarFallback>
                            </Avatar>
                             <Button size="sm" variant="ghost" className="mb-4">
                                <Edit className="mr-2 h-4 w-4" /> Change Photo
                            </Button>
                            <h2 className="text-2xl font-bold font-headline">Admin User</h2>
                            <p className="text-muted-foreground">admin@gmail.com</p>
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
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" defaultValue="Admin" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" defaultValue="User" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" defaultValue="admin@gmail.com" />
                            </div>
                             <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
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
