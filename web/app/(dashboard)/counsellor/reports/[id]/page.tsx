// web/app/(dashboard)/counsellor/reports/[id]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { useAssignedReportDetails, useUpdateReportStatus } from "@/hooks/api/useReports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";

export default function ReportDetailsPage() {
    const params = useParams();
    const reportId = params.id as string;
    const { data: report, isLoading } = useAssignedReportDetails(reportId);
    const updateStatusMutation = useUpdateReportStatus();
    const { control, handleSubmit, register } = useForm();

    const onSubmit = (data: any) => {
        updateStatusMutation.mutate(
            { id: reportId, status: data.status, notes: data.resolutionNotes },
            {
                onSuccess: () => toast.success("Report status updated!")
            }
        );
    };

    if (isLoading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;
    if (!report) return <div>Report not found.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{report.title}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Report Details</CardTitle>
                    <CardDescription>Submitted by: {report.isAnonymous ? "Anonymous" : report.owner.name}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{report.content}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label>Status</label>
                            <Controller
                                name="status"
                                control={control}
                                defaultValue={report.status}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div>
                            <label>Resolution Notes</label>
                            <Textarea {...register("resolutionNotes")} placeholder="Add notes for the student..."/>
                        </div>
                        <Button type="submit" disabled={updateStatusMutation.isPending}>
                            {updateStatusMutation.isPending ? "Updating..." : "Update Report"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}