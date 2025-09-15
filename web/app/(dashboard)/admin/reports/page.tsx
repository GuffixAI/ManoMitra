// web/app/(dashboard)/admin/reports/page.tsx
"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAllReports, useAssignReport, useAllCounsellors } from "@/hooks/api/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export default function AdminReportsPage() {
    const { data: reportsResponse, isLoading: isLoadingReports } = useAllReports();
    const { data: counsellorsResponse, isLoading: isLoadingCounsellors } = useAllCounsellors();
    const assignReportMutation = useAssignReport();

    const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

    const { control, handleSubmit, reset } = useForm();
    
    const reports = reportsResponse?.data || [];
    const counsellors = counsellorsResponse?.data || [];

    console.log(counsellors)

    const handleOpenAssignDialog = (reportId: string) => {
        setSelectedReportId(reportId);
        reset({ counsellorId: '' }); // Reset form
        setAssignDialogOpen(true);
    };

    const onAssignSubmit = (data: any) => {
        if (!selectedReportId || !data.counsellorId) return;
        assignReportMutation.mutate(
            { reportId: selectedReportId, counsellorId: data.counsellorId },
            {
                onSuccess: () => {
                    setAssignDialogOpen(false);
                    setSelectedReportId(null);
                }
            }
        );
    };

     const getPriorityVariant = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'destructive';
            case 'high': return 'default';
            case 'medium': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">All Reports</h1>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoadingReports ? <TableRow><TableCell colSpan={7} className="text-center h-24"><Spinner /></TableCell></TableRow>
                    : reports.map((report: any) => (
                        <TableRow key={report._id}>
                            <TableCell className="font-medium">{report.title}</TableCell>
                            <TableCell>{report.owner?.name || 'N/A'}</TableCell>
                            <TableCell>{report.assignedTo?.name || 'Unassigned'}</TableCell>
                            <TableCell><Badge variant={getPriorityVariant(report.priority)}>{report.priority}</Badge></TableCell>
                            <TableCell>{report.status}</TableCell>
                            <TableCell>{dayjs(report.createdAt).format("MMM D, YYYY")}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" onClick={() => handleOpenAssignDialog(report._id)}>
                                    {report.assignedTo ? 'Re-assign' : 'Assign'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Assign Report Dialog */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Report</DialogTitle>
                        <DialogDescription>Select a counsellor to handle this report.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onAssignSubmit)} className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="counsellor">Counsellor</Label>
                             <Controller
                                name="counsellorId"
                                control={control}
                                rules={{ required: "You must select a counsellor" }}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCounsellors}>
                                        <SelectTrigger id="counsellor">
                                            <SelectValue placeholder={isLoadingCounsellors ? "Loading..." : "Select a counsellor"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {counsellors.map((c: any) => (
                                                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={assignReportMutation.isPending}>
                                {assignReportMutation.isPending ? "Assigning..." : "Assign Report"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}