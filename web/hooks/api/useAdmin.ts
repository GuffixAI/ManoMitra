// web/hooks/api/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { toast } from "sonner";

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: () => adminAPI.getDashboardStats(),
  });
};

export const useAllStudents = (params?: any) => {
  return useQuery({
    queryKey: ["allStudents", params],
    queryFn: () => adminAPI.getAllStudents(params),
  });
};

export const useAllCounsellors = (params?: any) => {
  return useQuery({
    queryKey: ["allCounsellors", params],
    queryFn: () => adminAPI.getAllCounsellors(params),
  });
};

export const useAllVolunteers = (params?: any) => {
  return useQuery({
    queryKey: ["allVolunteers", params],
    queryFn: () => adminAPI.getAllVolunteers(params),
  });
};

export const useAllReports = (params?: any) => {
  return useQuery({
    queryKey: ["allReports", params],
    queryFn: () => adminAPI.getAllReports(params),
  });
};

export const useSystemAnalytics = (params?: any) => {
    return useQuery({
      queryKey: ["systemAnalytics", params],
      queryFn: () => adminAPI.getSystemAnalytics(params),
    });
  };

export const useUserById = (userId: string, userModel: string) => {
    return useQuery({
        queryKey: ["user", userId],
        queryFn: () => adminAPI.getUserById(userId, userModel),
        enabled: !!userId && !!userModel,
    });
};

export const useAssignReport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId, counsellorId }: { reportId: string, counsellorId: string }) =>
            adminAPI.assignReport(reportId, counsellorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allReports"] });
            queryClient.invalidateQueries({ queryKey: ["myAssignedReports"] });
            toast.success("Report assigned successfully.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to assign report.");
        }
    });
};

export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, userType, isActive }: { userId: string, userType: string, isActive: boolean }) =>
            adminAPI.updateUserStatus(userId, userType, isActive),
        onSuccess: (_, { userType }) => {
            queryClient.invalidateQueries({ queryKey: [`all${userType.charAt(0).toUpperCase() + userType.slice(1)}s`] });
            toast.success("User status updated.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update user status.");
        }
    });
};