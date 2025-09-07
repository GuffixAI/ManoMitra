// FILE: web/components/layout/sidebar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnreadCount } from "@/hooks/api/useNotifications";
import {
  Home,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Heart,
  BookOpen,
  BarChart3,
  HelpCircle,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Fetch unread count specifically for chat notifications
  const { data: chatUnreadData } = useUnreadCount("chat");
  const chatUnreadCount = chatUnreadData?.unreadCount || 0;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      {
        title: "Dashboard",
        href: `/${user.role}`,
        icon: Home,
        badge: null,
      },
    ];

    switch (user.role) {
      case "student":
        return [
          ...baseItems,
          {
            title: "Bookings",
            href: "/student/bookings",
            icon: Calendar,
            badge: null,
          },
          {
            title: "Reports",
            href: "/student/reports",
            icon: FileText,
            badge: null,
          },
          {
            title: "Feedback",
            href: "/student/feedback",
            icon: Star,
            badge: null,
          },
          {
            title: "Counsellors",
            href: "/student/counsellors",
            icon: Users,
            badge: null,
          },
          {
            title: "Volunteers",
            href: "/student/volunteers",
            icon: Heart,
            badge: null,
          },
          {
            title: "Messages",
            href: "/messages",
            icon: MessageSquare,
            badge: chatUnreadCount > 0 ? chatUnreadCount : null,
          },
          {
            title: "Peer Support",
            href: "/student/chat",
            icon: MessageSquare,
            badge: null,
          },
          {
            title: "Notifications",
            href: "/student/notifications",
            icon: Bell,
            badge: null,
          },
          {
            title: "Profile",
            href: "/student/profile",
            icon: User,
            badge: null,
          },
        ];

      case "counsellor":
        return [
          ...baseItems,
          {
            title: "Schedule",
            href: "/counsellor/schedule",
            icon: Calendar,
            badge: null,
          },
          {
            title: "Students",
            href: "/counsellor/students",
            icon: Users,
            badge: null,
          },
          {
            title: "Reports",
            href: "/counsellor/reports",
            icon: FileText,
            badge: null,
          },
          {
            title: "Messages",
            href: "/messages",
            icon: MessageSquare,
            badge: chatUnreadCount > 0 ? chatUnreadCount : null,
          },
          {
            title: "Performance",
            href: "/counsellor/performance",
            icon: BarChart3,
            badge: null,
          },
          {
            title: "Notifications",
            href: "/counsellor/notifications",
            icon: Bell,
            badge: null,
          },
          {
            title: "Profile",
            href: "/counsellor/profile",
            icon: User,
            badge: null,
          },
        ];

      case "volunteer":
        return [
          ...baseItems,
          {
            title: "Rooms",
            href: "/volunteer/rooms",
            icon: MessageSquare,
            badge: null,
          },
          {
            title: "Performance",
            href: "/volunteer/performance",
            icon: BarChart3,
            badge: null,
          },
          {
            title: "Training",
            href: "/volunteer/training",
            icon: BookOpen,
            badge: null,
          },
          {
            title: "Students",
            href: "/volunteer/students",
            icon: Users,
            badge: null,
          },

          {
            title: "Notifications",
            href: "/volunteer/notifications",
            icon: Bell,
            badge: null,
          },
          {
            title: "Profile",
            href: "/volunteer/profile",
            icon: User,
            badge: null,
          },
        ];

      case "admin":
        return [
          ...baseItems,
          {
            title: "Users",
            href: "/admin/users",
            icon: Users,
            badge: null,
          },
          {
            title: "Reports",
            href: "/admin/reports",
            icon: FileText,
            badge: null,
          },
          {
            title: "Analytics",
            href: "/admin/analytics",
            icon: BarChart3,
            badge: null,
          },
          {
            title: "Rooms",
            href: "/admin/rooms",
            icon: MessageSquare,
            badge: null,
          },
          {
            title: "System",
            href: "/admin/system",
            icon: Settings,
            badge: null,
          },
          {
            title: "Feedback",
            href: "/admin/feedback",
            icon: Star,
            badge: null,
          },
          {
            title: "Notifications",
            href: "/admin/notifications",
            icon: Bell,
            badge: null,
          },
          {
            title: "Profile",
            href: "/admin/profile",
            icon: User,
            badge: null,
          },
        ];

      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const SidebarContent = () => (
    <div
      className={cn(
        "flex h-full flex-col bg-card border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg">Mitra</span>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center w-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {navigationItems.map((item) => {
          // --- FIX IS HERE ---
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobileOpen && setIsMobileOpen(false)}
            >
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start mb-2 cursor-pointer",
                  isCollapsed ? "justify-center px-2" : "px-4"
                )}
              >
                <Icon
                  className={cn("h-4 w-4", isCollapsed ? "mx-0" : "mr-3")}
                />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant="destructive"
                        className="ml-auto h-5 w-5 p-0 flex items-center justify-center"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-2 mt-auto">
        {/* Help */}
        <Link
          href="/help"
          onClick={() => isMobileOpen && setIsMobileOpen(false)}
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed ? "justify-center px-2" : "px-4"
            )}
          >
            <HelpCircle
              className={cn("h-4 w-4", isCollapsed ? "mx-0" : "mr-3")}
            />
            {!isCollapsed && <span>Help & Support</span>}
          </Button>
        </Link>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive",
            isCollapsed ? "justify-center px-2" : "px-4"
          )}
        >
          <LogOut className={cn("h-4 w-4", isCollapsed ? "mx-0" : "mr-3")} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        {/* Mobile Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-3 left-3 z-50 md:hidden bg-background/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsMobileOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed left-0 top-0 z-50 h-full md:hidden"
              >
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
