// FILE: server/routes/aiReport.routes.js
import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { ROLES } from '../constants/roles.js';
import {
    createAIReport,
    getMyAIReports,
    getAIReportById
} from '../controllers/aiReport.controller.js';

const router = express.Router();

// All routes are protected and for students only.
// This ensures that only a logged-in student can generate or view their own reports.
router.use(protect, requireRole([ROLES.STUDENT]));

// POST /api/ai-reports
// Generates a new AI report from a conversation history.
router.post('/', createAIReport);

// GET /api/ai-reports/my
// Retrieves a list of the current student's AI reports.
router.get('/my', getMyAIReports);

// GET /api/ai-reports/:id
// Retrieves a single, specific AI report by its ID.
router.get('/:id', getAIReportById);

export default router;