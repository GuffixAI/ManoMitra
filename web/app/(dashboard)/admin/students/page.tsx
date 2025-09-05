// web/app/(dashboard)/admin/students/page.tsx
"use client";
import { useAllStudents, useUpdateUserStatus } from "@/hooks/api/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function AdminStudentsPage() {
    const { data: studentsResponse, isLoading } = useAllStudents();
    const updateUserStatusMutation = useUpdateUserStatus();

    const handleStatusChange = (userId: string, currentStatus: boolean) => {
        updateUserStatusMutation.mutate(
            { userId, userType: 'student', isActive: !currentStatus },
            {
                onError: () => {
                    // Revert UI on error (though react-query handles this with invalidateQueries)
                    toast.error("Failed to update status. Please try again.");
                }
            }
        );
    };
    
    // Correctly access the nested data array from the API response
    const students = studentsResponse?.data || [];

    return (
        <div>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Student Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Active</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={5} className="h-24 text-center"><Spinner /></TableCell></TableRow>
                    ) : students.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="h-24 text-center">No students found.</TableCell></TableRow>
                    ) : students.map((student: any) => (
                        <TableRow key={student._id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.studentCode}</TableCell>
                            <TableCell>
                                <Badge variant={student.isActive ? 'default' : 'destructive'}>
                                    {student.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                     <Label htmlFor={`status-switch-${student._id}`} className="sr-only">
                                        Activate or deactivate user
                                     </Label>
                                     <Switch
                                        id={`status-switch-${student._id}`}
                                        checked={student.isActive}
                                        onCheckedChange={() => handleStatusChange(student._id, student.isActive)}
                                        disabled={updateUserStatusMutation.isPending}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}