// FILE: web/app/(dashboard)/student/reports/page.tsx

"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ReactMarkdown from 'react-markdown';
import { Eye, PlusCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function StudentReportsPage() {
    const queryClient = useQueryClient();
    const [previewContent, setPreviewContent] = useState<string>("");
    const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

    // Form state for new report
    const [newReportTitle, setNewReportTitle] = useState("");
    const [newReportContent, setNewReportContent] = useState("");

    // Fetch reports list (no content)
    const { data: reports, isLoading } = useQuery({
        queryKey: ["myReports"],
        queryFn: () => api.get("/reports").then(res => res.data.data)
    });

    // Create report mutation
    const createMutation = useMutation({
        mutationFn: (newReport: { title: string, content: string }) => api.post("/reports", newReport),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myReports"] });
            toast.success("Report saved successfully!");
            setUploadDialogOpen(false); // Close dialog
            setNewReportTitle("");
            setNewReportContent("");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Save failed.")
    });

    const handleSaveReport = () => {
        if (!newReportTitle.trim() || !newReportContent.trim()) {
            toast.error("Title and content cannot be empty.");
            return;
        }
        createMutation.mutate({ title: newReportTitle, content: newReportContent });
    };

    // View report content
    const handleView = async (reportId: string) => {
        try {
            const res = await api.get(`/reports/${reportId}`);
            setPreviewContent(res.data.data.content); // Get content from the response
        } catch (error) {
            toast.error("Could not fetch report content.");
            setPreviewContent("Failed to load content.");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">My Journal Reports</h1>
                <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4"/> New Report</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create a New Report</DialogTitle>
                          <DialogDescription>Write your thoughts in Markdown. They are saved securely.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <Label htmlFor="report-title">Title</Label>
                                <Input 
                                    id="report-title"
                                    value={newReportTitle} 
                                    onChange={(e) => setNewReportTitle(e.target.value)}
                                    placeholder="e.g., Weekly Reflection"
                                />
                            </div>
                            <div>
                                <Label htmlFor="report-content">Content (Markdown supported)</Label>
                                <Textarea 
                                    id="report-content"
                                    value={newReportContent}
                                    onChange={(e) => setNewReportContent(e.target.value)}
                                    rows={10}
                                    placeholder="Write anything..."
                                />
                            </div>
                            <Button onClick={handleSaveReport} disabled={createMutation.isPending} className="w-full">
                                {createMutation.isPending ? "Saving..." : "Save Report"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
                    : reports?.map((report: any) => (
                        <TableRow key={report._id}>
                            <TableCell>{report.title}</TableCell>
                            <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="flex gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={() => handleView(report._id)}>
                                            <Eye className="h-4 w-4"/>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl">
                                        <DialogHeader><DialogTitle>{report.title}</DialogTitle></DialogHeader>
                                        <div className="prose dark:prose-invert max-h-[70vh] overflow-y-auto border p-4 rounded-md">
                                            <ReactMarkdown>{previewContent}</ReactMarkdown>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                {/* Implement Delete functionality here */}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}