
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Percent, Wallet, BarChart, Shield, Database, Megaphone, Bot, ArrowRight } from "lucide-react";
import { Bar, Pie, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Cell } from "recharts";


const quickStats = [
    { title: "Total Students", value: "1,250", icon: Users, color: "text-blue-400" },
    { title: "Total Faculty", value: "85", icon: Briefcase, color: "text-purple-400" },
    { title: "Avg. Attendance", value: "92%", icon: Percent, color: "text-green-400" },
    { title: "Fees Collected", value: "$1.2M", icon: Wallet, color: "text-yellow-400" },
];

const attendanceData = [
    { name: 'Jan', attendance: 88 },
    { name: 'Feb', attendance: 92 },
    { name: 'Mar', attendance: 95 },
    { name: 'Apr', attendance: 85 },
    { name: 'May', attendance: 91 },
    { name: 'Jun', attendance: 94 },
];

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
]


export default function AdminDashboardPage() {
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
                            <div className="text-2xl font-bold">{stat.value}</div>
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
                                <BarChart data={attendanceData}>
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
