// FILE: server/routes/report.routes.js

import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
// No longer need upload middleware
import { createMarkdownReport, listMyReports, getMyReport, deleteMyReport } from "../controllers/report.controller.js";
import { sanitizeRequest } from "../middlewares/sanitize.middleware.js"; // Important for security

const router = express.Router();

// The POST route now accepts JSON. Sanitize the content.
router.post("/", protect, requireRole([ROLES.STUDENT]), sanitizeRequest, createMarkdownReport);
router.get("/", protect, requireRole([ROLES.STUDENT]), listMyReports);
router.get("/:id", protect, requireRole([ROLES.STUDENT]), getMyReport);
router.delete("/:id", protect, requireRole([ROLES.STUDENT]), deleteMyReport);

export default router;