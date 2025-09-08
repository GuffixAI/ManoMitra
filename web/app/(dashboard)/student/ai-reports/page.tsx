// FILE: web/app/(dashboard)/student/ai-reports/page.tsx
"use client";

import Link from "next/link";
import { useGetMyAIReports } from "@/hooks/api/useAIReports"; // You will create this hook
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BrainCircuit, Eye } from "lucide-react";
import dayjs from "dayjs";

export default function MyAIReportsPage() {
  const { data: reports, isLoading } = useGetMyAIReports();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My AI-Generated Reports</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Summary</TableHead>
                <TableHead>Generated On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    <Spinner />
                  </TableCell>
                </TableRow>
              ) : !reports || reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                    You haven't generated any AI reports yet.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report: any) => (
                  <TableRow key={report._id}>
                    <TableCell className="font-medium flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-primary" />
                        AI Wellness Summary
                    </TableCell>
                    <TableCell>{dayjs(report.createdAt).format("MMM D, YYYY h:mm A")}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/student/ai-reports/${report._id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View Report
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}