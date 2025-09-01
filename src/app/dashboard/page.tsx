
import AppLayout from "@/components/app-layout";
import { ProactiveReminderCard } from "@/components/proactive-reminder-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, BookCopy, ListTodo, Calendar, Clock, FileText, Wallet, Percent, Bell, PartyPopper } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const scheduleItems = [
    { time: '09:00 AM', subject: 'Physics 101', location: 'Hall C' },
    { time: '11:00 AM', subject: 'Calculus II', location: 'Room 204' },
    { time: '02:00 PM', subject: 'Intro to AI', location: 'Lab A' },
];

const assignmentItems = [
    { title: 'Lab Report 3', subject: 'Physics 101', dueDate: 'Tomorrow' },
    { title: 'Problem Set 5', subject: 'Calculus II', dueDate: '3 days' },
];

export default function DashboardPage() {
    return (
        <AppLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-8 relative">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">
                            Hi Tanushree 👋, Welcome Back!
                        </h1>
                        <p className="text-muted-foreground mt-1">
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
                                    {scheduleItems.map(item => (
                                        <div key={item.time} className="flex items-center">
                                            <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                                            <div>
                                                <p className="font-semibold">{item.subject}</p>
                                                <p className="text-sm text-muted-foreground">{item.time} - {item.location}</p>
                                            </div>
                                        </div>
                                    ))}
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
                                            className="stroke-current text-primary"
                                            strokeDasharray="85, 100"
                                            d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831
                                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold">85%</span>
                                        <Percent className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
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

                <ProactiveReminderCard />

                 {/* Floating Action Button for Cera.AI */}
                <div className="fixed bottom-8 right-8 z-50">
                    <Button asChild size="icon" className="h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-110">
                        <Link href="/chat">
                            <Bot className="h-8 w-8" />
                            <span className="sr-only">Chat with Cera.AI</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
