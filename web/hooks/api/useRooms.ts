// hooks/api/useRooms.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";

export const useRooms = () => {
    return useQuery({
        queryKey: ['rooms'],
        queryFn: () => api.get('/rooms').then(res => res.data.data),
    });
};

export const useCreateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newRoom: { topic: string, description?: string }) => api.post('/rooms', newRoom),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            toast.success("Room created successfully!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to create room.");
        }
    });
};