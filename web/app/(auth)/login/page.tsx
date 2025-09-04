// web/app/(auth)/login/page.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ROLES } from "@/lib/constants";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

type LoginForm = {
  email: string;
  password: string;
  role: string;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isRedirecting, setIsRedirecting] = useState(false); // New state for smooth transition
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const { loginUser, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

const handleLogin = async (data: LoginForm) => {
    if (!selectedRole) {
      toast.error("Please select your role");
      return;
    }

    clearError();
    
    const success = await loginUser({
      email: data.email,
      password: data.password,
      role: selectedRole as any
    });

    if (success) {
      toast.success("Login successful! Redirecting...");
      setIsRedirecting(true); // Set redirecting state

      // Redirect based on role
      const roleToDashboard: Record<string, string> = {
        [ROLES.STUDENT]: '/pre-dashboard',
        [ROLES.COUNSELLOR]: '/counsellor',
        [ROLES.VOLUNTEER]: '/volunteer',
        [ROLES.ADMIN]: '/admin',
      };
      const dashboardUrl = roleToDashboard[selectedRole];

      if (dashboardUrl){
        router.push(dashboardUrl)
      }
      
      // if (dashboardUrl) {
      //   // Introduce a delay before redirecting
      //   setTimeout(() => {
      //     router.push(dashboardUrl);
      //   }, 1000); // 1000ms = 1 second delay
      // }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <p className="text-muted-foreground">Sign in to your account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
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
                    <SelectItem value={ROLES.ADMIN}>Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password", { 
                      required: "Password is required",
                      minLength: { value: 8, message: "Password must be at least 8 characters" }
                    })}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !selectedRole || isRedirecting}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                ) : isRedirecting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecting...</>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    Register here
                  </Link>
                </p>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}