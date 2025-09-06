// FILE: web/app/(dashboard)/student/volunteers/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { UserPlus, CheckCircle, XCircle } from "lucide-react";
import { useAvailableVolunteers, useConnectVolunteer, useDisconnectVolunteer, useStudentConnections } from "@/hooks/api/useStudents";

export default function StudentVolunteersPage() {
  const { data: volunteersResponse, isLoading: isLoadingVolunteers } = useAvailableVolunteers();
  const { data: connections, isLoading: isLoadingConnections } = useStudentConnections();
  const connectMutation = useConnectVolunteer();
  const disconnectMutation = useDisconnectVolunteer();

  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (connections?.volunteers) {
      setConnectedIds(connections.volunteers.map((v: any) => v._id));
    }
  }, [connections]);

  const handleConnect = (volunteerId: string) => {
    connectMutation.mutate(volunteerId, {
      onSuccess: () => {
        setConnectedIds((prev) => [...prev, volunteerId]);
      }
    });
  };
  
  const handleDisconnect = (volunteerId: string) => {
    disconnectMutation.mutate(volunteerId, {
        onSuccess: () => {
            setConnectedIds((prev) => prev.filter(id => id !== volunteerId));
        }
    });
  };

  const volunteers = volunteersResponse?.data || [];
  const isLoading = isLoadingVolunteers || isLoadingConnections;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Find a Peer Volunteer</h1>
      <p className="text-muted-foreground">Connect with trained student volunteers for peer support.</p>
      
      {isLoading && <div className="flex justify-center py-8"><Spinner size="lg" /></div>}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!isLoading && volunteers.map((volunteer: any) => {
          const isConnected = connectedIds.includes(volunteer._id);
          const isConnectPending = connectMutation.isPending && connectMutation.variables === volunteer._id;
          const isDisconnectPending = disconnectMutation.isPending && disconnectMutation.variables === volunteer._id;

          return (
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
                    {volunteer.preferredTopics?.slice(0, 3).map((topic: string) => (
                        <Badge key={topic} variant="secondary" className="capitalize">{topic}</Badge>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 h-[40px]">{volunteer.description}</p>
                {isConnected ? (
                   <Button 
                        className="w-full"
                        variant="secondary"
                        onClick={() => handleDisconnect(volunteer._id)}
                        disabled={isDisconnectPending}
                    >
                        <XCircle className="mr-2 h-4 w-4" /> Disconnect
                    </Button>
                ) : (
                    <Button 
                        className="w-full" 
                        onClick={() => handleConnect(volunteer._id)}
                        disabled={isConnectPending}
                    >
                        <UserPlus className="mr-2 h-4 w-4" /> Connect
                    </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
}