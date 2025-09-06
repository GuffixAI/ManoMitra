// FILE: server/routes/room.routes.js
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  getAllRooms,
  getRoomByTopic,
  getRoomMessages,
  getRoomStats,
  addModerator,
  removeModerator,
  updateRoomDescription,
  getRoomActivity,
  createRoom
} from "../controllers/room.controller.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllRooms);
router.get("/:topic", getRoomByTopic);
router.get("/:topic/messages", getRoomMessages);
router.get("/:topic/stats", getRoomStats);
router.get("/:topic/activity", getRoomActivity);

// Admin routes (require authentication and admin role)
router.post("/", protect, requireRole([ROLES.ADMIN]), createRoom);
router.post("/moderators", protect, requireRole([ROLES.ADMIN]), addModerator);
router.delete("/:topic/moderators/:volunteerId", protect, requireRole([ROLES.ADMIN]), removeModerator);
router.put("/:topic/description", protect, requireRole([ROLES.ADMIN]), updateRoomDescription);

export default router;