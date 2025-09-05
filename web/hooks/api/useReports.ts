// FILE: web/hooks/api/useReports.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportAPI } from "@/lib/api";
import { toast } from "sonner";

// For Students: Get their own reports
export const useMyReports = (params?: any) => {
  return useQuery({
    queryKey: ["myReports", params],
    queryFn: () => reportAPI.getMyReports(params),
  });
};

// For Students: Get a single report by ID
export const useReportById = (id: string) => {
    return useQuery({
        queryKey: ['report', id],
        queryFn: () => reportAPI.getReportById(id),
        enabled: !!id,
    });
};

// For Students: Create a new report
export const useCreateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newReport: any) => reportAPI.createReport(newReport),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myReports"] });
      toast.success("Report submitted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit report.");
    },
  });
};

// For Students: Update a report
export const useUpdateReport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => reportAPI.updateReport(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["myReports"] });
            queryClient.invalidateQueries({ queryKey: ['report', data.data._id] });
            toast.success("Report updated successfully!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update report.");
        }
    });
};

// For Students: Delete a report
export const useDeleteReport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => reportAPI.deleteReport(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myReports"] });
            toast.success("Report deleted successfully!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to delete report.");
        }
    });
};

// For Counsellors: Get assigned reports
export const useAssignedReports = (params?: any) => {
    return useQuery({
        queryKey: ['assignedReports', params],
        queryFn: () => reportAPI.getAssignedReports(params),
    });
};

// For Counsellors: Get details of a specific assigned report
export const useAssignedReportDetails = (id: string) => {
    return useQuery({
        queryKey: ['assignedReportDetails', id],
        queryFn: () => reportAPI.getReportDetails(id),
        enabled: !!id,
    });
};

// For Counsellors: Update the status of an assigned report
export const useUpdateReportStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, notes }: { id: string, status: string, notes?: string }) =>
            reportAPI.updateReportStatus(id, status, notes),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['assignedReports'] });
            queryClient.invalidateQueries({ queryKey: ['assignedReportDetails', id] });
            toast.success("Report status updated.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update report status.");
        }
    });
};

// For Counsellors & Admins: Get urgent reports
export const useUrgentReports = () => {
    return useQuery({
        queryKey: ['urgentReports'],
        queryFn: () => reportAPI.getUrgentReports(),
    });
};

// For Counsellors & Admins: Get reports by status
export const useReportsByStatus = (status: string) => {
    return useQuery({
        queryKey: ['reportsByStatus', status],
        queryFn: () => reportAPI.getReportsByStatus(status),
        enabled: !!status,
    });
};