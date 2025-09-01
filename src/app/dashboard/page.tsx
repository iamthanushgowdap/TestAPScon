import AppLayout from "@/components/app-layout";
import { ProactiveReminderCard } from "@/components/proactive-reminder-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BotMessageSquare, BookCopy, ListTodo } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const quickAccessItems = [
    { title: "Manage Tasks", description: "View and organize your to-do list.", href: "/tasks", icon: ListTodo },
    { title: "College Resources", description: "Find essential campus information.", href: "/resources", icon: BookCopy },
    { title: "Chat with Cera.AI", description: "Get answers to your questions.", href: "/chat", icon: BotMessageSquare },
];

export default function DashboardPage() {
    return (
        <AppLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
                <div className="p-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold tracking-tight font-headline text-foreground">Welcome Back!</h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl">
                            Your smart campus companion is ready to help you conquer the day. What will you accomplish?
                        </p>
                    </div>
                </div>

                <ProactiveReminderCard />

                <div>
                    <h2 className="text-2xl font-bold font-headline tracking-tight">Quick Access</h2>
                    <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
                        {quickAccessItems.map((item) => (
                            <Card key={item.href} className="hover:shadow-md transition-shadow group glassmorphism">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                                    <item.icon className="h-6 w-6 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                                    <Button asChild variant="ghost" size="sm" className="-ml-3">
                                        <Link href={item.href}>
                                            Go to {item.title.split(' ')[0]}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
