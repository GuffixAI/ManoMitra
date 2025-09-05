// // web/hooks/api/useVolunteers.ts
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api } from "@/lib/axios";
// import { volunteerAPI } from "@/lib/api";
// import { toast } from "sonner";
// import { useAuthStore } from "@/store/auth.store";
// import { Volunteer } from "@/types/auth";




// // For the logged-in volunteer to get their own rating (Corrected endpoint)
// export const useMyVolunteerRating = () => {
//     return useQuery({
//         queryKey: ['myVolunteerRating'],
//         queryFn: () => volunteerAPI.getDashboard().then(res => ({ rating: res.data.rating, feedbackCount: res.data.feedbackCount })),
//     });
// };

// // For admins to list all volunteers
// export const useAllVolunteers = () => {
//     return useQuery({
//         queryKey: ['allVolunteers'],
//         queryFn: () => api.get('/admin/users/volunteers').then(res => res.data.data),
//     });
// };

// // Get Volunteer Dashboard
// export const useVolunteerDashboard = () => {
//     return useQuery({
//         queryKey: ["volunteerDashboard"],
//         queryFn: () => volunteerAPI.getDashboard().then(res => res.data),
//     });
// };

// // Get Volunteer Performance
// export const useVolunteerPerformance = () => {
//     return useQuery({
//         queryKey: ["volunteerPerformance"],
//         queryFn: () => volunteerAPI.getPerformanceMetrics()
//     });
// };

// // Get Moderated Rooms
// export const useModeratedRooms = () => {
//     return useQuery({
//         queryKey: ["moderatedRooms"],
//         queryFn: () => volunteerAPI.getModeratedRooms().then(res => res.data),
//     });
// };

// // Get Volunteer's message history
// export const useVolunteerMessageHistory = (params?: any) => {
//     return useQuery({
//         queryKey: ["volunteerMessageHistory", params],
//         queryFn: () => volunteerAPI.getMessageHistory(params),
//     });
// };

// // Get My Feedback
// export const useMyVolunteerFeedback = () => {
//     return useQuery({
//         queryKey: ["myVolunteerFeedback"],
//         queryFn: () => volunteerAPI.getMyFeedback().then(res => res.data),
//     });
// };

// // Get volunteer availability status
// export const useVolunteerAvailabilityStatus = () => {
//     return useQuery({
//         queryKey: ["volunteerAvailability"],
//         queryFn: () => volunteerAPI.getAvailabilityStatus(),
//     });
// };

// // Get Volunteer's own Profile
// export const useVolunteerProfile = () => {
//     return useQuery<Volunteer>({ // Using the Volunteer type
//         queryKey: ["volunteerProfile"],
//         queryFn: () => volunteerAPI.getProfile(),
//     });
// };

// // Update Volunteer Profile
// export const useUpdateVolunteerProfile = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: (profileData: any) => volunteerAPI.updateProfile(profileData),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ["volunteerProfile"] });
//             toast.success("Profile updated successfully!");
//         },
//         onError: (err: any) => {
//             toast.error(err.response?.data?.message || "Failed to update profile.");
//         }
//     });
// };

// // Update volunteer availability status
// export const useUpdateVolunteerAvailability = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: (status: { isActive?: boolean; maxConcurrentChats?: number }) => volunteerAPI.updateAvailabilityStatus(status),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ["volunteerAvailability"] });
//             toast.success("Availability updated.");
//         },
//         onError: (err: any) => {
//             toast.error(err.response?.data?.message || "Failed to update availability.");
//         }
//     });
// };

// // Mark training as complete
// export const useCompleteTraining = () => {
//     const queryClient = useQueryClient();
//     const setUser = useAuthStore(s => s.setUser);

//     return useMutation({
//         mutationFn: () => volunteerAPI.completeTraining(),
//         onSuccess: (response) => {
//             const updatedUser = response.data;
//             setUser(updatedUser); // Update user in Zustand store
//             queryClient.invalidateQueries({ queryKey: ["volunteerProfile"] });
//             toast.success("Training marked as complete!");
//         },
//         onError: (err: any) => {
//             toast.error(err.response?.data?.message || "Failed to update training status.");
//         }
//     });
// };

