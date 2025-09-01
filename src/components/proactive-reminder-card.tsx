
'use client';

import { proactiveDeadlineReminders, ProactiveDeadlineRemindersOutput } from '@/ai/flows/proactive-deadline-reminders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

export function ProactiveReminderCard() {
    const [reminder, setReminder] = useState<ProactiveDeadlineRemindersOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchReminder() {
            try {
                const deadlineDate = addDays(new Date(), 3);
                const deadlineString = format(deadlineDate, 'EEEE, MMMM do');

                const response = await proactiveDeadlineReminders({
                    taskName: 'Submit Physics 101 Lab Report',
                    deadline: deadlineString,
                    description: 'Final lab report for the semester on wave-particle duality. Make sure all sections are complete and submitted via the student portal.'
                });
                setReminder(response);
            } catch (error) {
                console.error("Failed to fetch proactive reminder:", error);
                // In case of an error, we can just not show the card.
            } finally {
                setIsLoading(false);
            }
        }

        fetchReminder();
    }, []);


    if (isLoading) {
        return (
            <Card className="bg-accent/10 border-accent/20">
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-accent/20 rounded-full">
                            <Lightbulb className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <div>
                            <CardTitle className="font-headline text-accent-foreground">Your AI Assistant</CardTitle>
                            <CardDescription>A smart reminder from Cera.AI</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
        );
    }
    
    if (!reminder) {
        return null;
    }

    return (
        <Card className="bg-accent/10 border-accent/20">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/20 rounded-full">
                        <Lightbulb className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                        <CardTitle className="font-headline text-accent-foreground">Your AI Assistant</CardTitle>
                        <CardDescription>A smart reminder from Cera.AI</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-foreground/90">{reminder.reminderMessage}</p>
            </CardContent>
        </Card>
    );
}
