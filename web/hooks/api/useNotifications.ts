// web/hooks/api/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationAPI } from "@/lib/api";
import { toast } from "sonner";

// Get all notifications for the current user
export const useUserNotifications = (params?: any) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationAPI.getUserNotifications(params),
  });
};

// Get the count of unread notifications
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["unreadNotificationsCount"],
    queryFn: () => notificationAPI.getUnreadCount(),
    refetchInterval: 60000, // Refetch every 60 seconds
  });
};

// Mark a single notification as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to mark as read.");
    },
  });
};

// Mark all notifications as read
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount"] });
      toast.success("All notifications marked as read.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to mark all as read.");
    },
  });
};

// Archive a notification
export const useArchiveNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationAPI.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification archived.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to archive notification.");
    },
  });
};

// Delete a notification
export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => notificationAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Notification deleted.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to delete notification.");
        }
    });
};