// web/app/(dashboard)/student/volunteers/page.tsx
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { useAvailableVolunteers } from "@/hooks/api/useStudents";

export default function StudentVolunteersPage() {
  const { data, isLoading } = useAvailableVolunteers();

  // Placeholder for connect functionality
  const handleConnect = (volunteerId: string) => {
    // This would be implemented with a mutation, similar to connecting with a counsellor
    console.log("Connect with volunteer:", volunteerId);
  };


  console.log(data)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Find a Peer Volunteer</h1>
      <p className="text-muted-foreground">Connect with trained student volunteers for peer support.</p>
      
      {isLoading && <div className="flex justify-center py-8"><Spinner size="lg" /></div>}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* **BUG FIX:** Changed to data?.data.map to align with standardized API response */}
        {data?.data.map((volunteer: any) => (
          <Card key={volunteer._id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={volunteer.profileImage} />
                <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{volunteer.name}</CardTitle>
                <CardDescription>Peer Volunteer</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-x-2">
                  {volunteer.preferredTopics.slice(0, 3).map((topic: string) => (
                      <Badge key={topic} variant="secondary">{topic}</Badge>
                  ))}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 h-[40px]">{volunteer.description}</p>
              <Button className="w-full" variant="outline" onClick={() => handleConnect(volunteer._id)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}