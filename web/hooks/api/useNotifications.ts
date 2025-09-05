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



// Get user's notification preferences
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: () => notificationAPI.getPreferences(),
  });
};

// Update user's notification preferences
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => notificationAPI.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
      toast.success("Notification preferences updated.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update preferences.");
    },
  });
};

// Unarchive a notification
export const useUnarchiveNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationAPI.unarchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification restored.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to unarchive notification.");
    },
  });
};

// (Admin) Get notifications for a specific user
export const useAdminUserNotifications = (userId: string, userModel: string, params?: any) => {
  return useQuery({
    queryKey: ["adminUserNotifications", userId, params],
    queryFn: () => notificationAPI.getAdminUserNotifications(userId, userModel, params),
    enabled: !!userId && !!userModel,
  });
};

// (Admin) Send a system-wide notification
export const useSendSystemNotification = () => {
  return useMutation({
    mutationFn: (data: any) => notificationAPI.sendSystemNotification(data),
    onSuccess: () => {
      toast.success("System notification sent successfully.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to send notification.");
    },
  });
};

// (Admin) Get notification statistics
export const useNotificationStats = () => {
  return useQuery({
    queryKey: ["notificationStats"],
    queryFn: () => notificationAPI.getNotificationStats(),
  });
};

// (Admin) Clean up expired notifications
export const useCleanupNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationAPI.cleanupExpiredNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Expired notifications have been cleaned up.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Cleanup process failed.");
    },
  });
};