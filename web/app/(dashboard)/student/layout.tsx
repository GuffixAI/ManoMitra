// app/(dashboard)/student/layout.tsx
import { SidebarNav } from "@/components/layout/SidebarNav"; // We will create this
import { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const navItems = [
    { title: "Dashboard", href: "/student" },
    { title: "Bookings", href: "/student/bookings" },
    { title: "Reports", href: "/student/reports" },
    { title: "Chat Rooms", href: "/chat/rooms" },
  ];
  return (
    <div className="flex">
      <SidebarNav items={navItems} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}