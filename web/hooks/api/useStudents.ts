
// FILE: web/hooks/api/useStudents.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentAPI } from "@/lib/api";
import { toast } from "sonner";

// Get the current student's profile
export const useStudentProfile = () => {
  return useQuery({
    queryKey: ["studentProfile"],
    queryFn: () => studentAPI.getProfile().then(res => res.data), // FIX: Unwrap data
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

// Get available counsellors for students
export const useAvailableCounsellors = (params?: any) => {
    return useQuery({
        queryKey: ['availableCounsellors', params],
        // FIX: Return the full response so pagination can be used later
        queryFn: () => studentAPI.getAvailableCounsellors(params),
    });
};

// Get available volunteers for students
export const useAvailableVolunteers = (params?: any) => {
    return useQuery({
        queryKey: ['availableVolunteers', params],
        // FIX: Return the full response
        queryFn: () => studentAPI.getAvailableVolunteers(params),
    });
};

// Connect with a counsellor
export const useConnectCounsellor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (counsellorId: string) => studentAPI.connectCounsellor(counsellorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentConnections'] });
            toast.success("Successfully connected with counsellor!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to connect.");
        }
    });
};