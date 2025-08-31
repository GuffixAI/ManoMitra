// web/components/forms/ChangePasswordForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export function ChangePasswordForm({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const logout = useAuthStore(s => s.logout);

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => authAPI.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully. Please log in again.");
      reset();
      setDialogOpen(false);
      logout(); // Log out the user for security
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to change password.");
    }
  });

  const onSubmit = (data: any) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div>
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          {...register("currentPassword", { required: "Current password is required" })}
        />
        {errors.currentPassword && <p className="text-sm text-destructive mt-1">{`${errors.currentPassword.message}`}</p>}
      </div>
      <div>
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          {...register("newPassword", {
            required: "New password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" }
          })}
        />
        {errors.newPassword && <p className="text-sm text-destructive mt-1">{`${errors.newPassword.message}`}</p>}
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword", {
            required: "Please confirm your new password",
            validate: value => value === watch("newPassword") || "Passwords do not match"
          })}
        />
        {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{`${errors.confirmPassword.message}`}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-2">
         <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
         <Button type="submit" disabled={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
         </Button>
      </div>
    </form>
  );
}