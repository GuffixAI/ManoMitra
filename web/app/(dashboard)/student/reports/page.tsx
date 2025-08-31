// FILE: web/app/(dashboard)/student/reports/page.tsx

"use client";
import { useMyReports, useDeleteReport } from "@/hooks/api/useReports";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import dayjs from "dayjs";
import { Eye, PlusCircle, Trash2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { reportAPI } from "@/lib/api";

export default function StudentReportsPage() {
    const { data: reportsResponse, isLoading } = useMyReports();
    const deleteReportMutation = useDeleteReport();
    const [previewContent, setPreviewContent] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");

    const handleView = async (reportId: string) => {
        try {
            const report = await reportAPI.getReportById(reportId);
            setPreviewContent(report.content);
            setPreviewTitle(report.title);
        } catch (error) {
            setPreviewContent("Failed to load content.");
            setPreviewTitle("Error");
        }
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
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={6} className="text-center h-24"><Spinner /></TableCell></TableRow>
                    ) : reports.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No reports found.</TableCell></TableRow>
                    ) : (
                        reports.map((report: any) => (
                            <TableRow key={report._id}>
                                <TableCell className="font-medium">{report.title}</TableCell>
                                <TableCell className="capitalize">{report.category}</TableCell>
                                <TableCell><Badge variant={report.priority === 'urgent' || report.priority === 'high' ? 'destructive' : 'secondary'}>{report.priority}</Badge></TableCell>
                                <TableCell><Badge variant="outline">{report.status}</Badge></TableCell>
                                <TableCell>{dayjs(report.createdAt).format("MMM D, YYYY")}</TableCell>
                                <TableCell className="flex gap-2 justify-end">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" onClick={() => handleView(report._id)}>
                                                <Eye className="h-4 w-4"/>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader><DialogTitle>{previewTitle}</DialogTitle></DialogHeader>
                                            <div className="prose dark:prose-invert max-h-[60vh] overflow-y-auto border p-4 rounded-md">
                                                <ReactMarkdown>{previewContent}</ReactMarkdown>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
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
        </div>
    );
}