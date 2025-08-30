// FILE: web/hooks/api/useStudents.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentAPI } from "@/lib/api";
import { toast } from "sonner";

// Get the current student's profile
export const useStudentProfile = () => {
  return useQuery({
    queryKey: ["studentProfile"],
    queryFn: () => studentAPI.getProfile(),
  });
};

// Update the current student's profile
export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileData: any) => studentAPI.updateProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    },
  });
};