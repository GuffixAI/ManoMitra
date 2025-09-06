// web/app/(dashboard)/counsellor/schedule/page.tsx
"use client";
import { useCounsellorSchedule } from "@/hooks/api/useCounsellors";
import { useUpdateBookingStatus } from "@/hooks/api/useBookings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { useState } from "react";
import { Check, X, CalendarCheck, CalendarClock } from "lucide-react";

export default function CounsellorSchedulePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { data: scheduleData, isLoading } = useCounsellorSchedule();
    const updateStatusMutation = useUpdateBookingStatus();

    const bookingsForSelectedDay = scheduleData?.bookings.filter((b: any) => 
        dayjs(b.start).isSame(date, 'day')
    ) || [];

    const pendingRequests = bookingsForSelectedDay.filter((b: any) => b.status === 'pending');
    const upcomingAppointments = bookingsForSelectedDay.filter((b: any) => b.status === 'approved');

    const handleUpdateStatus = (bookingId: string, action: 'confirm' | 'reject') => {
        updateStatusMutation.mutate({ bookingId, action });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Schedule</h1>
            <div className="grid md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1 flex justify-center">
                   <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                    />
                </div>
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CalendarClock/> Pending Requests</CardTitle>
                            <CardDescription>for {dayjs(date).format("MMMM D, YYYY")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isLoading && <div className="flex justify-center"><Spinner /></div>}
                            {!isLoading && pendingRequests.length === 0 && (
                                <p className="text-muted-foreground text-center py-6">No pending requests for this day.</p>
                            )}
                            {pendingRequests.map((booking: any) => (
                                <div key={booking._id} className="flex justify-between items-center p-3 rounded-lg border bg-muted/50">
                                    <div>
                                        <p className="font-semibold">{booking.student.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {dayjs(booking.start).format("h:mm A")}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="outline" className="h-8 w-8 bg-green-100 hover:bg-green-200 text-green-700" onClick={() => handleUpdateStatus(booking._id, 'confirm')}>
                                            <Check className="h-4 w-4"/>
                                        </Button>
                                        <Button size="icon" variant="outline" className="h-8 w-8 bg-red-100 hover:bg-red-200 text-red-700" onClick={() => handleUpdateStatus(booking._id, 'reject')}>
                                            <X className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2"><CalendarCheck/> Upcoming Appointments</CardTitle>
                             <CardDescription>for {dayjs(date).format("MMMM D, YYYY")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isLoading && <div className="flex justify-center"><Spinner /></div>}
                            {!isLoading && upcomingAppointments.length === 0 && (
                                <p className="text-muted-foreground text-center py-6">No upcoming appointments for this day.</p>
                            )}
                            {upcomingAppointments.map((booking: any) => (
                                <div key={booking._id} className="flex justify-between items-center p-3 rounded-lg border">
                                    <div>
                                        <p className="font-semibold">{booking.student.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {dayjs(booking.start).format("h:mm A")} - {dayjs(booking.end).format("h:mm A")}
                                        </p>
                                    </div>
                                    <Badge>Approved</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}