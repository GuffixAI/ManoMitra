// FILE: web/hooks/api/useStudents.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentAPI } from "@/lib/api";
import { toast } from "sonner";

// Get the current student's profile
export const useStudentProfile = () => {
  return useQuery({
    queryKey: ["studentProfile"],
    queryFn: () => studentAPI.getProfile().then(res => res.data),
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
        queryFn: () => studentAPI.getAvailableCounsellors(params),
    });
};

// Get available volunteers for students
export const useAvailableVolunteers = (params?: any) => {
    return useQuery({
        queryKey: ['availableVolunteers', params],
        queryFn: () => studentAPI.getAvailableVolunteers(params),
    });
};

// Get student's connections
export const useStudentConnections = () => {
    return useQuery({
        queryKey: ['studentConnections'],
        queryFn: () => studentAPI.getConnections(),
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

// Disconnect from a counsellor
export const useDisconnectCounsellor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (counsellorId: string) => studentAPI.disconnectCounsellor(counsellorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentConnections'] });
            toast.success("Successfully disconnected.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to disconnect.");
        }
    });
};

// Connect with a volunteer
export const useConnectVolunteer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (volunteerId: string) => studentAPI.connectVolunteer(volunteerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentConnections'] });
            toast.success("Successfully connected with volunteer!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to connect.");
        }
    });
};

// Disconnect from a volunteer
export const useDisconnectVolunteer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (volunteerId: string) => studentAPI.disconnectVolunteer(volunteerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentConnections'] });
            toast.success("Successfully disconnected from volunteer.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to disconnect.");
        }
    });
};

// Update student preferences
export const useUpdateStudentPreferences = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (preferences: any) => studentAPI.updatePreferences(preferences),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
            toast.success("Preferences updated.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update preferences.");
        }
    });
};


export const useUpdateStudentActivity = () => {
  return useMutation({
    mutationFn: () => studentAPI.updateLastActive(),
    onSuccess: () => {
      // This is often a silent background task, so no toast is necessary
      console.log("Student activity updated.");
    },
    onError: (err: any) => {
      // Also silent, as it's not a critical user-facing action
      console.error("Failed to update student activity:", err.response?.data?.message);
    },
  });
};

export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ["studentDashboard"],
    queryFn: () => studentAPI.getDashboard(),
  });
};