// web/app/(dashboard)/volunteer/page.tsx
"use client";
import { useAuthStore } from "@/store/auth.store";
import { useVolunteerDashboard } from "@/hooks/api/useVolunteers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, BarChart3, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

export default function VolunteerDashboardPage() {
    const user = useAuthStore((s) => s.user);
    const { data: dashboardData, isLoading } = useVolunteerDashboard();

    const StatCard = ({ title, value, icon: Icon, link, linkText }: any) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                 {link && (
                    <Link href={link} className="text-xs text-muted-foreground flex items-center hover:text-primary">
                        {linkText} <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                )}
            </CardContent>
        </Card>
    );

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Average Rating" value={dashboardData?.rating.toFixed(1) || "N/A"} icon={Star} link="/volunteer/feedback" linkText={`${dashboardData?.feedbackCount} reviews`} />
                <StatCard title="Moderated Rooms" value={dashboardData?.rooms || 0} icon={MessageSquare} link="/volunteer/rooms" linkText="View Rooms" />
                <StatCard title="Messages Sent (Today)" value={dashboardData?.messages.today || 0} icon={BarChart3} link="/volunteer/performance" linkText="View Performance" />
                <StatCard title="Total Messages Sent" value={dashboardData?.messages.total || 0} icon={BarChart3} />
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild><Link href="/volunteer/rooms"><MessageSquare className="mr-2 h-4 w-4" /> Go to My Rooms</Link></Button>
                    <Button variant="outline" className="w-full justify-start" asChild><Link href="/volunteer/training"><BookOpen className="mr-2 h-4 w-4" /> Access Training Materials</Link></Button>
                    <Button variant="outline" className="w-full justify-start" asChild><Link href="/volunteer/performance"><BarChart3 className="mr-2 h-4 w-4" /> View My Performance</Link></Button>
                </CardContent>
            </Card>
        </div>
    );
}