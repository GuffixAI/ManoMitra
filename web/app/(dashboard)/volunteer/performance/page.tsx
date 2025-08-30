// web/app/(dashboard)/volunteer/performance/page.tsx
"use client";
import { useVolunteerPerformance } from "@/hooks/api/useVolunteers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { BarChart, MessageSquare, Star, Users } from "lucide-react";

export default function VolunteerPerformancePage() {
    const { data: performance, isLoading } = useVolunteerPerformance();

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }
    
    const metrics = performance?.data.metrics;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Performance</h1>
            <p className="text-muted-foreground">Metrics from the last 30 days.</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.averageRating || "N/A"}</div>
                        <p className="text-xs text-muted-foreground">{metrics?.feedbackCount} total reviews</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Messages Sent</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalMessages}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Moderated Rooms</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalRooms}</div>
                    </CardContent>
                </Card>
            </div>
            {/* Additional graphs and charts can be added here */}
        </div>
    );
}