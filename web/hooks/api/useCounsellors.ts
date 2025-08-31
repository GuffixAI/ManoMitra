// web/hooks/api/useCounsellors.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { counsellorAPI } from "@/lib/api";
import { toast } from "sonner";

export const useCounsellorDashboard = () => {
  return useQuery({
    queryKey: ["counsellorDashboard"],
    // FIX: Removed redundant .then(), api function now returns the data directly
    queryFn: () => counsellorAPI.getDashboard(),
  });
};

export const useMyStudents = (params?: any) => {
  return useQuery({
      queryKey: ["myStudents", params],
      // FIX: Removed redundant .then()
      queryFn: () => counsellorAPI.getMyStudents(params)
  });
};

export const useCounsellorSchedule = () => {
  return useQuery({
      queryKey: ["counsellorSchedule"],
      // FIX: Removed redundant .then()
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