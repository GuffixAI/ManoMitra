// components/layout/SidebarNav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    // Ideally, you'd have a backend endpoint for logout to invalidate the refresh token.
    // For now, we just clear the client state and cookie.
    logout();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    toast.success("Logged out successfully.");
    router.push("/login");
  };

  return (
    <nav
      className={cn(
        "flex flex-col space-y-2 lg:w-64 h-screen bg-card p-4 border-r",
        className
      )}
      {...props}
    >
      <h2 className="text-lg font-semibold tracking-tight mb-4">Dashboard</h2>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex w-full items-center rounded-md border border-transparent px-3 py-2 hover:bg-muted hover:text-foreground",
            pathname === item.href
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
}
