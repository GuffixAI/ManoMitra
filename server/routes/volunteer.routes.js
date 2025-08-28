import express from "express";
import {
  registerVolunteer,
  getVolunteerRating,
} from "../controllers/volunteer.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public route
router.post("/register", registerVolunteer);

// Protected route
router.get("/rating", protect, getVolunteerRating);

export default router;
