// web/app/(dashboard)/student/reports/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useMyReports, useDeleteReport, useUpdateReport } from "@/hooks/api/useReports";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import dayjs from "dayjs";
import { Eye, PlusCircle, Trash2, Edit, Loader2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function StudentReportsPage() {
    const { data: reportsResponse, isLoading } = useMyReports();
    const deleteReportMutation = useDeleteReport();
    const updateReportMutation = useUpdateReport();

    const [isEditOpen, setEditOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<any>(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    
    // Pre-fill the edit form when a report is selected
    useEffect(() => {
        if (editingReport) {
            setValue("title", editingReport.title);
            setValue("content", editingReport.content);
        }
    }, [editingReport, setValue]);
    
    const handleUpdateReport = (data: any) => {
        if (!editingReport) return;
        updateReportMutation.mutate({ id: editingReport._id, data }, {
            onSuccess: () => {
                toast.success("Report updated successfully.");
                setEditOpen(false);
                setEditingReport(null);
            }
        });
    };

    const reports = reportsResponse?.data || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">My Reports</h1>
                <Link href="/student/create-report">
                    <Button><PlusCircle className="mr-2 h-4 w-4"/> New Report</Button>
                </Link>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={5} className="text-center h-24"><Spinner /></TableCell></TableRow>
                    ) : reports.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No reports found.</TableCell></TableRow>
                    ) : (
                        reports.map((report: any) => (
                            <TableRow key={report._id}>
                                <TableCell className="font-medium">{report.title}</TableCell>
                                <TableCell className="capitalize">{report.category}</TableCell>
                                <TableCell><Badge variant="outline">{report.status}</Badge></TableCell>
                                <TableCell>{dayjs(report.createdAt).format("MMM D, YYYY")}</TableCell>
                                <TableCell className="flex gap-2 justify-end">
                                    {report.status === 'pending' && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => {
                                                setEditingReport(report);
                                                setEditOpen(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4"/>
                                        </Button>
                                    )}
                                    {report.status === 'pending' && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete your report. This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteReportMutation.mutate(report._id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Edit Report Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Report</DialogTitle>
                        <DialogDescription>You can only edit reports that are still pending.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handleUpdateReport)} className="space-y-4 py-4">
                         <div>
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" {...register("title", { required: "Title is required" })} />
                             {errors.title && <p className="text-sm text-destructive mt-1">{`${errors.title.message}`}</p>}
                        </div>
                        <div>
                            <Label htmlFor="content">Content</Label>
                            <Textarea id="content" {...register("content", { required: "Content is required" })} rows={10} />
                             {errors.content && <p className="text-sm text-destructive mt-1">{`${errors.content.message}`}</p>}
                        </div>
                        <div className="flex justify-end gap-2">
                             <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
                             <Button type="submit" disabled={updateReportMutation.isPending}>
                                {updateReportMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}