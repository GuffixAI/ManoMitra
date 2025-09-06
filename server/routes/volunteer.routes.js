// FILE: server/routes/volunteer.routes.js
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  getProfile,
  updateProfile,
  getDashboardData,
  getPerformanceMetrics,
  getModeratedRooms,
  getMessageHistory,
  updateLastActive,
  completeTraining,
  getMyFeedback,
  getAvailabilityStatus,
  updateAvailabilityStatus,
  getConnectedStudents, // 1. Import the new function
} from "../controllers/volunteer.controller.js";

const router = express.Router();

// All routes require authentication and volunteer role
router.use(protect, requireRole([ROLES.VOLUNTEER]));

// Profile management
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Dashboard and analytics
router.get("/dashboard", getDashboardData);
router.get("/performance", getPerformanceMetrics);

// ** 2. Add the new route here **
router.get("/students", getConnectedStudents);

// Room management
router.get("/rooms", getModeratedRooms);

// Message history
router.get("/messages", getMessageHistory);

// Training and availability
router.post("/training/complete", completeTraining);
router.get("/availability", getAvailabilityStatus);
router.put("/availability", updateAvailabilityStatus);

// Activity tracking
router.post("/activity", updateLastActive);

// Feedback
router.get("/feedback", getMyFeedback);

export default router;