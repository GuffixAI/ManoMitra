// app/(auth)/login/page.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ROLES } from "@/lib/constants";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginForm>();
  const loginAction = useAuthStore((s) => s.login);
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoginForm) => api.post(`/students/login`, data),
    onSuccess: async () => {
      try {
        const res = await api.get("/auth/me");
        loginAction(res.data.user);
        toast.success("Login successful!");

        const role = res.data.user.role;
        if (role === ROLES.STUDENT) router.push("/student");
        else if (role === ROLES.COUNSELLOR) router.push("/counsellor");
        else if (role === ROLES.VOLUNTEER) router.push("/volunteer");
        else if (role === ROLES.ADMIN) router.push("/admin");
        else router.push("/");
      } catch {
        toast.error("Could not load your profile. Please try again.");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Login failed.");
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((data) => mutate(data))}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: true })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", { required: true })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
