// FILE: server/controllers/aiReport.controller.js
import AIReport from '../models/aiReport.model.js';
import Student from '../models/student.model.js';
import axios from 'axios';
import { asyncHandler } from '../middlewares/error.middleware.js';
import Notification from '../models/notification.model.js';

// Ensure you have this in your .env or a config file
const AGENTIC_SERVER_URL = process.env.AGENTIC_SERVER_URL || 'http://localhost:8000';

// @desc    Student generates a new AI report
// @route   POST /api/ai-reports
export const createAIReport = asyncHandler(async (req, res) => {
    const { conversation_history } = req.body;
    const studentId = req.user.id;

    if (!conversation_history) {
        return res.status(400).json({ success: false, message: 'Conversation history is required.' });
    }

    // 1. Call the agentic server to get the report JSON
    const agentResponse = await axios.post(`${AGENTIC_SERVER_URL}/generate-report`, {
        conversation_history,
    });

    const { demo_report, standard_report } = agentResponse.data;

    if (!demo_report || !standard_report) {
        throw new Error('Invalid report structure from agentic server.');
    }

    // 2. Create the AIReport document, stringifying the content
    const newAIReport = await AIReport.create({
        student: studentId,
        demo_report: {
            demo_content: JSON.stringify(demo_report) // <-- Convert object to JSON string
        },
        standard_report: {
            standard_content: JSON.stringify(standard_report) // <-- Convert object to JSON string
        },
    });

    // 3. Link the new report to the student
    await Student.findByIdAndUpdate(studentId, {
        $push: { aiReports: newAIReport._id },
    });

    await Notification.create({
        recipient: studentId,
        recipientModel: 'Student',
        type: 'ai_report_ready',
        category: 'report',
        title: 'Your AI Wellness Report is Ready',
        message: "We've analyzed your conversation and prepared a personalized summary.",
        data: {
            aiReportId: newAIReport._id,
        },
        actionUrl: `/student/ai-reports/${newAIReport._id}`
    });

    res.status(201).json({
        success: true,
        message: 'AI report generated successfully.',
        data: newAIReport,
    });
});

// @desc    Student gets a list of their AI reports
// @route   GET /api/ai-reports/my
export const getMyAIReports = asyncHandler(async (req, res) => {
    const reports = await AIReport.find({ student: req.user.id })
        .sort({ createdAt: -1 })
        .select('_id createdAt'); // Select only necessary fields for the list view

    res.status(200).json({ success: true, data: reports });
});

// @desc    Student gets a single AI report by ID
// @route   GET /api/ai-reports/:id
export const getAIReportById = asyncHandler(async (req, res) => {
    const report = await AIReport.findOne({
        _id: req.params.id,
        student: req.user.id,
    });

    if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // The content will be sent as a string to the frontend
    res.status(200).json({ success: true, data: report });
});