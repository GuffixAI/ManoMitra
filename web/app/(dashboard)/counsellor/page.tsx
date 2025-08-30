// web/app/(dashboard)/counsellor/page.tsx
"use client";
import { useCounsellorDashboard } from "@/hooks/api/useCounsellors";
import { useIncomingBookings } from "@/hooks/api/useBookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart, Users, Calendar, FileText, AlertTriangle, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import dayjs from "dayjs";

export default function CounsellorDashboardPage() {
    const { data: dashboardData, isLoading: isLoadingDashboard } = useCounsellorDashboard();
    const { data: bookings, isLoading: isLoadingBookings } = useIncomingBookings();

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

    if (isLoadingDashboard || isLoadingBookings) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Counsellor Dashboard</h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Connected Students" value={dashboardData?.students || 0} icon={Users} link="/counsellor/students" linkText="View Students" />
                <StatCard title="Pending Bookings" value={dashboardData?.bookings.pending || 0} icon={Calendar} link="/counsellor/schedule" linkText="Manage Schedule" />
                <StatCard title="Pending Reports" value={dashboardData?.reports.pending || 0} icon={FileText} link="/counsellor/reports" linkText="View Reports" />
                <StatCard title="Urgent Reports" value={dashboardData?.reports.urgent || 0} icon={AlertTriangle} link="/counsellor/reports?priority=urgent" linkText="View Urgent" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {bookings?.filter((b: any) => b.status === 'approved').slice(0, 5).map((booking: any) => (
                            <div key={booking._id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                <div>
                                    <p className="font-semibold">{booking.student.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {dayjs(booking.start).format("MMM D, YYYY h:mm A")}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/counsellor/schedule">View</Link>
                                </Button>
                            </div>
                        ))}
                         {bookings?.filter((b: any) => b.status === 'approved').length === 0 && (
                            <p className="text-sm text-center text-muted-foreground py-4">No upcoming appointments.</p>
                         )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" asChild><Link href="/counsellor/schedule"><Calendar className="mr-2 h-4 w-4" /> Manage Schedule & Availability</Link></Button>
                        <Button variant="outline" className="w-full justify-start" asChild><Link href="/counsellor/reports"><FileText className="mr-2 h-4 w-4" /> Review Assigned Reports</Link></Button>
                        <Button variant="outline" className="w-full justify-start" asChild><Link href="/counsellor/students"><Users className="mr-2 h-4 w-4" /> View Connected Students</Link></Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}