// app/(dashboard)/counsellor/page.tsx
"use client";
import { useIncomingBookings, useUpdateBookingStatus } from "@/hooks/api/useBookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from "dayjs";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CounsellorDashboardPage() {
    const { data: bookings, isLoading } = useIncomingBookings();
    const updateStatusMutation = useUpdateBookingStatus();

    const pendingBookings = bookings?.filter((b: any) => b.status === 'pending') || [];
    const approvedBookings = bookings?.filter((b: any) => b.status === 'approved') || [];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Incoming Bookings</h1>
            {/* <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
                            : bookings?.filter((b: any) => b.status === 'pending').map((booking: any) => (
                                <TableRow key={booking._id}>
                                    <TableCell>{booking.student.name}</TableCell>
                                    <TableCell>{dayjs(booking.start).format("MMM D, YYYY")}</TableCell>
                                    <TableCell>{dayjs(booking.start).format("h:mm A")}</TableCell>
                                    <TableCell>{booking.status}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button size="icon" variant="outline" className="text-green-500" onClick={() => updateStatusMutation.mutate({ bookingId: booking._id, action: 'approve' })}>
                                            <Check className="h-4 w-4"/>
                                        </Button>
                                        <Button size="icon" variant="outline" className="text-red-500" onClick={() => updateStatusMutation.mutate({ bookingId: booking._id, action: 'reject' })}>
                                            <X className="h-4 w-4"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card> */}


            <Card>
                <CardHeader><CardTitle>Pending Requests</CardTitle></CardHeader>
                <CardContent className="pt-0">
                    <Table>
                        {/* TableHeader is fine */}
                        <TableBody>
                            {isLoading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
                            : pendingBookings.length > 0 ? pendingBookings.map((booking: any) => (
                                <TableRow key={booking._id}>
                                    {/* TableCells for data */}
                                    <TableCell className="flex gap-2">
                                        <Button size="icon" variant="outline" className="text-green-500" onClick={() => updateStatusMutation.mutate({ bookingId: booking._id, action: 'approve' })}>
                                            <Check className="h-4 w-4"/>
                                        </Button>
                                        <Button size="icon" variant="outline" className="text-red-500" onClick={() => updateStatusMutation.mutate({ bookingId: booking._id, action: 'reject' })}>
                                            <X className="h-4 w-4"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={5} className="text-center">No pending requests.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Approved Appointments Section */}
            <Card>
                <CardHeader><CardTitle>Upcoming Approved Appointments</CardTitle></CardHeader>
                <CardContent className="pt-0">
                    <Table>
                        {/* TableHeader without actions */}
                        <TableBody>
                            {isLoading ? <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
                            : approvedBookings.length > 0 ? approvedBookings.map((booking: any) => (
                                <TableRow key={booking._id}>
                                    <TableCell>{booking.student.name}</TableCell>
                                    <TableCell>{dayjs(booking.start).format("MMM D, YYYY")}</TableCell>
                                    <TableCell>{dayjs(booking.start).format("h:mm A")}</TableCell>
                                    <TableCell><Badge>Approved</Badge></TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={4} className="text-center">No upcoming appointments.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}