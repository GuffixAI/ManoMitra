import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { uploadReport } from "../middlewares/upload.middleware.js";
import { uploadMarkdownReport, listMyReports, getMyReport, deleteMyReport } from "../controllers/report.controller.js";

const router = express.Router();

router.post("/", protect, requireRole([ROLES.STUDENT]), uploadReport.single("file"), uploadMarkdownReport);
router.get("/", protect, requireRole([ROLES.STUDENT]), listMyReports);
router.get("/:id", protect, requireRole([ROLES.STUDENT]), getMyReport);
router.delete("/:id", protect, requireRole([ROLES.STUDENT]), deleteMyReport);

export default router;
