// server/routes/session.routes.js
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { 
    scheduleSession, 
    getUpcomingSessions, 
    rsvpToSession, 
    getMyScheduledSessions 
} from "../controllers/session.controller.js";

const router = express.Router();

// Publicly viewable upcoming sessions
router.get('/upcoming', protect, getUpcomingSessions);

// Student-specific actions
router.post('/:id/rsvp', protect, requireRole([ROLES.STUDENT]), rsvpToSession);

// Volunteer-specific actions
router.post('/', protect, requireRole([ROLES.VOLUNTEER]), scheduleSession);
router.get('/my', protect, requireRole([ROLES.VOLUNTEER]), getMyScheduledSessions);

export default router;