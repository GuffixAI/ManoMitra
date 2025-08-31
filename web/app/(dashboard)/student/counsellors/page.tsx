// web/app/(dashboard)/student/counsellors/page.tsx
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { UserPlus } from "lucide-react";
import { useAvailableCounsellors, useConnectCounsellor } from "@/hooks/api/useStudents";

export default function StudentCounsellorsPage() {
  const { data: counsellorsResponse, isLoading } = useAvailableCounsellors();
  const connectMutation = useConnectCounsellor();

  const handleConnect = (counsellorId: string) => {
    connectMutation.mutate(counsellorId);
  };

  // FIX: Access the nested data array for mapping
  const counsellors = counsellorsResponse?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Find a Counsellor</h1>
      <p className="text-muted-foreground">Browse and connect with available counsellors.</p>
      
      {isLoading && <div className="flex justify-center py-8"><Spinner size="lg" /></div>}
      
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
                {/* FIX: Join array for display */}
                <CardDescription>{Array.isArray(counsellor.specialization) ? counsellor.specialization.join(', ') : counsellor.specialization}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">{counsellor.description}</p>
              <Button 
                className="w-full" 
                onClick={() => handleConnect(counsellor._id)}
                disabled={connectMutation.isPending}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Connect
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}