
'use client';

import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Book, Calculator, FlaskConical, AlertTriangle, Bell, Percent } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { cn } from "@/lib/utils";


const overallAttendance = 85;

const subjectData = [
  { name: 'Quantum Physics', attendance: 92, icon: FlaskConical, color: 'text-blue-400' },
  { name: 'Data Structures', attendance: 88, icon: Book, color: 'text-green-400' },
  { name: 'Calculus III', attendance: 74, icon: Calculator, color: 'text-red-400' },
  { name: 'Machine Learning', attendance: 95, icon: Bot, color: 'text-purple-400' },
];

const pieData = [
  { name: 'Present', value: overallAttendance },
  { name: 'Absent', value: 100 - overallAttendance },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];

export default function AttendancePage() {
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Your Attendance Overview</h1>
                <p className="text-muted-foreground mt-2">Track your progress and stay on top of your classes.</p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
                <Link href="/chat">
                    <Bot className="mr-2 h-4 w-4" />
                    Ask Cera.AI
                </Link>
            </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column: Overall Attendance Chart */}
          <Card className="lg:col-span-1 glassmorphism flex flex-col items-center justify-center p-6">
            <CardHeader className="text-center p-0 mb-4">
              <CardTitle className="text-2xl">Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-48 w-48 sm:h-56 sm:w-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="100%"
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-foreground">{overallAttendance}</span>
                    <Percent className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <p className="text-center text-muted-foreground mt-4">You're in great standing. Keep it up!</p>
            </CardContent>
          </Card>

          {/* Right Column: Subject-wise Breakdown */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="semester">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold">Subject-wise Breakdown</h2>
                    <TabsList className="grid w-full sm:w-auto grid-cols-3">
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="semester">Semester</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="semester">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {subjectData.map((subject) => (
                      <Card key={subject.name} className={cn(
                          "glassmorphism transition-all hover:border-primary/50",
                          subject.attendance < 75 && "border-red-500/50 bg-red-500/10"
                      )}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                           <div className="flex items-center gap-3">
                                <subject.icon className={cn("h-6 w-6", subject.color)} />
                                <CardTitle className="text-base font-semibold">{subject.name}</CardTitle>
                           </div>
                           {subject.attendance < 75 && <AlertTriangle className="h-5 w-5 text-red-400" />}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-baseline gap-2">
                             <span className={cn("text-3xl font-bold", subject.attendance < 75 ? "text-red-400" : "text-foreground")}>{subject.attendance}%</span>
                             <p className="text-sm text-muted-foreground">attendance</p>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <Button variant="ghost" size="sm" className="p-1 h-auto">
                                <Bell className="h-4 w-4 text-muted-foreground"/>
                            </Button>
                            <span className="text-xs text-muted-foreground">Set reminder</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="week">
                    <p className="text-muted-foreground text-center py-8">Weekly data is not yet available.</p>
                </TabsContent>
                 <TabsContent value="month">
                    <p className="text-muted-foreground text-center py-8">Monthly data is not yet available.</p>
                </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
