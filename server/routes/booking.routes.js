import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  rescheduleBooking,
  getCounsellorBookings,
  getCounsellorSchedule,
  getAvailableSlots,
  confirmBooking,
  rejectBooking,
  completeBooking,
  getBookingStats
} from "../controllers/booking.controller.js";

const router = express.Router();

// Student routes
router.use("/student", protect, requireRole([ROLES.STUDENT]));
router.post("/student", createBooking);
router.get("/student", getMyBookings);
router.get("/student/:id", getBookingById);
router.put("/student/:id", updateBooking);
router.delete("/student/:id", cancelBooking);
router.put("/student/:id/reschedule", rescheduleBooking);

// Counsellor routes
router.use("/counsellor", protect, requireRole([ROLES.COUNSELLOR]));
router.get("/counsellor", getCounsellorBookings);
router.get("/counsellor/schedule", getCounsellorSchedule);
router.get("/counsellor/slots", getAvailableSlots);
router.put("/counsellor/:id/confirm", confirmBooking);
router.put("/counsellor/:id/reject", rejectBooking);
router.put("/counsellor/:id/complete", completeBooking);

// Public routes (for checking availability)
router.get("/slots/:counsellorId", getAvailableSlots);

// Admin routes
router.use("/admin", protect, requireRole([ROLES.ADMIN]));
router.get("/admin/stats", getBookingStats);

export default router;
