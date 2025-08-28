// app/(dashboard)/volunteer/layout.tsx
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ReactNode } from "react";

export default function VolunteerLayout({ children }: { children: ReactNode }) {
  const navItems = [
    { title: "Dashboard", href: "/volunteer" },
    { title: "My Rooms", href: "/volunteer/rooms" },
  ];
  return (
    <div className="flex">
      <SidebarNav items={navItems} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}