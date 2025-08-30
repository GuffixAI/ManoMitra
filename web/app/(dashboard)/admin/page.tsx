// web/app/(dashboard)/admin/page.tsx
"use client";
import { useAdminDashboardStats } from "@/hooks/api/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar, AlertTriangle, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function AdminDashboardPage() {
    const { data, isLoading } = useAdminDashboardStats();

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
    
    const stats = data?.data;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Students" value={stats?.users.students} icon={Users} link="/admin/students" linkText="Manage Students" />
                <StatCard title="Total Counsellors" value={stats?.users.counsellors} icon={Users} link="/admin/counsellors" linkText="Manage Counsellors" />
                <StatCard title="Total Volunteers" value={stats?.users.volunteers} icon={Users} link="/admin/volunteers" linkText="Manage Volunteers" />
                <StatCard title="Total Reports" value={stats?.reports.total} icon={FileText} link="/admin/reports" linkText="Manage Reports" />
                <StatCard title="Pending Reports" value={stats?.reports.pending} icon={FileText} />
                <StatCard title="Urgent Reports" value={stats?.reports.urgent} icon={AlertTriangle} />
                <StatCard title="Total Bookings" value={stats?.bookings} icon={Calendar} />
            </div>
             {/* Further components for recent activity etc. can be added */}
        </div>
    );
}