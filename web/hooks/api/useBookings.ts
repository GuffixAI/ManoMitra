// web/hooks/api/useBookings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingAPI } from "@/lib/api";
import { toast } from "sonner";

// For Students: Get my bookings
export const useMyBookings = () => {
  return useQuery({
    queryKey: ["myBookings"],
    queryFn: () => bookingAPI.getMyBookings(),
  });
};

// For Students: Get a single booking by ID
export const useBookingById = (id: string) => {
    return useQuery({
        queryKey: ['booking', id],
        queryFn: () => bookingAPI.getBookingById(id),
        enabled: !!id,
    });
};

// For Students: Create a booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newBooking: any) => bookingAPI.createBooking(newBooking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["counsellorSlots"] });
      toast.success("Booking request sent successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create booking.");
    },
  });
};

// For Students: Cancel a booking
export const useCancelBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (bookingId: string) => bookingAPI.cancelBooking(bookingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myBookings"] });
            queryClient.invalidateQueries({ queryKey: ["incomingBookings"] });
            toast.success("Booking cancelled.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to cancel booking.");
        }
    });
};

// For Counsellors: Get incoming bookings
export const useIncomingBookings = () => {
  return useQuery({
    queryKey: ["incomingBookings"],
    queryFn: () => bookingAPI.getCounsellorBookings(),
  });
};

// For Counsellors: Update booking status
export const useUpdateBookingStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ bookingId, action }: { bookingId: string, action: 'confirm' | 'reject' | 'complete' }) => {
            if (action === 'confirm') return bookingAPI.confirmBooking(bookingId);
            if (action === 'reject') return bookingAPI.rejectBooking(bookingId);
            return bookingAPI.completeBooking(bookingId);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["incomingBookings"] });
            queryClient.invalidateQueries({ queryKey: ["myBookings"] });
            toast.success(`Booking ${variables.action}ed successfully!`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update status.");
        }
    });
};

// For Admins: Get booking statistics
export const useAdminBookingStats = () => {
    return useQuery({
        queryKey: ['adminBookingStats'],
        queryFn: () => bookingAPI.getAdminStats(),
    });
};