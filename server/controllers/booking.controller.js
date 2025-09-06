// FILE: server/controllers/booking.controller.js

import Booking from "../models/booking.model.js";
import Counsellor from "../models/counsellor.model.js";
import Notification from "../models/notification.model.js";
import dayjs from "dayjs";
import { asyncHandler } from "../middlewares/error.middleware.js";

// =================================
// STUDENT ROUTES
// =================================

// @desc    Student creates a new booking request
// @route   POST /api/bookings/student
export const createBooking = asyncHandler(async (req, res) => {
  const { counsellorId, start, end, mode, notes } = req.body;
  if (!counsellorId || !start || !end) {
    return res.status(400).json({ success: false, message: "counsellorId, start, and end are required" });
  }

  const startD = dayjs(start);
  const endD = dayjs(end);
  if (!startD.isValid() || !endD.isValid() || !endD.isAfter(startD)) {
    return res.status(400).json({ success: false, message: "Invalid start/end time" });
  }

  const counsellor = await Counsellor.findById(counsellorId);
  if (!counsellor || !counsellor.isActive) {
    return res.status(404).json({ success: false, message: "Counsellor not found or is inactive" });
  }

  const overlap = await Booking.overlaps(counsellorId, startD.toDate(), endD.toDate());
  if (overlap) {
    return res.status(409).json({ success: false, message: "Chosen slot is no longer available" });
  }

  const booking = await Booking.create({
    student: req.user.id,
    counsellor: counsellorId,
    start: startD.toDate(),
    end: endD.toDate(),
    mode,
    notes,
  });
  
  // Notify counsellor
  await Notification.create({
      recipient: counsellorId,
      recipientModel: 'Counsellor',
      sender: req.user.id,
      senderModel: 'Student',
      type: 'booking_request',
      category: 'booking', // BUG FIX: Added required category field
      title: 'New Booking Request',
      message: `You have a new booking request from a student for ${startD.format('MMM D, h:mm A')}.`,
      data: { bookingId: booking._id, studentId: req.user.id }
  });

  res.status(201).json({ success: true, message: "Booking request created successfully", data: booking });
});

// @desc    Student gets their own bookings
// @route   GET /api/bookings/student
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ student: req.user.id }).populate("counsellor", "name email specialization").sort({ start: -1 });
  res.status(200).json({ success: true, data: bookings });
});

// @desc    Student gets a single booking by ID
// @route   GET /api/bookings/student/:id
export const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findOne({ _id: id, student: req.user.id }).populate("counsellor", "name email specialization");
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.status(200).json({ success: true, data: booking });
});

// @desc    Student cancels their own booking
// @route   DELETE /api/bookings/student/:id
export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findOne({ _id: id, student: req.user.id });
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  if (!["pending", "approved"].includes(booking.status)) {
    return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });
  }
  booking.status = "cancelled";
  await booking.save();

  // Notify counsellor of cancellation
  await Notification.create({
      recipient: booking.counsellor,
      recipientModel: 'Counsellor',
      type: 'booking_cancelled',
      category: 'booking', // BUG FIX: Added required category field
      title: 'Booking Cancelled',
      message: `A student has cancelled the booking for ${dayjs(booking.start).format('MMM D, h:mm A')}.`,
      data: { bookingId: booking._id, studentId: booking.student }
  });

  res.status(200).json({ success: true, message: "Booking cancelled successfully", data: booking });
});


// =================================
// COUNSELLOR ROUTES
// =================================

// @desc    Counsellor gets all their bookings
// @route   GET /api/bookings/counsellor
export const getCounsellorBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ counsellor: req.user.id }).populate("student", "name email studentCode").sort({ start: -1 });
  res.status(200).json({ success: true, data: bookings });
});

// @desc    Counsellor confirms a booking
// @route   PUT /api/bookings/counsellor/:id/confirm
export const confirmBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, counsellor: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending bookings can be confirmed" });
    }
    booking.status = "approved";
    await booking.save();

    // Notify student of confirmation
    await Notification.create({
        recipient: booking.student,
        recipientModel: 'Student',
        type: 'booking_confirmed',
        category: 'booking', // BUG FIX: Added required category field
        title: 'Booking Confirmed',
        message: `Your booking with a counsellor for ${dayjs(booking.start).format('MMM D, h:mm A')} has been confirmed.`,
        data: { bookingId: booking._id, counsellorId: req.user.id }
    });

    res.status(200).json({ success: true, message: "Booking confirmed", data: booking });
});

