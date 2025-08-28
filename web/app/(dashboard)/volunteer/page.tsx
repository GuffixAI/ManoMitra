// app/(dashboard)/volunteer/page.tsx
"use client";
import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useMyVolunteerRating } from "@/hooks/api/useVolunteers";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-lg font-bold">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function VolunteerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useMyVolunteerRating();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
      <p className="text-muted-foreground">Here is your volunteer dashboard.</p>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading rating...</p>
            ) : data ? (
              <StarRating rating={data.rating} />
            ) : (
              <p>No ratings yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Moderated Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Fetch rooms where this volunteer is a moderator */}
            <p>You are moderating the 'General' and 'Anxiety' rooms.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}