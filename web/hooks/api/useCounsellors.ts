// web/hooks/api/useCounsellors.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { counsellorAPI } from "@/lib/api";
import { toast } from "sonner";

export const useCounsellorDashboard = () => {
  return useQuery({
    queryKey: ["counsellorDashboard"],
    queryFn: () => counsellorAPI.getDashboard(),
  });
};

export const useMyStudents = (params?: any) => {
  return useQuery({
      queryKey: ["myStudents", params],
      queryFn: () => counsellorAPI.getMyStudents(params)
  });
};

export const useCounsellorSchedule = () => {
  return useQuery({
      queryKey: ["counsellorSchedule"],
      queryFn: () => counsellorAPI.getSchedule()
  });
};

export const useMyAssignedReports = (params?: any) => {
  return useQuery({
      queryKey: ["myAssignedReports", params],
      queryFn: () => counsellorAPI.getMyReports(params)
  });
};

export const useCounsellorPerformance = () => {
  return useQuery({
      queryKey: ["counsellorPerformance"],
      queryFn: () => counsellorAPI.getPerformanceMetrics()
  });
};

// Get availability for a specific counsellor (public)
export const useCounsellorAvailability = (counsellorId: string) => {
    return useQuery({
        queryKey: ['counsellorAvailability', counsellorId],
        queryFn: () => counsellorAPI.getAvailabilityById(counsellorId),
        enabled: !!counsellorId,
    });
};

// Update counsellor profile
export const useUpdateCounsellorProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => counsellorAPI.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['counsellorProfile'] });
            toast.success("Profile updated successfully!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update profile.");
        }
    });
};

// Remove a student connection
export const useRemoveStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (studentId: string) => counsellorAPI.removeStudent(studentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myStudents'] });
            toast.success("Student removed.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to remove student.");
        }
    });
};

export const useUpdateAvailability = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (availability: any) => counsellorAPI.updateAvailability(availability),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["counsellorSchedule"] });
            toast.success("Availability updated successfully!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update availability.");
        }
    });
}