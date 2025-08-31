// web/hooks/api/useCounsellors.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { counsellorAPI } from "@/lib/api";
import { toast } from "sonner";

export const useCounsellorDashboard = () => {
    return useQuery({
      queryKey: ["counsellorDashboard"],
      queryFn: () => counsellorAPI.getDashboard().then(res => res.data), // FIX: Unwrap data
    });
};

export const useMyStudents = (params?: any) => {
    return useQuery({
        queryKey: ["myStudents", params],
        queryFn: () => counsellorAPI.getMyStudents(params).then(res => res.data) // FIX: Unwrap data
    });
};

export const useCounsellorSchedule = () => {
    return useQuery({
        queryKey: ["counsellorSchedule"],
        queryFn: () => counsellorAPI.getSchedule().then(res => res.data) // FIX: Unwrap data
    });
};

export const useMyAssignedReports = (params?: any) => {
    return useQuery({
        queryKey: ["myAssignedReports", params],
        queryFn: () => counsellorAPI.getMyReports(params) // This one already returns the correct structure
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