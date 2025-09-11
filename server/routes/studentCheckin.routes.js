// server/routes/studentCheckin.routes.js
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { submitCheckin, getCheckinHistory } from "../controllers/studentCheckin.controller.js";

const router = express.Router();

// All routes are protected and for students only
router.use(protect, requireRole([ROLES.STUDENT]));

router.post("/", submitCheckin);
router.get("/history", getCheckinHistory);

export default router;