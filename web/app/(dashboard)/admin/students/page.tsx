// web/app/(dashboard)/admin/students/page.tsx
"use client";
import { useAllStudents } from "@/hooks/api/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminStudentsPage() {
    const { data, isLoading } = useAllStudents();

    return (
        <div>
             {/* This page component can be used within the users tab */}
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Student Code</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
                    : data?.data.map((student: any) => (
                        <TableRow key={student._id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.studentCode}</TableCell>
                            <TableCell>
                                <Badge variant={student.isActive ? 'default' : 'destructive'}>
                                    {student.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}