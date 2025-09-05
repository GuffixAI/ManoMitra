// web/hooks/api/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { Admin, User } from "@/types/auth"; 



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

// Get the current admin's profile
export const useAdminProfile = () => {
  return useQuery<Admin>({ // Using the Admin type
    queryKey: ["adminProfile"],
    queryFn: () => adminAPI.getProfile(),
  });
};

// Update the current admin's profile
export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore.getState();

  return useMutation({
    mutationFn: (profileData: Partial<Admin>) => adminAPI.updateProfile(profileData),
    onSuccess: (response) => {
      const updatedAdmin = response.data;
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
      setUser({ ...user, ...updatedAdmin } as User); // Update user in Zustand
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
            // Invalidate all user lists as a precaution
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