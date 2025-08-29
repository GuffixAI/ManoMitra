// app/(dashboard)/volunteer/layout.tsx
"use client";
import { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function VolunteerLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}