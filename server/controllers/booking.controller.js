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
export const myBookings = async (req, res, next) => {
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
