// web/app/(dashboard)/admin/analytics/page.tsx
"use client";
import { useSystemAnalytics } from "@/hooks/api/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Users, FileText, Calendar, CheckCircle } from "lucide-react";

export default function AdminAnalyticsPage() {
    const { data: analytics, isLoading } = useSystemAnalytics({ period: '30d' });

     if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    const metrics = analytics?.data.metrics;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">System Analytics (Last 30 Days)</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.newUsers}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Reports</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.newReports}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalBookings}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Report Resolution Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.resolutionRate}%</div>
                    </CardContent>
                </Card>
            </div>
             {/* Charts and graphs could be added here for visualization */}
        </div>
    );
}