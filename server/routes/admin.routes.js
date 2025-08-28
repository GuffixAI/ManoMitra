import express from "express";
import {
  loginAdmin,
  appointCounsellor,
  appointVolunteer,
    listCounsellors,
  listVolunteers,
} from "../controllers/admin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Admin login route
router.post("/login", loginAdmin);
router.post("/appoint/counsellor", protect, appointCounsellor);
router.post("/appoint/volunteer", protect, appointVolunteer);

// Protected routes for admin only
router.post("/appoint/counsellor", protect, appointCounsellor);
router.post("/appoint/volunteer", protect, appointVolunteer);

router.get("/counsellors", protect, listCounsellors);
router.get("/volunteers", protect, listVolunteers);

export default router;
