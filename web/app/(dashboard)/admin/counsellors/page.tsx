// app/(dashboard)/admin/counsellors/page.tsx
"use client";
// import { useQuery } from "@tanstack/react-query";
// import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAllCounsellors } from "@/hooks/api/useAdmin";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateCounsellorForm } from "@/components/forms/CreateCounsellorForm";
import { useCreateCounsellor } from "@/hooks/api/useAdmin";
import { useState } from "react";

export default function AdminCounsellorsPage() {
    // const { data: counsellors, isLoading } = useQuery({
    //     queryKey: ["allCounsellors"],
    //     queryFn: () => api.get("/admin/counsellors").then(res => res.data.data),
    // });




    const [isDialogOpen, setDialogOpen] = useState(false);
    const createCounsellorMutation = useCreateCounsellor();

    const handleCreateCounsellor = (data: any) => {
        createCounsellorMutation.mutate(data, {
            onSuccess: () => setDialogOpen(false)
        });
    };

    const { data: counsellors, isLoading } = useAllCounsellors();

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Counsellors</h1>
                {/* TODO: Add appoint counsellor functionality in a dialog */}

                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Appoint New Counsellor</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create New Counsellor</DialogTitle></DialogHeader>
                        <CreateCounsellorForm 
                            onSubmit={handleCreateCounsellor} 
                            isLoading={createCounsellorMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
                <Button>Appoint New Counsellor</Button>
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
                            <TableCell>{c.specialization}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}