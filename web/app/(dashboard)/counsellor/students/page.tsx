// web/app/(dashboard)/counsellor/students/page.tsx
"use client";
import {
  useMyStudents,
  useAddStudent,
  useRemoveStudent,
} from "@/hooks/api/useCounsellors";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function CounsellorStudentsPage() {
  const [search, setSearch] = useState("");
  const { data: students, isLoading } = useMyStudents({ search });
  const { register, handleSubmit } = useForm();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const addStudentMutation = useAddStudent();
  const removeStudentMutation = useRemoveStudent();

  const onAddStudent = (data: any) => {
    addStudentMutation.mutate(data.studentId, {
      onSuccess: () => {
        setDialogOpen(false);
      },
    });
  };

  const handleRemoveStudent = (studentId: string) => {
    removeStudentMutation.mutate(studentId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Students</h1>
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
                className="relative flex items-center space-x-4 p-4 border rounded-lg group"
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

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                  >
                    <Link href={`/messages/${student._id}/${student.role || "Student"}`}>
                      Chat with {student.name}
                    </Link>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveStudent(student._id)}
                  disabled={
                    removeStudentMutation.isPending &&
                    removeStudentMutation.variables === student._id
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Remove student</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
