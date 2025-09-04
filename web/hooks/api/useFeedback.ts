// web/hooks/api/useFeedback.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackAPI } from "@/lib/api";
import { toast } from "sonner";

// Get feedback submitted by the current user (student)
export const useMyFeedback = () => {
  return useQuery({
    queryKey: ["myFeedback"],
    queryFn: feedbackAPI.getMyFeedback,
  });
};

// Get feedback for a specific counsellor or volunteer
export const useFeedbackForTarget = (targetType: string, targetId: string) => {
  return useQuery({
    queryKey: ["feedback", targetType, targetId],
    queryFn: () => feedbackAPI.getFeedbackForTarget(targetType, targetId),
    enabled: !!targetType && !!targetId,
  });
};

// Submit new feedback
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { targetType: 'counsellor' | 'volunteer'; targetId: string; rating: number; comment?: string }) =>
      feedbackAPI.submitFeedback(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["myFeedback"] });
      queryClient.invalidateQueries({ queryKey: ["feedback", variables.targetType, variables.targetId] });
      toast.success("Thank you for your feedback!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit feedback.");
    },
  });
};