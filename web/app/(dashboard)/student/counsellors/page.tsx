// web/app/(dashboard)/student/counsellors/page.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { studentAPI } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function StudentCounsellorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["availableCounsellors"],
    queryFn: () => studentAPI.getAvailableCounsellors(),
  });

  const handleConnect = (counsellorId: string) => {
    // In a real app, you would use a mutation hook here
    studentAPI.connectCounsellor(counsellorId)
      .then(() => toast.success("Connection request sent!"))
      .catch((err) => toast.error(err.response?.data?.message || "Failed to connect."));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Find a Counsellor</h1>
      <p className="text-muted-foreground">Browse and connect with available counsellors.</p>
      
      {isLoading && <div className="flex justify-center py-8"><Spinner size="lg" /></div>}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.data.map((counsellor: any) => (
          <Card key={counsellor._id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={counsellor.profileImage} />
                <AvatarFallback>{counsellor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{counsellor.name}</CardTitle>
                <CardDescription>{counsellor.specialization}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">{counsellor.description}</p>
              <Button className="w-full" onClick={() => handleConnect(counsellor._id)}>
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