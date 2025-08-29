import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  getDashboardStats,
  getAllStudents,
  getAllCounsellors,
  getAllVolunteers,
  getAllReports,
  assignReport,
  updateUserStatus,
  getSystemAnalytics,
  emergencyAccess,
  getUserById
} from "../controllers/admin.controller.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// All routes require admin role
router.use(protect, requireRole([ROLES.ADMIN]));

// Dashboard and analytics
router.get("/dashboard/stats", getDashboardStats);
router.get("/analytics", getSystemAnalytics);

// User management
router.get("/users/students", getAllStudents);
router.get("/users/counsellors", getAllCounsellors);
router.get("/users/volunteers", getAllVolunteers);
router.get("/users/:userType/:userId", getUserById);
router.patch("/users/status", updateUserStatus);

// Report management
router.get("/reports", getAllReports);
router.patch("/reports/assign", assignReport);

// Emergency access (requires special permission)
router.post("/emergency", emergencyAccess);

export default router;
