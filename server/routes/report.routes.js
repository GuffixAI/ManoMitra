// FILE: server/routes/report.routes.js

import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  deleteReport,
  getAssignedReports,
  updateReportStatus,
  getReportDetails,
  getUrgentReports,
  getReportsByStatus
} from "../controllers/report.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student routes
router.post("/", requireRole([ROLES.STUDENT]), createReport);
router.get("/my", requireRole([ROLES.STUDENT]), getMyReports);
router.get("/my/:id", requireRole([ROLES.STUDENT]), getReportById);
router.put("/my/:id", requireRole([ROLES.STUDENT]), updateReport);
router.delete("/my/:id", requireRole([ROLES.STUDENT]), deleteReport);

// Counsellor routes
router.get("/assigned", requireRole([ROLES.COUNSELLOR]), getAssignedReports);
router.get("/assigned/:id", requireRole([ROLES.COUNSELLOR]), getReportDetails);
router.patch("/assigned/:id/status", requireRole([ROLES.COUNSELLOR]), updateReportStatus);

// Admin and counsellor routes
router.get("/urgent", requireRole([ROLES.ADMIN, ROLES.COUNSELLOR]), getUrgentReports);
router.get("/status", requireRole([ROLES.ADMIN, ROLES.COUNSELLOR]), getReportsByStatus);

export default router;