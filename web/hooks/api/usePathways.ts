// web/hooks/api/usePathways.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pathwayAPI } from "@/lib/api";
import { toast } from "sonner";

// Hook to generate a new learning pathway
export const useGeneratePathway = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aiReportId: string) => pathwayAPI.generatePathway(aiReportId),
    onSuccess: () => {
      // Invalidate the list of pathways to refetch with the new one
      queryClient.invalidateQueries({ queryKey: ["myPathways"] });
      toast.success("Your personalized learning pathway has been generated!");
    },
    onError: (err: any) => {
      // Handle the case where a pathway already exists (409 Conflict)
      if (err.response?.status === 409) {
          toast.info(err.response?.data?.message || "Pathway already exists.");
      } else {
          toast.error(err.response?.data?.message || "Failed to generate learning pathway.");
      }
    },
  });
};

// Hook to fetch all pathways for the current student
export const useMyPathways = () => {
  return useQuery({
    queryKey: ["myPathways"],
    queryFn: () => pathwayAPI.getMyPathways(),
  });
};

// Hook to mark a pathway step as complete
export const useMarkStepComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pathwayId, resourceId }: { pathwayId: string; resourceId: string }) => 
      pathwayAPI.markStepComplete(pathwayId, resourceId),
    onSuccess: () => {
      // Invalidate the pathways list to update the UI with the completed step
      queryClient.invalidateQueries({ queryKey: ["myPathways"] });
      toast.success("Great job on completing a step!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update step status.");
    },
  });
};