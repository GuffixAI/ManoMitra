
// hooks/api/useBookings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";

// For Students: Get my bookings
export const useMyBookings = () => {
  return useQuery({
    queryKey: ["myBookings"],
    queryFn: () => api.get("/bookings/me").then((res) => res.data.data),
  });
};

// For Students: Create a booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newBooking: any) => api.post("/bookings", newBooking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
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
        mutationFn: (bookingId: string) => api.patch(`/bookings/${bookingId}/cancel`),
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
    queryFn: () => api.get("/bookings/incoming").then((res) => res.data.data),
  });
};

// For Counsellors: Update booking status
export const useUpdateBookingStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ bookingId, action }: { bookingId: string, action: 'approve' | 'reject' }) => 
            api.patch(`/bookings/${bookingId}/status`, { action }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["incomingBookings"] });
            toast.success(`Booking ${data.data.data.status}!`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update status.");
        }
    });
};