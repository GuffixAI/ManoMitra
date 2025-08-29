import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  createFeedback,
  getFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats,
  getTopRated
} from "../controllers/feedback.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student routes
router.post("/", requireRole([ROLES.STUDENT]), createFeedback);
router.get("/my", requireRole([ROLES.STUDENT]), getMyFeedback);
router.put("/:id", requireRole([ROLES.STUDENT]), updateFeedback);
router.delete("/:id", requireRole([ROLES.STUDENT]), deleteFeedback);

// Public routes (for viewing feedback)
router.get("/:targetType/:targetId", getFeedback);
router.get("/top-rated", getTopRated);

// Admin routes
router.get("/stats", requireRole([ROLES.ADMIN]), getFeedbackStats);

export default router;