// @desc    Counsellor rejects a booking
// @route   PUT /api/bookings/counsellor/:id/reject
export const rejectBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, counsellor: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending bookings can be rejected" });
    }
    booking.status = "rejected";
    await booking.save();

    // Notify student of rejection
    await Notification.create({
        recipient: booking.student,
        recipientModel: 'Student',
        type: 'booking_rejected',
        category: 'booking', // BUG FIX: Added required category field
        title: 'Booking Rejected',
        message: `Your booking request for ${dayjs(booking.start).format('MMM D, h:mm A')} has been rejected.`,
        data: { bookingId: booking._id, counsellorId: req.user.id }
    });

    res.status(200).json({ success: true, message: "Booking rejected", data: booking });
});

// @desc    Counsellor marks a booking as complete
// @route   PUT /api/bookings/counsellor/:id/complete
export const completeBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, counsellor: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "approved") {
      return res.status(400).json({ success: false, message: "Only approved bookings can be marked as completed" });
    }
    booking.status = "completed";
    await booking.save();
    res.status(200).json({ success: true, message: "Booking marked as completed", data: booking });
});


// =================================
// PUBLIC & SHARED ROUTES
// =================================

// @desc    Get available slots for a specific counsellor
// @route   GET /api/bookings/slots/:counsellorId
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { counsellorId } = req.params;
  const { date } = req.query; // Expects a date string like 'YYYY-MM-DD'
  
  if (!date) {
    return res.status(400).json({ success: false, message: "Date query parameter is required" });
  }

  const counsellor = await Counsellor.findById(counsellorId);
  if (!counsellor) {
    return res.status(404).json({ success: false, message: "Counsellor not found" });
  }

  const startOfDay = dayjs(date).startOf('day');
  const endOfDay = dayjs(date).endOf('day');
  
  // Find existing bookings for the given day
  const existingBookings = await Booking.find({
    counsellor: counsellorId,
    status: { $in: ["pending", "approved"] },
    start: { $gte: startOfDay.toDate(), $lt: endOfDay.toDate() }
  });

  const bookedSlots = existingBookings.map(b => dayjs(b.start).format('HH:mm'));

  // Find the counsellor's availability for the specified day of the week
  const dayOfWeek = startOfDay.format('dddd').toLowerCase();
  const dayAvailability = counsellor.availableTime.find(d => d.day === dayOfWeek);

  if (!dayAvailability || !dayAvailability.slots) {
    return res.status(200).json({ success: true, data: [] }); // No slots for this day
  }

  // Generate all possible slots and filter out the booked ones
  let availableSlots = [];
  for (const slot of dayAvailability.slots) {
    let current = dayjs(date).hour(parseInt(slot.start.split(':')[0])).minute(parseInt(slot.start.split(':')[1]));
    const end = dayjs(date).hour(parseInt(slot.end.split(':')[0])).minute(parseInt(slot.end.split(':')[1]));
    
    // Assuming 60-minute session durations
    while(current.isBefore(end)) {
        const timeStr = current.format('HH:mm');
        if (!bookedSlots.includes(timeStr)) {
            availableSlots.push(timeStr);
        }
        current = current.add(60, 'minutes');
    }
  }

  res.status(200).json({ success: true, data: availableSlots });
});


// =================================
// ADMIN ROUTES
// =================================

// @desc    Admin gets booking statistics
// @route   GET /api/bookings/admin/stats
export const getBookingStats = asyncHandler(async (req, res) => {
  const total = await Booking.countDocuments();
  const completed = await Booking.countDocuments({ status: "completed" });
  const pending = await Booking.countDocuments({ status: "pending" });
  const cancelled = await Booking.countDocuments({ status: "cancelled" });
  const approved = await Booking.countDocuments({ status: "approved" });

  res.status(200).json({
    success: true,
    data: { total, completed, pending, cancelled, approved }
  });
});