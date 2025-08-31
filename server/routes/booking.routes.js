import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getCounsellorBookings,
  getAvailableSlots,
  confirmBooking,
  rejectBooking,
  completeBooking,
  getBookingStats
} from "../controllers/booking.controller.js";

const router = express.Router();

// --- Student Routes ---
const studentRouter = express.Router();
studentRouter.use(protect, requireRole([ROLES.STUDENT]));
studentRouter.post("/", createBooking);
studentRouter.get("/", getMyBookings);
studentRouter.get("/:id", getBookingById);
studentRouter.delete("/:id", cancelBooking); // Corrected to DELETE
router.use("/student", studentRouter);

// --- Counsellor Routes ---
const counsellorRouter = express.Router();
counsellorRouter.use(protect, requireRole([ROLES.COUNSELLOR]));
counsellorRouter.get("/", getCounsellorBookings);
counsellorRouter.put("/:id/confirm", confirmBooking);
counsellorRouter.put("/:id/reject", rejectBooking);
counsellorRouter.put("/:id/complete", completeBooking);
router.use("/counsellor", counsellorRouter);

// --- Admin Routes ---
const adminRouter = express.Router();
adminRouter.use(protect, requireRole([ROLES.ADMIN]));
adminRouter.get("/stats", getBookingStats);
router.use("/admin", adminRouter);

// --- Public Routes ---
// For checking counsellor availability before booking
router.get("/slots/:counsellorId", getAvailableSlots);

export default router;