// web/app/(dashboard)/admin/interventions/page.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useGetInterventions, useCreateIntervention, useUpdateIntervention, useDeleteIntervention } from "@/hooks/api/useInterventions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2, Edit, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { Spinner } from "@/components/ui/spinner";

export default function AdminInterventionsPage() {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const { data: interventions, isLoading } = useGetInterventions();
    const createMutation = useCreateIntervention();
    const updateMutation = useUpdateIntervention();
    const deleteMutation = useDeleteIntervention();
    const { register, handleSubmit, reset, setValue } = useForm();

    const openDialog = (intervention = null) => {
        setEditing(intervention);
        if (intervention) {
            setValue("name", intervention.name);
            setValue("description", intervention.description);
            setValue("startDate", dayjs(intervention.startDate).format("YYYY-MM-DD"));
            setValue("endDate", dayjs(intervention.endDate).format("YYYY-MM-DD"));
            setValue("targetAudience", intervention.targetAudience);
        } else {
            reset();
        }
        setDialogOpen(true);
    };

    const onSubmit = (data: any) => {
        const mutation = editing ? updateMutation : createMutation;
        const payload = editing ? { id: editing._id, data } : data;
        
        mutation.mutate(payload, {
            onSuccess: () => {
                setDialogOpen(false);
                setEditing(null);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Interventions</h1>
                <Button onClick={() => openDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Log New Intervention</Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Date Range</TableHead>
                                <TableHead>Target Audience</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center h-24"><Spinner/></TableCell></TableRow> :
                            interventions?.map((item: any) => (
                                <TableRow key={item._id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{dayjs(item.startDate).format("MMM D, YYYY")} - {dayjs(item.endDate).format("MMM D, YYYY")}</TableCell>
                                    <TableCell>{item.targetAudience}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openDialog(item)}><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item._id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editing ? "Edit" : "Log New"} Intervention</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <Input {...register("name", { required: true })} placeholder="Intervention Name" />
                        <Textarea {...register("description")} placeholder="Description"/>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Start Date</Label><Input type="date" {...register("startDate", { required: true })}/></div>
                            <div><Label>End Date</Label><Input type="date" {...register("endDate", { required: true })}/></div>
                        </div>
                        <Input {...register("targetAudience")} placeholder="Target Audience (e.g., All Students)"/>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                <Loader2 className={`mr-2 h-4 w-4 animate-spin ${!(createMutation.isPending || updateMutation.isPending) && 'hidden'}`}/> Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}