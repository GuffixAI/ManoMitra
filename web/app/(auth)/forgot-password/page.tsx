// web/app/(auth)/forgot-password/page.tsx
"use client";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/lib/constants";

export default function ForgotPasswordPage() {
  const { register, handleSubmit,control, formState: { errors } } = useForm();
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authAPI.forgotPassword(email),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "An error occurred.");
    }
  });

  const onSubmit = (data: any) => {
    forgotPasswordMutation.mutate(data.email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email to receive a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="role">I am a...</Label>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ROLES.STUDENT}>Student</SelectItem>
                      <SelectItem value={ROLES.COUNSELLOR}>Counsellor</SelectItem>
                      <SelectItem value={ROLES.VOLUNTEER}>Volunteer</SelectItem>
                      <SelectItem value={ROLES.ADMIN}>Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-sm text-destructive mt-1">{`${errors.role.message}`}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{`${errors.email.message}`}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
              {forgotPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
            <Button variant="link" className="w-full" asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}