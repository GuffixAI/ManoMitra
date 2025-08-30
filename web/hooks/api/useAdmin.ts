// web/hooks/api/useAdmin.ts
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";

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