"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { volunteerAPI } from "@/lib/api";
import { toast } from "sonner";
import { useCompleteTraining } from "@/hooks/api/useVolunteers";



export default function VolunteerTrainingPage() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const trainingCompleted = (user as any)?.trainingCompleted || false;

  const completeTrainingMutation = useCompleteTraining();
  // ADDED: Mutation to mark training as complete
  // const completeTrainingMutation = useMutation({
  //   mutationFn: () => volunteerAPI.completeTraining(),
  //   onSuccess: (data) => {
  //     // Update the user state in Zustand store
  //     setUser(data.data);
  //     queryClient.invalidateQueries({ queryKey: ["volunteerProfile"] });
  //     toast.success("Training marked as complete! You can now moderate rooms.");
  //   },
  //   onError: (err: any) => {
  //     toast.error(
  //       err.response?.data?.message || "Failed to update training status."
  //     );
  //   },
  // });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Volunteer Training</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Volunteer Training!</CardTitle>
          <CardDescription>
            Complete the modules below to start helping students.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Module 1: Active Listening</h3>
                <p className="text-sm text-muted-foreground">
                  Learn the fundamentals of empathetic communication.
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              View Content
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Module 2: Platform Guidelines</h3>
                <p className="text-sm text-muted-foreground">
                  Understand the rules and best practices.
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              View Content
            </Button>
          </div>

          <div className="pt-4 border-t">
            {trainingCompleted ? (
              <div className="text-center text-green-600 flex items-center justify-center gap-2 font-medium">
                <CheckCircle />
                <p>You have completed all training modules!</p>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => completeTrainingMutation.mutate()}
                disabled={trainingCompleted || completeTrainingMutation.isPending}
              >
                {completeTrainingMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Mark Training as Complete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
