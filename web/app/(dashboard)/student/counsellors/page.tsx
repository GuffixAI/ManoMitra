// web/app/(dashboard)/student/counsellors/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { UserPlus, CheckCircle, Star, XCircle } from "lucide-react";
import {
  useAvailableCounsellors,
  useConnectCounsellor,
  useStudentConnections,
  useDisconnectCounsellor,
} from "@/hooks/api/useStudents";
import Link from "next/link";

export default function StudentCounsellorsPage() {
  const { data: counsellorsResponse, isLoading: isLoadingCounsellors } =
    useAvailableCounsellors();
  const { data: connections, isLoading: isLoadingConnections } =
    useStudentConnections();
  const connectMutation = useConnectCounsellor();
  const disconnectMutation = useDisconnectCounsellor(); // Added disconnect mutation

  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (connections?.counsellors) {
      setConnectedIds(connections.counsellors.map((c: any) => c._id));
    }
  }, [connections]);

  const handleConnect = (counsellorId: string) => {
    connectMutation.mutate(counsellorId, {
      onSuccess: () => {
        setConnectedIds((prev) => [...prev, counsellorId]);
      },
    });
  };

  const handleDisconnect = (counsellorId: string) => {
    disconnectMutation.mutate(counsellorId, {
      onSuccess: () => {
        setConnectedIds((prev) => prev.filter((id) => id !== counsellorId));
      },
    });
  };

  const counsellors = counsellorsResponse?.data || [];
  const isLoading = isLoadingCounsellors || isLoadingConnections;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Find a Counsellor</h1>
      <p className="text-muted-foreground">
        Browse and connect with available counsellors.
      </p>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!isLoading &&
          counsellors.map((counsellor: any) => {
            const isConnected = connectedIds.includes(counsellor._id);
            const isConnectPending =
              connectMutation.isPending &&
              connectMutation.variables === counsellor._id;
            const isDisconnectPending =
              disconnectMutation.isPending &&
              disconnectMutation.variables === counsellor._id;

            return (
              <Card key={counsellor._id} className="flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={counsellor.profileImage} />
                      <AvatarFallback>
                        {counsellor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{counsellor.name}</CardTitle>
                      <CardDescription>
                        {Array.isArray(counsellor.specialization)
                          ? counsellor.specialization.join(", ")
                          : counsellor.specialization}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">
                      {counsellor.averageRating || "N/A"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">
                    {counsellor.description}
                  </p>
                  {/* Conditional Button Rendering */}
                  {isConnected ? (
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() => handleDisconnect(counsellor._id)}
                      disabled={isDisconnectPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Disconnect
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleConnect(counsellor._id)}
                      disabled={isConnectPending}
                    >
                      <UserPlus className="mr-2 h-4 w-4" /> Connect
                    </Button>
                  )}

                  {isConnected && (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/messages/${counsellor._id}/${
                          counsellor.role || "Counsellor"
                        }`}
                      >
                        Chat
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
