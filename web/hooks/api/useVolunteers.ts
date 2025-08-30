// web/hooks/api/useVolunteers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { volunteerAPI } from "@/lib/api";
import { toast } from "sonner";


// For the logged-in volunteer to get their own rating (Corrected endpoint)
export const useMyVolunteerRating = () => {
    return useQuery({
        queryKey: ['myVolunteerRating'],
        queryFn: () => volunteerAPI.getDashboard().then(data => ({ rating: data.rating, feedbackCount: data.feedbackCount })),
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
        queryFn: () => volunteerAPI.getDashboard(),
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
        queryFn: () => volunteerAPI.getModeratedRooms()
    });
};

// Get My Feedback
export const useMyVolunteerFeedback = () => {
    return useQuery({
        queryKey: ["myVolunteerFeedback"],
        queryFn: () => volunteerAPI.getMyFeedback()
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
}