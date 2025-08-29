"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ROLES } from "@/lib/constants";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { register: formRegister, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>();
  const { registerUser, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const onSubmit = async (data: RegisterForm) => {
    if (!selectedRole) {
      toast.error("Please select your role");
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    clearError();

    const success = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: selectedRole as any,
    } as any, selectedRole);

    if (success) {
      toast.success("Registration successful! Please sign in.");
      router.push("/login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <p className="text-muted-foreground">Join ManoMitra and start your journey</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ROLES.STUDENT}>Student</SelectItem>
                    <SelectItem value={ROLES.COUNSELLOR}>Counsellor</SelectItem>
                    <SelectItem value={ROLES.VOLUNTEER}>Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  {...formRegister("name", { required: "Name is required", minLength: { value: 2, message: "Name is too short" } })}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...formRegister("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  {...formRegister("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  {...formRegister("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === watch("password") || "Passwords do not match",
                  })}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !selectedRole}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account? {""}
                  <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
