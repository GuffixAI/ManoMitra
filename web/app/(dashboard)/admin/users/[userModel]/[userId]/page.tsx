// web/app/(dashboard)/admin/users/[userModel]/[userId]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { useUserById, useEmergencyAccess } from "@/hooks/api/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function UserDetailsPage() {
    const params = useParams();
    const userId = params.userId as string;
    const userModel = params.userModel as string;

    const { data: user, isLoading } = useUserById(userId, userModel);
    const emergencyAccessMutation = useEmergencyAccess();

    const handleAction = (action: 'suspend' | 'activate') => {
        emergencyAccessMutation.mutate({ userId, userType: userModel, action });
    };

    if (isLoading) return <div className="flex h-full justify-center items-center"><Spinner /></div>;
    if (!user) return <div>User not found.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">User Details</h1>
            <Card>
                <CardHeader><CardTitle>{user.name}</CardTitle><CardDescription>{user.email}</CardDescription></CardHeader>
                <CardContent>{/* Display other user details here */}</CardContent>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle /> Emergency Actions</CardTitle>
                    <CardDescription>These actions are immediate and should be used with caution.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    {!user.isActive ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="outline"><ShieldCheck className="mr-2 h-4 w-4"/> Reactivate Account</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will reactivate the user's account, allowing them to log in and use the platform immediately.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleAction('activate')}>Reactivate</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive"><AlertTriangle className="mr-2 h-4 w-4"/> Suspend Account</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will immediately suspend the user's account, preventing them from logging in.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleAction('suspend')}>Suspend</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}