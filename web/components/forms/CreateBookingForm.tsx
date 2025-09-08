
// components/forms/CreateBookingForm.tsx
"use client";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateBooking } from "@/hooks/api/useBookings";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useAvailableCounsellors } from "@/hooks/api/useStudents";
import { bookingAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";


export function CreateBookingForm({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
    const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm();
    const createBookingMutation = useCreateBooking();
    
    // FIX: Correctly access nested data array from the API response
    const { data: counsellorsResponse, isLoading: isLoadingCounsellors } = useAvailableCounsellors();
    const counsellors = counsellorsResponse?.data || [];


    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const selectedCounsellorId = watch("counsellorId");
    
    const { data: availableSlotsData, isLoading: isLoadingAvailability } = useQuery({
        queryKey: ["counsellorSlots", selectedCounsellorId, selectedDate],
        queryFn: () => bookingAPI.getAvailableSlots(selectedCounsellorId, dayjs(selectedDate).format('YYYY-MM-DD')),
        enabled: !!selectedCounsellorId && !!selectedDate,
    });

    const availableSlots = availableSlotsData?.data || [];

    useEffect(() => {
        // Reset time slot when counsellor or date changes
        setValue("time", undefined);
    }, [selectedCounsellorId, selectedDate, setValue]);

    const onSubmit = (data: any) => {
        if (!selectedDate) return;
        
        const start = dayjs(selectedDate)
            .hour(parseInt(data.time.split(':')[0]))
            .minute(parseInt(data.time.split(':')[1]))
            .second(0);
        
        const end = start.add(1, 'hour');
        
        const bookingData = {
            counsellorId: data.counsellorId,
            start: start.toISOString(),
            end: end.toISOString(),
            notes: data.notes,
        };
        
        createBookingMutation.mutate(bookingData, {
            onSuccess: () => {
                if(setDialogOpen) setDialogOpen(false);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label>Counsellor</Label>
                <Controller
                    name="counsellorId"
                    control={control}
                    rules={{ required: "Please select a counsellor" }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCounsellors}>
                            <SelectTrigger><SelectValue placeholder={isLoadingCounsellors ? "Loading..." : "Select a counsellor"} /></SelectTrigger>
                            <SelectContent>
                                {counsellors.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.name} - {c.specialization}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.counsellorId && <p className="text-sm text-destructive mt-1">{`${errors.counsellorId.message}`}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? dayjs(selectedDate).format('MMM D, YYYY') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || date > dayjs().add(1, 'month').toDate()} />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <Label>Time Slot</Label>
                    <Controller
                        name="time"
                        control={control}
                        rules={{ required: "Please select a time slot" }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDate || !selectedCounsellorId || isLoadingAvailability}>
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingAvailability ? "Loading..." : "Select time"} />
                                </SelectTrigger>
                                <SelectContent>
                                   {availableSlots && availableSlots.length > 0 ? (
                                       availableSlots.map((slot: string) => (
                                           <SelectItem key={slot} value={slot}>{dayjs().hour(parseInt(slot.split(':')[0])).minute(parseInt(slot.split(':')[1])).format('h:mm A')}</SelectItem>
                                       ))
                                   ) : (
                                       <SelectItem value="none" disabled>No slots available</SelectItem>
                                   )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.time && <p className="text-sm text-destructive mt-1">{`${errors.time.message}`}</p>}
                </div>
            </div>

            <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" {...register("notes")} placeholder="Anything you'd like the counsellor to know beforehand?"/>
            </div>
            
            <Button type="submit" className="w-full" disabled={createBookingMutation.isPending}>
                {createBookingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request Booking
            </Button>
        </form>
    );
}