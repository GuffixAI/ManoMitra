// components/forms/CreateBookingForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/axios";
import { useCreateBooking } from "@/hooks/api/useBookings";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";



const generateTimeSlots = (dayAvailability) => {
    if (!dayAvailability || !dayAvailability.slots) return [];
    const slots = [];
    dayAvailability.slots.forEach(slot => {
        let current = dayjs().hour(parseInt(slot.start.split(':')[0])).minute(parseInt(slot.start.split(':')[1]));
        const end = dayjs().hour(parseInt(slot.end.split(':')[0])).minute(parseInt(slot.end.split(':')[1]));
        while(current.isBefore(end)) {
            slots.push(current.format('HH:mm'));
            current = current.add(1, 'hour'); // Assuming 1 hour slots
        }
    });
    return slots;
};

export function CreateBookingForm({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const createBookingMutation = useCreateBooking();
    
    // Fetch counsellors for the dropdown
    const { data: counsellors } = useQuery({
        queryKey: ["allCounsellorsForBooking"],
        queryFn: () => api.get('/admin/counsellors').then(res => res.data.data),
    });

    const [date, setDate] = useState<Date | undefined>();
    const selectedCounsellorId = watch("counsellorId");
    const selectedDate = watch("start");


    const { data: availability, isLoading: isLoadingAvailability } = useQuery({
        queryKey: ["counsellorAvailability", selectedCounsellorId],
        queryFn: () => api.get(`/counsellors/${selectedCounsellorId}/availability`).then(res => res.data.data),
        enabled: !!selectedCounsellorId, // Only run this query when a counsellor is selected
    });

    const dayOfWeek = selectedDate ? dayjs(selectedDate).format('dddd').toLowerCase() : null;
    const availableSlots = availability && dayOfWeek 
        ? generateTimeSlots(availability.find(d => d.day.toLowerCase() === dayOfWeek)) 
        : [];


    const onSubmit = (data: any) => {
        const start = dayjs(data.start).hour(parseInt(data.time.split(':')[0])).minute(0).second(0);
        const end = start.add(1, 'hour'); // Assuming 1-hour slots
        
        const bookingData = {
            counsellorId: data.counsellorId,
            start: start.toISOString(),
            end: end.toISOString(),
            notes: data.notes,
        };
        
        createBookingMutation.mutate(bookingData, {
            onSuccess: () => setDialogOpen(false)
        });
    };

    

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label>Counsellor</Label>
                <Select onValueChange={value => setValue('counsellorId', value, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Select a counsellor" /></SelectTrigger>
                    <SelectContent>
                        {counsellors?.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.name} - {c.specialization}</SelectItem>)}
                    </SelectContent>
                </Select>
                <input type="hidden" {...register('counsellorId', { required: true })} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? dayjs(selectedDate).format('MMM D, YYYY') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setValue('start', d, { shouldValidate: true })}} initialFocus /></PopoverContent>
                    </Popover>
                    <input type="hidden" {...register('start', { required: true })} />
                </div>
                <div>
                    <Label>Time Slot</Label>
                    <Select onValueChange={value => setValue('time', value, { shouldValidate: true })} disabled={!selectedDate || !selectedCounsellorId || availableSlots.length === 0}>
                        <SelectTrigger>
                            <SelectValue placeholder={isLoadingAvailability ? "Loading..." : "Select time"} />
                        </SelectTrigger>
                        <SelectContent>
                           {availableSlots.length > 0 ? (
                               availableSlots.map(slot => (
                                   <SelectItem key={slot} value={slot}>{dayjs().hour(parseInt(slot.split(':')[0])).minute(parseInt(slot.split(':')[1])).format('h:mm A')}</SelectItem>
                               ))
                           ) : (
                               <SelectItem value="none" disabled>No slots available</SelectItem>
                           )}
                        </SelectContent>
                    </Select>
                    
                     <input type="hidden" {...register('time', { required: true })} />
                </div>
            </div>

            <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" {...register("notes")} />
            </div>
            
            <Button type="submit" className="w-full" disabled={createBookingMutation.isPending}>
                {createBookingMutation.isPending ? "Submitting..." : "Request Booking"}
            </Button>
        </form>
    );
}