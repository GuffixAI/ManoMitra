// web/app/(dashboard)/counsellor/schedule/page.tsx
"use client";
import { useCounsellorSchedule } from "@/hooks/api/useCounsellors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import dayjs from "dayjs";
import { useState } from "react";

export default function CounsellorSchedulePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { data: scheduleData, isLoading } = useCounsellorSchedule();

    const selectedDayBookings = scheduleData?.bookings.filter((b: any) => 
        dayjs(b.start).isSame(date, 'day')
    ) || [];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Schedule</h1>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex justify-center">
                   <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                    />
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointments for {dayjs(date).format("MMMM D, YYYY")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoading && <div className="flex justify-center"><Spinner /></div>}
                            {!isLoading && selectedDayBookings.length === 0 && (
                                <p className="text-muted-foreground text-center py-8">No appointments scheduled for this day.</p>
                            )}
                            {selectedDayBookings.map((booking: any) => (
                                <div key={booking._id} className="flex justify-between items-center p-3 rounded-lg border">
                                    <div>
                                        <p className="font-semibold">{booking.student.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {dayjs(booking.start).format("h:mm A")} - {dayjs(booking.end).format("h:mm A")}
                                        </p>
                                    </div>
                                    <Badge variant={booking.status === 'approved' ? 'default' : 'secondary'}>
                                        {booking.status}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}