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
  updateAvailabilityStatus
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
