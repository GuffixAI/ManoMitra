// web/app/(dashboard)/admin/counsellors/page.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAllCounsellors, useCreateCounsellor, useUpdateUserStatus } from "@/hooks/api/useAdmin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateCounsellorForm } from "@/components/forms/CreateCounsellorForm";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function AdminCounsellorsPage() {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const createCounsellorMutation = useCreateCounsellor();
    const updateUserStatusMutation = useUpdateUserStatus();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const handleCreateCounsellor = (data: any) => {
        createCounsellorMutation.mutate(data, {
            onSuccess: () => {
                setDialogOpen(false);
                reset();
            }
        });
    };

    const handleStatusChange = (userId: string, currentStatus: boolean) => {
        updateUserStatusMutation.mutate({ userId, userType: 'counsellor', isActive: !currentStatus });
    };

    const { data: counsellorsResponse, isLoading } = useAllCounsellors();
    const counsellors = counsellorsResponse?.data || [];

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Counsellors</h1>
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Appoint New Counsellor</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create New Counsellor Account</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit(handleCreateCounsellor)} className="space-y-4 py-4">
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
                                <Input id="password" type="password" {...register("password", { required: "Password is required", minLength: 8 })} />
                                {errors.password && <p className="text-sm text-destructive mt-1">Password must be at least 8 characters.</p>}
                            </div>
                            <div>
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input id="specialization" {...register("specialization", { required: "Specialization is required" })} />
                                {errors.specialization && <p className="text-sm text-destructive mt-1">{`${errors.specialization.message}`}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={createCounsellorMutation.isPending}>
                                {createCounsellorMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Appoint Counsellor
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
                        <TableHead>Specialization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Active</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
                    : counsellors?.map((c: any) => (
                        <TableRow key={c._id}>
                            <TableCell>{c.name}</TableCell>
                            <TableCell>{c.email}</TableCell>
                            <TableCell>{Array.isArray(c.specialization) ? c.specialization.join(', ') : c.specialization}</TableCell>
                            <TableCell>
                                <Badge variant={c.isActive ? 'default' : 'destructive'}>
                                    {c.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Switch
                                    checked={c.isActive}
                                    onCheckedChange={() => handleStatusChange(c._id, c.isActive)}
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