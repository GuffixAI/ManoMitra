// server/routes/learningPathway.routes.js
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  generatePathway,
  getMyPathways,
  markStepComplete
} from "../controllers/learningPathway.controller.js";

const router = express.Router();

// All routes are protected and for students only
router.use(protect, requireRole([ROLES.STUDENT]));

router.post("/generate", generatePathway);
router.get("/my", getMyPathways);
router.patch("/:pathwayId/steps/:resourceId/complete", markStepComplete);

export default router;