// export const useUpdateVolunteerActivity = () => {
//   return useMutation({
//     mutationFn: () => volunteerAPI.updateLastActive(),
//     onSuccess: () => {
//       // Silent background task
//       console.log("Volunteer activity updated.");
//     },
//     onError: (err: any) => {
//       console.error("Failed to update volunteer activity:", err.response?.data?.message);
//     },
//   });
// }




// FILE: web/hooks/api/useVolunteers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { volunteerAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { Volunteer } from "@/types/auth";




// For the logged-in volunteer to get their own rating (Corrected endpoint)
export const useMyVolunteerRating = () => {
    return useQuery({
        queryKey: ['myVolunteerRating'],
        queryFn: () => volunteerAPI.getDashboard().then(res => ({ rating: res.data.rating, feedbackCount: res.data.feedbackCount })),
    });
};

// For admins to list all volunteers
export const useAllVolunteers = () => {
    return useQuery({
        queryKey: ['allVolunteers'],
        queryFn: () => api.get('/admin/users/volunteers').then(res => res.data.data),
    });
};

// Get Volunteer Dashboard
export const useVolunteerDashboard = () => {
    return useQuery({
        queryKey: ["volunteerDashboard"],
        queryFn: () => volunteerAPI.getDashboard().then(res => res.data),
    });
};

// Get Volunteer Performance
export const useVolunteerPerformance = () => {
    return useQuery({
        queryKey: ["volunteerPerformance"],
        queryFn: () => volunteerAPI.getPerformanceMetrics()
    });
};

// Get Moderated Rooms
export const useModeratedRooms = () => {
    return useQuery({
        queryKey: ["moderatedRooms"],
        queryFn: () => volunteerAPI.getModeratedRooms().then(res => res.data),
    });
};

// Get Volunteer's message history
export const useVolunteerMessageHistory = (params?: any) => {
    return useQuery({
        queryKey: ["volunteerMessageHistory", params],
        queryFn: () => volunteerAPI.getMessageHistory(params),
    });
};

// Get My Feedback
export const useMyVolunteerFeedback = () => {
    return useQuery({
        queryKey: ["myVolunteerFeedback"],
        queryFn: () => volunteerAPI.getMyFeedback().then(res => res.data),
    });
};

// Get volunteer availability status
export const useVolunteerAvailabilityStatus = () => {
    return useQuery({
        queryKey: ["volunteerAvailability"],
        queryFn: () => volunteerAPI.getAvailabilityStatus(),
    });
};

// Get Volunteer's own Profile
export const useVolunteerProfile = () => {
    return useQuery<Volunteer>({ // Using the Volunteer type
        queryKey: ["volunteerProfile"],
        queryFn: () => volunteerAPI.getProfile(),
    });
};

// Update Volunteer Profile
export const useUpdateVolunteerProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (profileData: any) => volunteerAPI.updateProfile(profileData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["volunteerProfile"] });
            toast.success("Profile updated successfully!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update profile.");
        }
    });
};

// Update volunteer availability status
export const useUpdateVolunteerAvailability = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (status: { isActive?: boolean; maxConcurrentChats?: number }) => volunteerAPI.updateAvailabilityStatus(status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["volunteerAvailability"] });
            toast.success("Availability updated.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update availability.");
        }
    });
};

// Mark training as complete
export const useCompleteTraining = () => {
    const queryClient = useQueryClient();
    const setUser = useAuthStore(s => s.setUser);

    return useMutation({
        mutationFn: () => volunteerAPI.completeTraining(),
        onSuccess: (response) => {
            const updatedUser = response.data;
            setUser(updatedUser); // Update user in Zustand store
            queryClient.invalidateQueries({ queryKey: ["volunteerProfile"] });
            toast.success("Training marked as complete!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update training status.");
        }
    });
};

export const useUpdateVolunteerActivity = () => {
  return useMutation({
    mutationFn: () => volunteerAPI.updateLastActive(),
    onSuccess: () => {
      // Silent background task
      console.log("Volunteer activity updated.");
    },
    onError: (err: any) => {
      console.error("Failed to update volunteer activity:", err.response?.data?.message);
    },
  });
}