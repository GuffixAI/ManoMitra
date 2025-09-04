// hooks/api/useRooms.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { roomAPI } from "@/lib/api"; // Corrected import

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





// Fetch all peer support rooms
export const useRooms = () => {
    return useQuery({
        queryKey: ['rooms'],
        queryFn: roomAPI.getAllRooms, // Use the new API function
    });
};

// Fetch messages for a specific room topic
export const useRoomMessages = (topic: string) => {
    return useQuery({
        queryKey: ['roomMessages', topic],
        queryFn: () => roomAPI.getRoomMessages(topic),
        enabled: !!topic,
    });
};

// Admin action to add a moderator
export const useAddModerator = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ topic, volunteerId }: { topic: string; volunteerId: string }) =>
            roomAPI.addModerator(topic, volunteerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            toast.success("Moderator added successfully!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to add moderator.");
        }
    });
};