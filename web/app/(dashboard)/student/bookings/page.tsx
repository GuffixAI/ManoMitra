// app/(dashboard)/student/bookings/page.tsx
"use client";
import { useMyBookings, useCancelBooking } from "@/hooks/api/useBookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateBookingForm } from "@/components/forms/CreateBookingForm";
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function StudentBookingsPage() {
  const { data: bookings, isLoading } = useMyBookings();
  const cancelBookingMutation = useCancelBooking();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      case "cancelled": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        {/* TODO: Add a "New Booking" button with a Dialog form */}
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer"><Plus className="mr-2 h-4 w-4"/> New Booking</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Book a new Session</DialogTitle></DialogHeader>
                <CreateBookingForm setDialogOpen={setDialogOpen} />
            </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Counsellor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading bookings...</TableCell></TableRow>
              ) : bookings?.length > 0 ? (
                bookings.map((booking: any) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.counsellor.name}</TableCell>
                    <TableCell>{dayjs(booking.start).format("MMM D, YYYY")}</TableCell>
                    <TableCell>{dayjs(booking.start).format("h:mm A")} - {dayjs(booking.end).format("h:mm A")}</TableCell>
                    <TableCell><Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge></TableCell>
                    <TableCell>
                        {["pending", "approved"].includes(booking.status) && (
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" disabled={cancelBookingMutation.isPending}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                               </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently cancel your booking.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Back</AlertDialogCancel>
                                <AlertDialogAction onClick={() => cancelBookingMutation.mutate(booking._id)}>
                                    Yes, cancel it
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                           </AlertDialog>
                        )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center">No bookings found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}