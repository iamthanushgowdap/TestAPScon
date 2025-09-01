
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, UserCheck, Search } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

type StudentStatus = 'pending' | 'approved' | 'declined';

interface PendingStudent {
    id: number;
    email: string;
    usn: string;
    branch: string;
    status: StudentStatus;
}

const initialStudents: PendingStudent[] = [
    { id: 1, email: 'student1@example.com', usn: '1AP24CS001', branch: 'CSE', status: 'pending' },
    { id: 2, email: 'student2@example.com', usn: '1AP24IS002', branch: 'ISE', status: 'pending' },
    { id: 3, email: 'student3@example.com', usn: '1AP23EC003', branch: 'ECE', status: 'approved' },
    { id: 4, email: 'student4@example.com', usn: '1AP23ME004', branch: 'MECH', status: 'declined' },
];

export default function ApproveUsersPage() {
    const [students, setStudents] = useState<PendingStudent[]>(initialStudents);
    const { toast } = useToast();

    const handleApproval = (id: number, newStatus: 'approved' | 'declined') => {
        setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
        toast({
            title: `User ${newStatus}`,
            description: `The student account has been successfully ${newStatus}.`,
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground flex items-center gap-2">
                    <UserCheck />
                    Approve New Students
                </h1>
                <p className="text-muted-foreground mt-1">
                    Review and manage pending registration requests.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pending Registrations</CardTitle>
                    <CardDescription>
                        The following students have registered and are awaiting approval.
                    </CardDescription>
                     <div className="relative pt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search by USN, email, or branch..." className="pl-10" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>USN</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell className="font-mono">{student.usn}</TableCell>
                                    <TableCell>{student.branch}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            student.status === 'pending' ? 'secondary' :
                                            student.status === 'approved' ? 'default' : 'destructive'
                                        } className="capitalize">
                                            {student.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {student.status === 'pending' && (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-green-500 hover:bg-green-500/10 hover:text-green-600" onClick={() => handleApproval(student.id, 'approved')}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-600" onClick={() => handleApproval(student.id, 'declined')}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
