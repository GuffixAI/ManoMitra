// web/app/(dashboard)/counsellor/students/page.tsx
"use client";
import { useMyStudents } from "@/hooks/api/useCounsellors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { counsellorAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAddStudent } from "@/hooks/api/useCounsellors";

export default function CounsellorStudentsPage() {
  const [search, setSearch] = useState("");
  const { data: students, isLoading } = useMyStudents({ search });
  const { register, handleSubmit } = useForm();
  const [isDialogOpen, setDialogOpen] = useState(false);
  // const queryClient = useQueryClient();

  const addStudentMutation = useAddStudent();

  // const addStudentMutation = useMutation({
  //     mutationFn: ({ studentId }: { studentId: string }) => counsellorAPI.addStudent(studentId),
  //     onSuccess: () => {
  //         toast.success("Student added successfully!");
  //         queryClient.invalidateQueries({ queryKey: ["myStudents"] });
  //         setDialogOpen(false);
  //     },
  //     onError: (err: any) => {
  //         toast.error(err.response?.data?.message || "Failed to add student.");
  //     }
  // });

  // const onAddStudent = (data: any) => {
  //     addStudentMutation.mutate(data);
  // };

  const onAddStudent = (data: any) => {
    addStudentMutation.mutate(data.studentId, {
      // Pass only studentId directly
      onSuccess: () => {
        // Invalidation and toast are already handled by the hook
        setDialogOpen(false);
      },
      // Error handling is also handled by the hook, but can be customized here if needed
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Students</h1>
        {/* FIX: Added a dialog to connect with students */}
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect with a new Student</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(onAddStudent)}
              className="space-y-4 py-4"
            >
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  {...register("studentId", { required: true })}
                  placeholder="Enter the student's unique ID"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={addStudentMutation.isPending}
              >
                {addStudentMutation.isPending ? "Adding..." : "Add Student"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Input
        placeholder="Search students by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Card>
        <CardContent className="pt-6">
          {isLoading && (
            <div className="flex justify-center">
              <Spinner />
            </div>
          )}
          {!isLoading && (!students || students.length === 0) && (
            <p className="text-muted-foreground text-center py-8">
              No students found.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students?.map((student: any) => (
              <div
                key={student._id}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <Avatar>
                  <AvatarImage src={student.profileImage} />
                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {student.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {student.studentCode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
