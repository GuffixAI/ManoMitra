// Student: update booking details
export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mode, notes } = req.body;
    const booking = await Booking.findOne({ _id: id, student: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (mode) booking.mode = mode;
    if (notes) booking.notes = notes;
    await booking.save();
    res.status(200).json({ success: true, message: "Booking updated", data: booking });
  } catch (err) {
    next(err);
  }
};
// Student: reschedule booking
export const rescheduleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start, end } = req.body;
    if (!start || !end) {
      return res.status(400).json({ success: false, message: "Start and end time required" });
    }
    const booking = await Booking.findOne({ _id: id, student: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "pending" && booking.status !== "approved") {
      return res.status(400).json({ success: false, message: "Only pending or approved bookings can be rescheduled" });
    }
    // Check slot overlap with other bookings
    const overlap = await Booking.overlaps(booking.counsellor, new Date(start), new Date(end));
    if (overlap) return res.status(409).json({ success: false, message: "Chosen slot overlaps with an existing booking" });
    booking.start = new Date(start);
    booking.end = new Date(end);
    await booking.save();
    res.status(200).json({ success: true, message: "Booking rescheduled", data: booking });
  } catch (err) {
    next(err);
  }
};
// Counsellor: reject booking
export const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, counsellor: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending bookings can be rejected" });
    }
    booking.status = "rejected";
    await booking.save();
    res.status(200).json({ success: true, message: "Booking rejected", data: booking });
  } catch (err) {
    next(err);
  }
};
// Counsellor: get schedule (availableTime)
export const getCounsellorSchedule = async (req, res, next) => {
  try {
    const counsellorId = req.user.id;
    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor) return res.status(404).json({ success: false, message: "Counsellor not found" });
    res.status(200).json({ success: true, schedule: counsellor.availableTime || [] });
  } catch (err) {
    next(err);
  }
};
// Counsellor: get all bookings
export const getCounsellorBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ counsellor: req.user.id }).populate("student", "name email");
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};
// Admin: get booking statistics
export const getBookingStats = async (req, res, next) => {
  try {
    // Example stats: total bookings, completed, pending, cancelled
    const total = await Booking.countDocuments();
    const completed = await Booking.countDocuments({ status: "completed" });
    const pending = await Booking.countDocuments({ status: "pending" });
    const cancelled = await Booking.countDocuments({ status: "cancelled" });
    const approved = await Booking.countDocuments({ status: "approved" });
    res.status(200).json({ success: true, stats: { total, completed, pending, cancelled, approved } });
  } catch (err) {
    next(err);
  }
};
// Student: get booking by ID
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, student: req.user.id }).populate("counsellor", "name email specialization");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};
// Get available slots for a counsellor
export const getAvailableSlots = async (req, res, next) => {
  try {
    const counsellorId = req.params.counsellorId || req.user.id;
    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor) return res.status(404).json({ success: false, message: "Counsellor not found" });

    // Example: Return all availableTime slots minus booked slots
    // You may want to enhance this logic for your app
    const bookings = await Booking.find({ counsellor: counsellorId, status: { $in: ["pending", "approved"] } });
    const bookedSlots = bookings.map(b => ({ start: b.start, end: b.end }));

    // Filter out booked slots from counsellor.availableTime
    // This is a placeholder; you should adapt to your slot structure
    const availableSlots = (counsellor.availableTime || []).map(day => {
      const slots = (day.slots || []).filter(slot => {
        // Check if slot overlaps with any booked slot
        return !bookedSlots.some(booked => {
          const slotStart = new Date(slot.start);
          const slotEnd = new Date(slot.end);
          return (
            (slotStart < booked.end && slotEnd > booked.start)
          );
        });
      });
      return { day: day.day, slots };
    });

    res.status(200).json({ success: true, availableSlots });
  } catch (err) {
    next(err);
  }
};
// Counsellor: confirm booking
export const confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, counsellor: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending bookings can be confirmed" });
    }
    booking.status = "approved";
    await booking.save();
    res.status(200).json({ success: true, message: "Booking confirmed", data: booking });
  } catch (err) {
    next(err);
  }
};
// Counsellor: mark booking as completed
export const completeBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, counsellor: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "approved") {
      return res.status(400).json({ success: false, message: "Only approved bookings can be completed" });
    }
    booking.status = "completed";
    await booking.save();
    res.status(200).json({ success: true, message: "Booking marked as completed", data: booking });
  } catch (err) {
    next(err);
  }
};
import Booking from "../models/booking.model.js";
import Counsellor from "../models/counsellor.model.js";
import dayjs from "dayjs";

// Student: create booking request
export const createBooking = async (req, res, next) => {
  try {
    const { counsellorId, start, end, mode, notes } = req.body;
    if (!counsellorId || !start || !end) {
      return res.status(400).json({ success:false, message:"counsellorId, start, end are required" });
    }

    const startD = dayjs(start); const endD = dayjs(end);
    if (!startD.isValid() || !endD.isValid() || !endD.isAfter(startD)) {
      return res.status(400).json({ success:false, message:"Invalid start/end time" });
    }

    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor) return res.status(404).json({ success:false, message:"Counsellor not found" });

    // Check slot overlap with other bookings
    const overlap = await Booking.overlaps(counsellorId, startD.toDate(), endD.toDate());
    if (overlap) return res.status(409).json({ success:false, message:"Chosen slot overlaps with an existing booking" });

    const booking = await Booking.create({
      student: req.user.id,
      counsellor: counsellorId,
      start: startD.toDate(),
      end: endD.toDate(),
      mode,
      notes,
    });

    res.status(201).json({ success:true, message:"Booking request created", data: booking });
  } catch (err) { next(err); }
};

// Student: list my bookings
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ student: req.user.id }).populate("counsellor","name email specialization");
    res.status(200).json({ success:true, data: bookings });
  } catch (err) { next(err); }
};

// Student: cancel my booking (pending/approved only)
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id:id, student: req.user.id });
    if (!booking) return res.status(404).json({ success:false, message:"Booking not found" });
    if (!["pending","approved"].includes(booking.status)) {
      return res.status(400).json({ success:false, message:`Cannot cancel a ${booking.status} booking` });
    }
    booking.status = "cancelled";
    await booking.save();
    res.status(200).json({ success:true, message:"Booking cancelled", data:booking });
  } catch (err) { next(err); }
};

// Counsellor: list incoming booking requests
export const incomingBookings = async (req, res, next) => {
  try {
    const data = await Booking.find({ counsellor: req.user.id, status: { $in:["pending","approved"] } })
      .populate("student","name email");
    res.status(200).json({ success:true, data });
  } catch (err) { next(err); }
};

// Counsellor: approve/reject
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'
    const booking = await Booking.findOne({ _id:id, counsellor: req.user.id });
    if (!booking) return res.status(404).json({ success:false, message:"Booking not found" });

    if (action === "approve") booking.status = "approved";
    else if (action === "reject") booking.status = "rejected";
    else return res.status(400).json({ success:false, message:"Invalid action" });

    await booking.save();
    res.status(200).json({ success:true, message:`Booking ${booking.status}`, data: booking });
  } catch (err) { next(err); }
};
