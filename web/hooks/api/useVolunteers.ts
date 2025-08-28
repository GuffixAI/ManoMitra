// hooks/api/useVolunteers.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

// For the logged-in volunteer to get their own rating
export const useMyVolunteerRating = () => {
    return useQuery({
        queryKey: ['myVolunteerRating'],
        queryFn: () => api.get('/volunteers/rating').then(res => res.data),
    });
};

// For admins to list all volunteers
export const useAllVolunteers = () => {
    return useQuery({
        queryKey: ['allVolunteers'],
        queryFn: () => api.get('/admin/volunteers').then(res => res.data.data),
    });
};