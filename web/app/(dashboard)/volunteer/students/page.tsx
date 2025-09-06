"use client";

import { useState } from "react";
import Link from "next/link";
import { useVolunteerConnectedStudents } from "@/hooks/api/useVolunteers";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function VolunteerStudentsPage() {
  const [search, setSearch] = useState("");
  const { data: response, isLoading } = useVolunteerConnectedStudents({ search });

  const students = response?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Connected Students</h1>
      <Input
        placeholder="Search students by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Card>
        <CardContent className="pt-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          )}
          {!isLoading && students.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No students have connected with you yet.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student: any) => (
              <Card key={student._id} className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={student.profileImage} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="mt-4">
                  {/* This is the chat button you needed! */}
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/messages/${student._id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat with {student.name}
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}