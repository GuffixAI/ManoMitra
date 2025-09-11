// web/hooks/api/useInterventions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { interventionAPI } from "@/lib/api"; // Will add in next step
import { toast } from "sonner";

export const useGetInterventions = () => {
  return useQuery({
    queryKey: ["interventions"],
    queryFn: () => interventionAPI.getAll(),
  });
};

export const useCreateIntervention = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => interventionAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interventions"] });
      toast.success("Intervention logged successfully.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to log intervention.");
    },
  });
};

export const useUpdateIntervention = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => interventionAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interventions"] });
      toast.success("Intervention updated.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update intervention.");
    },
  });
};

export const useDeleteIntervention = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => interventionAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interventions"] });
      toast.success("Intervention deleted.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete intervention.");
    },
  });
};