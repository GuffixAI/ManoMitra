// web/app/(dashboard)/admin/reports/page.tsx
"use client";
import { useAllReports } from "@/hooks/api/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
    const { data: reports, isLoading } = useAllReports();

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
                    {isLoading ? <TableRow><TableCell colSpan={7}>Loading reports...</TableCell></TableRow>
                    : reports?.data.map((report: any) => (
                        <TableRow key={report._id}>
                            <TableCell className="font-medium">{report.title}</TableCell>
                            <TableCell>{report.owner?.name || 'N/A'}</TableCell>
                            <TableCell>{report.assignedTo?.name || 'Unassigned'}</TableCell>
                            <TableCell><Badge variant={getPriorityVariant(report.priority)}>{report.priority}</Badge></TableCell>
                            <TableCell>{report.status}</TableCell>
                            <TableCell>{dayjs(report.createdAt).format("MMM D, YYYY")}</TableCell>
                            <TableCell><Button variant="outline" size="sm">Assign / View</Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}