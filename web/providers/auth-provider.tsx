// Enhanced authentication provider with proper error handling and loading states
"use client";
import { useAuthStore } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";
import { useEffect } from "react";
import { User } from "@/types/auth";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { 
    user, 
    login, 
    logout, 
    isLoading: storeLoading,
    setLoading,
    setError 
  } = useAuthStore();
  
  const pathname = usePathname();

  // Skip auth check for public routes
  const isPublicRoute = pathname === '/' || 
                       pathname.startsWith('/login') || 
                       pathname.startsWith('/register') ||
                       pathname.startsWith('/splash');

  const { data, isError, isLoading: queryLoading, error } = useQuery<{ user: User }>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const response = await authAPI.getMe();
        return response;
      } catch (err: any) {
        if (err.response?.status === 401) {
          // Token expired or invalid, clear user
          logout();
        }
        throw err;
      }
    },
    retry: 1,
    enabled: !user && !isPublicRoute,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle loading states
  useEffect(() => {
    setLoading(queryLoading);
  }, [queryLoading, setLoading]);

  // Handle successful authentication
  useEffect(() => {
    if (data?.user && !user) {
      login(data.user);
      toast.success("Welcome back!");
    }
  }, [data, user, login]);

  // Handle authentication errors
  useEffect(() => {
    if (isError && !user) {
      const errorMessage = error?.response?.data?.message || 'Authentication failed';
      setError(errorMessage);
      
      // Only show toast for non-401 errors (401 is handled silently)
      if (error?.response?.status !== 401) {
        toast.error(errorMessage);
      }
      
      // Clear any existing user data
      logout();
    }
  }, [isError, error, user, setError, logout]);

  // Auto-refresh user data periodically
  useEffect(() => {
    if (user && !isPublicRoute) {
      const interval = setInterval(async () => {
        try {
          await authAPI.getMe();
        } catch (err) {
          // Silent refresh failure, will be handled on next request
        }
      }, 10 * 60 * 1000); // Refresh every 10 minutes

      return () => clearInterval(interval);
    }
  }, [user, isPublicRoute]);

  // Show loading state only when necessary
  if (storeLoading || (queryLoading && !user && !isPublicRoute)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;