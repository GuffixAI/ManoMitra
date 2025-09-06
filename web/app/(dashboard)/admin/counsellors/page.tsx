// app/(dashboard)/admin/counsellors/page.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAllCounsellors } from "@/hooks/api/useAdmin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateCounsellorForm } from "@/components/forms/CreateCounsellorForm";
import { useCreateCounsellor } from "@/hooks/api/useAdmin";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCounsellorsPage() {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const createCounsellorMutation = useCreateCounsellor();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const handleCreateCounsellor = (data: any) => {
        createCounsellorMutation.mutate(data, {
            onSuccess: () => {
                setDialogOpen(false);
                reset(); // Reset form fields
            },
            onError: (error: any) => {
                // Error is already handled by the hook's toast
            }
        });
    };

    const { data: counsellorsResponse, isLoading } = useAllCounsellors();
    const counsellors = counsellorsResponse || [];

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
                        {/* Re-integrated the form directly for simplicity */}
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
                {/* FIX: Removed the duplicate button that was here */}
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Specialization</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
                    : counsellors?.map((c: any) => (
                        <TableRow key={c._id}>
                            <TableCell>{c.name}</TableCell>
                            <TableCell>{c.email}</TableCell>
                            <TableCell>{Array.isArray(c.specialization) ? c.specialization.join(', ') : c.specialization}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}