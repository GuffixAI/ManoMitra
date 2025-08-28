import express from "express";
import {
  registerCounsellor,
  setAvailability,
  getCounsellorRating,
  getAvailability,
} from "../controllers/counsellor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public route for counsellor registration
router.post("/register", registerCounsellor);

router.get("/:counsellorId/availability", getAvailability);

// Protected routes
router.put("/availability", protect, setAvailability);
router.get("/rating", protect, getCounsellorRating);

export default router;
