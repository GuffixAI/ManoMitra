// app/(dashboard)/counsellor/layout.tsx
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ReactNode } from "react";

export default function CounsellorLayout({ children }: { children: ReactNode }) {
  const navItems = [
    { title: "Dashboard", href: "/counsellor" },
    { title: "Availability", href: "/counsellor/availability" },
    { title: "Feedback", href: "/counsellor/feedback" },
  ];
  return (
    <div className="flex">
      <SidebarNav items={navItems} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}