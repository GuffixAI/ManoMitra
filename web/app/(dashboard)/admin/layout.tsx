// app/(dashboard)/admin/layout.tsx
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navItems = [
    { title: "Overview", href: "/admin" },
    { title: "Counsellors", href: "/admin/counsellors" },
    { title: "Volunteers", href: "/admin/volunteers" },
    { title: "Chat Rooms", href: "/admin/rooms" },
  ];
  return (
    <div className="flex">
      <SidebarNav items={navItems} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}