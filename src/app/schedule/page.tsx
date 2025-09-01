
'use client';

import { useState } from 'react';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Calendar, Clock, User, AlertCircle, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from '@/lib/utils';
import Link from 'next/link';

const scheduleData = {
    Monday: [
        { type: 'class', subject: 'Quantum Physics', time: '09:00 - 10:30', location: 'Hall-A', faculty: 'Dr. Evelyn Reed', color: 'bg-blue-500/20 text-blue-300' },
        { type: 'class', subject: 'Data Structures', time: '11:00 - 12:30', location: 'Lab-3', faculty: 'Prof. Samuel Chen', color: 'bg-green-500/20 text-green-300' },
    ],
    Tuesday: [
        { type: 'class', subject: 'Calculus III', time: '10:00 - 11:30', location: 'Room-201', faculty: 'Dr. Maria Garcia', color: 'bg-red-500/20 text-red-300' },
        { type: 'exam', subject: 'Mid-Term: Linear Algebra', time: '14:00 - 16:00', location: 'Exam Hall 1', faculty: 'Dr. Ben Carter', color: 'bg-yellow-500/20 text-yellow-300' },
    ],
    Wednesday: [
        { type: 'class', subject: 'Quantum Physics', time: '09:00 - 10:30', location: 'Hall-A', faculty: 'Dr. Evelyn Reed', color: 'bg-blue-500/20 text-blue-300' },
        { type: 'class', subject: 'Machine Learning', time: '13:00 - 14:30', location: 'AI Lab', faculty: 'Prof. Alan Turing', color: 'bg-purple-500/20 text-purple-300' },
    ],
    Thursday: [
        { type: 'class', subject: 'Data Structures', time: '11:00 - 12:30', location: 'Lab-3', faculty: 'Prof. Samuel Chen', color: 'bg-green-500/20 text-green-300' },
    ],
    Friday: [
        { type: 'class', subject: 'Calculus III', time: '10:00 - 11:30', location: 'Room-201', faculty: 'Dr. Maria Garcia', color: 'bg-red-500/20 text-red-300' },
        { type: 'class', subject: 'Machine Learning', time: '13:00 - 14:30', location: 'AI Lab', faculty: 'Prof. Alan Turing', color: 'bg-purple-500/20 text-purple-300' },
    ],
};

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function SchedulePage() {
    const today = new Date().toLocaleString('en-us', { weekday: 'long' });
    const currentDay = weekDays.includes(today) ? today : 'Monday';
    const [selectedDay, setSelectedDay] = useState(currentDay);

    const handleDayChange = (direction: 'next' | 'prev') => {
        const currentIndex = weekDays.indexOf(selectedDay);
        let newIndex;
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % weekDays.length;
        } else {
            newIndex = (currentIndex - 1 + weekDays.length) % weekDays.length;
        }
        setSelectedDay(weekDays[newIndex]);
    }

    const daySchedule = scheduleData[selectedDay as keyof typeof scheduleData] || [];

    return (
        <AppLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">Your Schedule at a Glance</h1>
                        <p className="text-muted-foreground mt-2">Stay organized and never miss a class or exam.</p>
                    </div>
                     <Button asChild variant="outline" className="shrink-0">
                        <Link href="/chat">
                            <Bot className="mr-2 h-4 w-4" />
                            Ask Cera.AI
                        </Link>
                    </Button>
                </header>

                <Card className="mt-8 glassmorphism">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleDayChange('prev')}>
                                    <ChevronLeft />
                                </Button>
                                 <h2 className="text-xl font-semibold text-center w-32">{selectedDay}</h2>
                                <Button variant="ghost" size="icon" onClick={() => handleDayChange('next')}>
                                    <ChevronRight />
                                </Button>
                            </div>
                           <div className="hidden md:flex items-center gap-2">
                            {weekDays.map(day => (
                                <Button 
                                    key={day} 
                                    variant={selectedDay === day ? 'default' : 'ghost'} 
                                    onClick={() => setSelectedDay(day)}
                                    className="capitalize"
                                >
                                    {day.slice(0, 3)}
                                </Button>
                            ))}
                           </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {daySchedule.length > 0 ? (
                            daySchedule.map((item, index) => (
                                <div key={index} className={cn("rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-l-4", 
                                    item.type === 'exam' ? 'border-yellow-400' : 'border-primary',
                                    item.color
                                )}>
                                    <div className="flex-1 space-y-1">
                                        <p className="font-bold text-lg text-foreground">{item.subject}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {item.time}</span>
                                            <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {item.faculty}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm font-medium text-muted-foreground">{item.location}</p>
                                        {item.type === 'exam' && <AlertCircle className="h-5 w-5 text-yellow-400" />}
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                            <Bell className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Calendar className="mx-auto h-12 w-12 mb-4" />
                                <p>No classes or exams scheduled for {selectedDay}.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}