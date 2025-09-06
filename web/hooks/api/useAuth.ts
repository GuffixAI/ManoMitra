

// NEW FILE: web/hooks/api/useAuth.ts
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

export const useChangePassword = () => {
  const logout = useAuthStore(s => s.logout);
  return useMutation({
    mutationFn: (data: any) => authAPI.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully. Please log in again.");
      logout(); // Log out the user for security
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to change password.");
    }
  });
};