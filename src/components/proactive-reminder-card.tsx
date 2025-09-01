import { proactiveDeadlineReminders } from '@/ai/flows/proactive-deadline-reminders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { format, addDays } from 'date-fns';

export async function ProactiveReminderCard() {
    const deadlineDate = addDays(new Date(), 3);
    const deadlineString = format(deadlineDate, 'EEEE, MMMM do');

    let reminder;
    try {
        reminder = await proactiveDeadlineReminders({
            taskName: 'Submit Physics 101 Lab Report',
            deadline: deadlineString,
            description: 'Final lab report for the semester on wave-particle duality. Make sure all sections are complete and submitted via the student portal.'
        });
    } catch (error) {
        console.error("Failed to fetch proactive reminder:", error);
        // Fallback content or null render
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
