// // hooks/api/useRooms.ts
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api } from "@/lib/axios";
// import { toast } from "sonner";
// import { roomAPI } from "@/lib/api";

// export const useCreateRoom = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: (newRoom: { topic: string, description?: string }) => roomAPI.createRoom(newRoom),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['rooms'] });
//             toast.success("Room created successfully!");
//         },
//         onError: (err: any) => {
//             toast.error(err.response?.data?.message || "Failed to create room.");
//         }
//     });
// };

// // Fetch all peer support rooms
// export const useRooms = () => {
//     return useQuery({
//         queryKey: ['rooms'],
//         queryFn: roomAPI.getAllRooms,
//     });
// };

// // Fetch a single room by its topic
// export const useRoomByTopic = (topic: string) => {
//     return useQuery({
//         queryKey: ['room', topic],
//         queryFn: () => roomAPI.getRoomByTopic(topic),
//         enabled: !!topic,
//     });
// };

// // Fetch messages for a specific room topic
// export const useRoomMessages = (topic: string, params?: any) => {
//     return useQuery({
//         queryKey: ['roomMessages', topic, params],
//         queryFn: () => roomAPI.getRoomMessages(topic, params),
//         enabled: !!topic,
//     });
// };

// // Fetch statistics for a specific room
// export const useRoomStats = (topic: string) => {
//     return useQuery({
//         queryKey: ['roomStats', topic],
//         queryFn: () => roomAPI.getRoomStats(topic),
//         enabled: !!topic,
//     });
// };

// // Fetch recent activity for a specific room
// export const useRoomActivity = (topic: string) => {
//     return useQuery({
//         queryKey: ['roomActivity', topic],
//         queryFn: () => roomAPI.getRoomActivity(topic),
//         enabled: !!topic,
//     });
// };

// // Admin action to add a moderator
// export const useAddModerator = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: ({ topic, volunteerId }: { topic: string; volunteerId: string }) =>
//             roomAPI.addModerator(topic, volunteerId),
//         onSuccess: (_, { topic }) => {
//             queryClient.invalidateQueries({ queryKey: ['rooms'] });
//             queryClient.invalidateQueries({ queryKey: ['room', topic] });
//             toast.success("Moderator added successfully!");
//         },
//         onError: (err: any) => {
//             toast.error(err.response?.data?.message || "Failed to add moderator.");
//         }
//     });
// };

// // Admin action to remove a moderator
// export const useRemoveModerator = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: ({ topic, volunteerId }: { topic: string; volunteerId: string }) =>
//             roomAPI.removeModerator(topic, volunteerId),
//         onSuccess: (_, { topic }) => {
//             queryClient.invalidateQueries({ queryKey: ['rooms'] });
//             queryClient.invalidateQueries({ queryKey: ['room', topic] });
//             toast.success("Moderator removed successfully.");
//         },
//         onError: (err: any) => {
//             toast.error(err.response?.data?.message || "Failed to remove moderator.");
//         }
//     });
// };

// // Admin action to update a room's description
// export const useUpdateRoomDescription = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: ({ topic, description }: { topic: string; description: string }) =>
//             roomAPI.updateRoomDescription(topic, description),
//         onSuccess: (_, { topic }) => {
//             queryClient.invalidateQueries({ queryKey: ['rooms'] });
//             queryClient.invalidateQueries({ queryKey: ['room', topic] });
//             toast.success("Room description updated.");
//         },
//         onError: (err: any) => {
//             toast.error(err.response?.data?.message || "Failed to update description.");
//         }
//     });
// };















// FILE: web/hooks/api/useRooms.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { roomAPI } from "@/lib/api";

export const useCreateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newRoom: { topic: string, description?: string }) => roomAPI.createRoom(newRoom),
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
        queryFn: roomAPI.getAllRooms,
    });
};

// Fetch a single room by its topic
export const useRoomByTopic = (topic: string) => {
    return useQuery({
        queryKey: ['room', topic],
        queryFn: () => roomAPI.getRoomByTopic(topic),
        enabled: !!topic,
    });
};

// Fetch messages for a specific room topic
export const useRoomMessages = (topic: string, params?: any) => {
    return useQuery({
        queryKey: ['roomMessages', topic, params],
        queryFn: () => roomAPI.getRoomMessages(topic, params),
        enabled: !!topic,
    });
};

// Fetch statistics for a specific room
export const useRoomStats = (topic: string) => {
    return useQuery({
        queryKey: ['roomStats', topic],
        queryFn: () => roomAPI.getRoomStats(topic),
        enabled: !!topic,
    });
};

// Fetch recent activity for a specific room
export const useRoomActivity = (topic: string) => {
    return useQuery({
        queryKey: ['roomActivity', topic],
        queryFn: () => roomAPI.getRoomActivity(topic),
        enabled: !!topic,
    });
};

// Admin action to add a moderator
export const useAddModerator = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ topic, volunteerId }: { topic: string; volunteerId: string }) =>
            roomAPI.addModerator(topic, volunteerId),
        onSuccess: (_, { topic }) => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            queryClient.invalidateQueries({ queryKey: ['room', topic] });
            toast.success("Moderator added successfully!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to add moderator.");
        }
    });
};

// Admin action to remove a moderator
export const useRemoveModerator = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ topic, volunteerId }: { topic: string; volunteerId: string }) =>
            roomAPI.removeModerator(topic, volunteerId),
        onSuccess: (_, { topic }) => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            queryClient.invalidateQueries({ queryKey: ['room', topic] });
            toast.success("Moderator removed successfully.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to remove moderator.");
        }
    });
};

// Admin action to update a room's description
export const useUpdateRoomDescription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ topic, description }: { topic: string; description: string }) =>
            roomAPI.updateRoomDescription(topic, description),
        onSuccess: (_, { topic }) => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            queryClient.invalidateQueries({ queryKey: ['room', topic] });
            toast.success("Room description updated.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update description.");
        }
    });
};