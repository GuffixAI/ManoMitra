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
  getDashboard, // **FIX:** Renamed from getDashboardData
  getAvailabilityById
} from "../controllers/counsellor.controller.js";

const router = express.Router();

const counsellorOnly = [protect, requireRole([ROLES.COUNSELLOR])];

// This route is public for students to see availability before booking
router.get("/:id/availability", getAvailabilityById);

// Profile management
router.get("/profile", counsellorOnly, getProfile);
router.put("/profile", counsellorOnly, updateProfile);

// Student management
router.get("/students", counsellorOnly, getMyStudents);
router.post("/students", counsellorOnly, addStudent);
router.delete("/students/:studentId", counsellorOnly, removeStudent);

// Schedule and availability
router.get("/schedule", counsellorOnly, getSchedule);
router.put("/availability", counsellorOnly, updateAvailability);

// Reports
router.get("/reports", counsellorOnly, getMyReports);

// Performance and analytics
router.get("/performance", counsellorOnly, getPerformanceMetrics);
router.get("/dashboard", counsellorOnly, getDashboard); // **FIX:** Renamed from getDashboardData

export default router;