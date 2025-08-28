// providers/auth-provider.tsx
"use client";
import { useAuthStore } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useEffect } from "react";
import { User } from "@/types/auth";
import { usePathname } from "next/navigation";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, login, logout } = useAuthStore();
  const pathname = usePathname();

  const { data, isError, isLoading } = useQuery<{ data: { user: User } }>({
    queryKey: ["me"],
    queryFn: () => api.get("/auth/me"),
    retry: 1,
    enabled: !user && !pathname.startsWith('/login') && !pathname.startsWith('/register'),
  });

  useEffect(() => {
    if (data?.data.user) {
      login(data.data.user);
    }
    if (isError) {
      logout();
    }
  }, [data, isError, login, logout]);

  if (isLoading && !user) {
     return <div className="flex h-screen items-center justify-center">Loading session...</div>;
  }

  return <>{children}</>;
};

export default AuthProvider;