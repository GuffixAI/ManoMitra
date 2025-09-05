// web/app/(auth)/reset-password/[token]/page.tsx
"use client";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const resetPasswordMutation = useMutation({
    mutationFn: (password: string) => authAPI.resetPassword(token, password),
    onSuccess: (data) => {
      toast.success(data.message);
      router.push("/login");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    }
  });

  const onSubmit = (data: any) => {
    resetPasswordMutation.mutate(data.password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input 
                id="password" 
                type="password"
                {...register("password", { required: "New password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
              />
              {errors.password && <p className="text-sm text-destructive mt-1">{`${errors.password.message}`}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                {...register("confirmPassword", { required: "Please confirm your password", validate: value => value === watch('password') || "Passwords do not match" })}
              />
               {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{`${errors.confirmPassword.message}`}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
              {resetPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}