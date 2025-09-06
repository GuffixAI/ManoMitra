"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { UserPlus, CheckCircle } from "lucide-react"; // FIX: Imported CheckCircle
import { useAvailableCounsellors, useConnectCounsellor } from "@/hooks/api/useStudents";

export default function StudentCounsellorsPage() {
  const { data: counsellorsResponse, isLoading } = useAvailableCounsellors();
  const connectMutation = useConnectCounsellor();

  // FIX: Track connected counsellors locally for optimistic UI update
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  const handleConnect = (counsellorId: string) => {
    connectMutation.mutate(counsellorId, {
      onSuccess: () => {
        // Optimistically mark as connected
        setConnectedIds((prev) => [...prev, counsellorId]);
      }
    });
  };

  // Access nested data array
  const counsellors = counsellorsResponse?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Find a Counsellor</h1>
      <p className="text-muted-foreground">Browse and connect with available counsellors.</p>
      
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {counsellors.map((counsellor: any) => (
          <Card key={counsellor._id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={counsellor.profileImage} />
                <AvatarFallback>{counsellor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{counsellor.name}</CardTitle>
                <CardDescription>
                  {Array.isArray(counsellor.specialization)
                    ? counsellor.specialization.join(", ")
                    : counsellor.specialization}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">
                {counsellor.description}
              </p>
              {/* FIX: Improved button state and feedback */}
              <Button
                className="w-full cursor-pointer"
                onClick={() => handleConnect(counsellor._id)}
                disabled={
                  connectMutation.isPending && connectMutation.variables === counsellor._id || 
                  connectedIds.includes(counsellor._id)
                }
              >
                {connectedIds.includes(counsellor._id) ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}