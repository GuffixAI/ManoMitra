import express from "express";
import {
  registerStudent,
  loginStudent,
  updateStudentProfile,
  connectCounsellor,
  connectVolunteer,
} from "../controllers/student.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerStudent);
router.post("/login", loginStudent);

// Protected routes
router.put("/profile", protect, updateStudentProfile);
router.post("/connect/counsellor", protect, connectCounsellor);
router.post("/connect/volunteer", protect, connectVolunteer);

export default router;
