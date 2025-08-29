import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  getProfile,
  updateProfile,
  getDashboardData,
  getAvailableCounsellors,
  getAvailableVolunteers,
  connectCounsellor,
  disconnectCounsellor,
  connectVolunteer,
  disconnectVolunteer,
  getConnections,
  updatePreferences,
  updateLastActive
} from "../controllers/student.controller.js";

const router = express.Router();

// All routes require authentication and student role
router.use(protect, requireRole([ROLES.STUDENT]));

// Profile management
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Dashboard
router.get("/dashboard", getDashboardData);

// Available professionals
router.get("/counsellors", getAvailableCounsellors);
router.get("/volunteers", getAvailableVolunteers);

// Connection management
router.get("/connections", getConnections);
router.post("/counsellors/connect", connectCounsellor);
router.delete("/counsellors/:counsellorId", disconnectCounsellor);
router.post("/volunteers/connect", connectVolunteer);
router.delete("/volunteers/:volunteerId", disconnectVolunteer);

// Preferences and activity
router.put("/preferences", updatePreferences);
router.post("/activity", updateLastActive);

export default router;
