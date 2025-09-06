// web/app/(dashboard)/admin/volunteers/page.tsx
"use client";
import { useState } from "react";
import { useAllVolunteers, useUpdateUserStatus } from "@/hooks/api/useAdmin";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function AdminVolunteersPage() {
    const { data: volunteersResponse, isLoading } = useAllVolunteers();
    const updateUserStatusMutation = useUpdateUserStatus();
    const { registerUser, isLoading: isRegistering, error: registerError, clearError } = useAuthStore();
    
    const [isDialogOpen, setDialogOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const handleStatusChange = (userId: string, currentStatus: boolean) => {
        updateUserStatusMutation.mutate({ userId, userType: 'volunteer', isActive: !currentStatus });
    };

    const handleAppointVolunteer = async (data: any) => {
        clearError();
        const success = await registerUser({
            name: data.name,
            email: data.email,
            password: data.password,
            confirmPassword: data.password, // No confirm field in this simple form
        }, 'volunteer');

        if (success) {
            toast.success("Volunteer appointed successfully!");
            reset();
            setDialogOpen(false);
        } else {
            // Error is handled by the auth store, which sets the `registerError` state
            toast.error(registerError || "Failed to appoint volunteer.");
        }
    };
    
    const volunteers = volunteersResponse?.data || [];

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Volunteers</h1>
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><UserPlus className="mr-2 h-4 w-4"/> Appoint Volunteer</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Appoint New Volunteer</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit(handleAppointVolunteer)} className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" {...register("name", { required: "Name is required" })} />
                                {errors.name && <p className="text-sm text-destructive mt-1">{`${errors.name.message}`}</p>}
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register("email", { required: "Email is required" })} />
                                {errors.email && <p className="text-sm text-destructive mt-1">{`${errors.email.message}`}</p>}
                            </div>
                            <div>
                                <Label htmlFor="password">Temporary Password</Label>
                                <Input id="password" type="password" {...register("password", { required: "Password is required", minLength: { value: 8, message: "Must be at least 8 characters" }})} />
                                {errors.password && <p className="text-sm text-destructive mt-1">{`${errors.password.message}`}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isRegistering}>
                                {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Appoint Volunteer
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Active</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? <TableRow><TableCell colSpan={4} className="h-24 text-center"><Spinner/></TableCell></TableRow>
                    : volunteers?.map((v: any) => (
                        <TableRow key={v._id}>
                            <TableCell>{v.name}</TableCell>
                            <TableCell>{v.email}</TableCell>
                            <TableCell>
                                <Badge variant={v.isActive ? 'default' : 'destructive'}>
                                    {v.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                 <Switch
                                    checked={v.isActive}
                                    onCheckedChange={() => handleStatusChange(v._id, v.isActive)}
                                    disabled={updateUserStatusMutation.isPending}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}