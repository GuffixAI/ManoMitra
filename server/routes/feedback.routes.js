import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { rateTarget, getPublicRating } from "../controllers/feedback.controller.js";

const router = express.Router();

router.post("/", protect, requireRole([ROLES.STUDENT]), rateTarget);
router.get("/", protect, getPublicRating); // anyone authenticated can see averages

export default router;
