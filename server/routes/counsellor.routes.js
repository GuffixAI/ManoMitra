import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  getProfile,
  updateProfile,
  getMyStudents,
  getSchedule,
  updateAvailability,
  getMyReports,
  getPerformanceMetrics,
  addStudent,
  removeStudent,
  getDashboardData,
  getAvailabilityById
} from "../controllers/counsellor.controller.js";

const router = express.Router();

// This route is public for students to see availability before booking
router.get("/:id/availability", getAvailabilityById);

// All subsequent routes require authentication and counsellor role
router.use(protect, requireRole([ROLES.COUNSELLOR]));

// Profile management
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Student management
router.get("/students", getMyStudents);
router.post("/students", addStudent);
router.delete("/students/:studentId", removeStudent);

// Schedule and availability
router.get("/schedule", getSchedule);
router.put("/availability", updateAvailability);

// Reports
router.get("/reports", getMyReports);

// Performance and analytics
router.get("/performance", getPerformanceMetrics);
router.get("/dashboard", getDashboardData);

export default router;