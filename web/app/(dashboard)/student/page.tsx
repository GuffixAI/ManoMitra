// app/(dashboard)/student/page.tsx
"use client";
import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
      <p className="text-muted-foreground">Here's your student dashboard.</p>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Email: {user?.email}</p>
            {/* Add profile update form here */}
          </CardContent>
        </Card>
        {/* Add more cards for bookings, reports etc. */}
      </div>
    </div>
  );
}