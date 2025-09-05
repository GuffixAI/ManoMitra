// web/app/(dashboard)/counsellor/reports/page.tsx
"use client";
import { useMyAssignedReports } from "@/hooks/api/useCounsellors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import Link from "next/link";

export default function CounsellorReportsPage() {
  const { data: reports, isLoading } = useMyAssignedReports();

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Assigned Reports</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading reports...
              </TableCell>
            </TableRow>
          ) : (
            reports?.data.map((report: any) => (
              <TableRow key={report._id}>
                <TableCell className="font-medium">{report.title}</TableCell>
                <TableCell>
                  {report.isAnonymous ? "Anonymous" : report.owner.name}
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(report.priority)}>
                    {report.priority}
                  </Badge>
                </TableCell>
                <TableCell>{report.status}</TableCell>
                <TableCell>
                  {dayjs(report.createdAt).format("MMM D, YYYY")}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/counsellor/reports/${report._id}`}>
                      View Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
