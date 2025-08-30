// web/app/(dashboard)/counsellor/students/page.tsx
"use client";
import { useMyStudents } from "@/hooks/api/useCounsellors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function CounsellorStudentsPage() {
    const [search, setSearch] = useState("");
    const { data: students, isLoading } = useMyStudents({ search });
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Students</h1>
            <Input 
                placeholder="Search students by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <Card>
                <CardContent className="pt-6">
                    {isLoading && <div className="flex justify-center"><Spinner /></div>}
                    {!isLoading && students?.length === 0 && (
                        <p className="text-muted-foreground text-center py-8">No students found.</p>
                    )}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {students?.map((student: any) => (
                            <div key={student._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                                <Avatar>
                                    <AvatarImage src={student.profileImage} />
                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{student.name}</p>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                    <p className="text-xs text-muted-foreground">ID: {student.studentCode}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}