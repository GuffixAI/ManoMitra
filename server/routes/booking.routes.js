import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { sanitizeRequest } from "../middlewares/sanitize.middleware.js";
import {
  createBooking,
  myBookings,
  cancelBooking,
  incomingBookings,
  updateBookingStatus,
} from "../controllers/booking.controller.js";

const router = express.Router();

// Students
router.post("/", protect, requireRole([ROLES.STUDENT]), sanitizeRequest, createBooking);
router.get("/me", protect, requireRole([ROLES.STUDENT]), myBookings);
router.patch("/:id/cancel", protect, requireRole([ROLES.STUDENT]), cancelBooking);

// Counsellors
router.get("/incoming", protect, requireRole([ROLES.COUNSELLOR]), incomingBookings);
router.patch("/:id/status", protect, requireRole([ROLES.COUNSELLOR]), updateBookingStatus);

export default router;
