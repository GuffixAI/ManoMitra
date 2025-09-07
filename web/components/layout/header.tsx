// FILE: web/components/layout/header.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  useUserNotifications,
  useUnreadCount,
} from "@/hooks/api/useNotifications"; // UPDATED
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // ADDED for relative time formatting

dayjs.extend(relativeTime); // ADDED

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  // Fetch unread count
  const { data: unreadCountData } = useUnreadCount();

  // Fetch latest notifications only when the dropdown is open
  const { data: notificationsData } = useUserNotifications({ limit: 5 });

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "counsellor":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "volunteer":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (!user) return null;

  const unreadCount = unreadCountData?.unreadCount || 0;
  const notifications = notificationsData?.data?.notifications || [];

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b bg-background px-6",
        className
      )}
    >
      {/* Left Section - Search */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-64 rounded-md border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="h-9 w-9 relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 z-50 w-80 rounded-md border bg-card p-4 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif: any) => (
                        <div
                          key={notif._id}
                          className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted"
                        >
                          {!notif.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notif.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {dayjs(notif.createdAt).fromNow()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-center text-muted-foreground py-4">
                        No new notifications.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <Link href={`/${user.role}/notifications`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View all notifications
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative">
          <Button
            variant="ghost"
            className="h-9 px-3 flex items-center space-x-2 cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.profileImage} alt={user.name} />
              <AvatarFallback className="text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{user.name}</p>
            </div>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {isProfileOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />

                {/* Dropdown */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 z-50 min-w-[16rem] rounded-md border bg-card p-4 shadow-lg"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-md bg-muted">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {/* <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p> */}
                      <Badge
                        variant="secondary"
                        className={cn("mt-1", getRoleColor(user.role))}
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <Link href={`/${user.role}/profile`}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-9 cursor-pointer"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </Link>

                    <Link href="/settings">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-9 cursor-pointer"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </Link>

                    <div className="border-t pt-2 mt-2">
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start h-9 text-destructive hover:text-destructive cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
