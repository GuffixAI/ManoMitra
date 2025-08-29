import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  unarchiveNotification,
  deleteNotification,
  getPreferences,
  updatePreferences,
  getAdminUserNotifications,
  sendSystemNotification,
  getNotificationStats,
  cleanupExpiredNotifications
} from "../controllers/notification.controller.js";

const router = express.Router();

// User routes (all authenticated users)
router.use(protect);

// Get notifications
router.get("/", getUserNotifications);
router.get("/unread", getUnreadCount);
router.get("/preferences", getPreferences);

// Mark notifications
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);

// Archive/unarchive
router.put("/:id/archive", archiveNotification);
router.put("/:id/unarchive", unarchiveNotification);

// Delete
router.delete("/:id", deleteNotification);

// Update preferences
router.put("/preferences", updatePreferences);

// Admin routes
router.use("/admin", requireRole([ROLES.ADMIN]));

// Admin notification management
router.get("/admin/user/:userId/:userModel", getAdminUserNotifications);
router.post("/admin/system", sendSystemNotification);
router.get("/admin/stats", getNotificationStats);
router.post("/admin/cleanup", cleanupExpiredNotifications);

export default router;
