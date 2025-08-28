import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { createRoom, listRooms, addModerator, removeModerator } from "../controllers/room.controller.js";

const router = express.Router();

// Any authenticated user can list rooms
router.get("/", protect, listRooms);

// Admin only can create rooms and manage moderators
router.post("/", protect, requireRole([ROLES.ADMIN]), createRoom);
router.post("/:roomId/moderators", protect, requireRole([ROLES.ADMIN]), addModerator);
router.delete("/:roomId/moderators", protect, requireRole([ROLES.ADMIN]), removeModerator);

export default router;
