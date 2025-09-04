
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, User, Search, Shield, Briefcase, GraduationCap } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type UserRole = 'student' | 'faculty' | 'admin';
type UserStatus = 'pending' | 'approved' | 'declined';

interface UserData {
    id: string;
    name: string;
    email: string;
    usn?: string;
    role: UserRole;
    status: UserStatus;
    branch?: string;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (querySnapshot) => {
            const fetchedUsers: UserData[] = [];
            querySnapshot.forEach((doc) => {
                fetchedUsers.push({ id: doc.id, ...doc.data() } as UserData);
            });
            setUsers(fetchedUsers);
            setFilteredUsers(fetchedUsers);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users: ", error);
            toast({
                title: "Permission Denied",
                description: "You may not have permission to view all users. Please update Firestore security rules to allow admin list reads.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    useEffect(() => {
        const results = users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.usn && user.usn.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteDoc(doc(db, "users", userId));
            toast({
                title: "User Deleted",
                description: "The user has been successfully removed.",
            });
        } catch (error) {
             toast({
                title: "Error Deleting User",
                description: "There was a problem removing the user.",
                variant: "destructive"
            });
        }
    };
    
    const RoleIcon = ({ role }: { role: UserRole }) => {
        switch (role) {
            case 'admin': return <Shield className="h-4 w-4 text-red-400" />;
            case 'faculty': return <Briefcase className="h-4 w-4 text-purple-400" />;
            case 'student': return <GraduationCap className="h-4 w-4 text-blue-400" />;
            default: return <User className="h-4 w-4" />;
        }
    }


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground flex items-center gap-2">
                    <User />
                    User Management
                </h1>
                <p className="text-muted-foreground mt-1">
                    View, edit, and manage all users in the system.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Registered Users</CardTitle>
                    <CardDescription>
                        A complete list of students, faculty, and administrators.
                    </CardDescription>
                     <div className="relative pt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name, email, or USN..." 
                            className="pl-10" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>USN</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="font-mono">{user.usn || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <RoleIcon role={user.role} />
                                            <span className="capitalize">{user.role}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            user.status === 'pending' ? 'secondary' :
                                            user.status === 'approved' ? 'default' : 'destructive'
                                        } className="capitalize">
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button size="icon" variant="outline" className="h-8 w-8">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="icon" variant="destructive" className="h-8 w-8">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the user
                                                        and remove their data from our servers.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
