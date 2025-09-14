// FILE: web/hooks/api/useAdmin.ts
import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { Admin, User } from "@/types/auth";
import { AnalyticsSnapshot, TriggerAnalyticsResponse, FetchAnalyticsVersionsResponse } from '@/types/analytics';

// ... (keep all hooks from useAdminDashboardStats to useAllVolunteers the same)
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

export const useAdminProfile = () => {
  return useQuery<Admin>({
    queryKey: ["adminProfile"],
    queryFn: () => adminAPI.getProfile(),
  });
};

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore.getState();

  return useMutation({
    mutationFn: (profileData: Partial<Admin>) => adminAPI.updateProfile(profileData),
    onSuccess: (response) => {
      const updatedAdmin = response.data;
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
      setUser({ ...user, ...updatedAdmin } as User);
      toast.success("Profile updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    },
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


export const useEmergencyAccess = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, userType, action }: { userId: string, userType: string, action: 'suspend' | 'activate' }) =>
            adminAPI.emergencyAccess(userId, userType, action),
        onSuccess: (_, { userType, action }) => {
            queryClient.invalidateQueries({ queryKey: ['allStudents'] });
            queryClient.invalidateQueries({ queryKey: ['allCounsellors'] });
            queryClient.invalidateQueries({ queryKey: ['allVolunteers'] });
            toast.success(`User successfully ${action}ed.`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Emergency action failed.");
        }
    });
};


export const useCreateCounsellor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminAPI.createCounsellor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCounsellors"] });
      toast.success("Counsellor created successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create counsellor.");
    }
  });
};

export const useAllVolunteers = (params?: any) => {
  return useQuery({
    queryKey: ["allVolunteers", params],
    queryFn: () => adminAPI.getAllVolunteers(params), 
  });
};

// --- FIXES FOR ANALYTICS HOOKS ---
export const useTriggerAdvancedAnalytics = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { period_start?: string; period_end?: string; filters?: any }): Promise<TriggerAnalyticsResponse> =>
      adminAPI.triggerAdvancedAnalytics(data.period_start, data.period_end, data.filters),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["latestAdvancedAnalytics"] });
      queryClient.invalidateQueries({ queryKey: ["allAnalyticsVersions"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to trigger analytics generation.");
    },
  });
};

export const useLatestAdvancedAnalytics = (): UseQueryResult<AnalyticsSnapshot, Error> => {
  return useQuery({
    queryKey: ["latestAdvancedAnalytics"],
    queryFn: () => adminAPI.getLatestAdvancedAnalytics().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdvancedAnalyticsById = (snapshotId: string): UseQueryResult<AnalyticsSnapshot, Error> => {
  return useQuery({
    queryKey: ["advancedAnalytics", snapshotId],
    queryFn: () => adminAPI.getAdvancedAnalyticsById(snapshotId).then(res => res.data),
    enabled: !!snapshotId,
  });
};

export const useAllAnalyticsVersions = (): UseQueryResult<FetchAnalyticsVersionsResponse['data'], Error> => {
  return useQuery({
    queryKey: ["allAnalyticsVersions"],
    queryFn: () => adminAPI.getAllAnalyticsVersions().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
};