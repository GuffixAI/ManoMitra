// FILE: server/routes/admin.routes.js
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
  getUserById,
  createCounsellor,
  getProfile,
  updateProfile,
  createAdmin, 
} from "../controllers/admin.controller.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();
router.post("/users/create-admin", createAdmin);

// All subsequent routes require admin role
router.use(protect, requireRole([ROLES.ADMIN]));

// ADDED: Endpoint to create a new admin.
// This is protected and can only be accessed by an existing admin.

// Admin's own profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Dashboard and analytics
router.get("/dashboard/stats", getDashboardStats);
router.get("/analytics", getSystemAnalytics);

// User management
router.get("/users/students", getAllStudents);
router.post("/users/counsellors", createCounsellor);
router.get("/users/counsellors", getAllCounsellors);
router.get("/users/volunteers", getAllVolunteers);
router.get("/users/:userModel/:userId", getUserById);
router.patch("/users/status", updateUserStatus);

// Report management
router.get("/reports", getAllReports);
router.patch("/reports/assign", assignReport);

// Emergency access (requires special permission)
router.post("/emergency", emergencyAccess);

export default router;