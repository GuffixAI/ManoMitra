// server/controllers/learningPathway.controller.js
import LearningPathway from '../models/learningPathway.model.js';
import AIReport from '../models/aiReport.model.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import axios from 'axios';

// Get this from your .env file
const AGENTIC_SERVER_URL = process.env.AGENTIC_SERVER_URL || 'http://localhost:8000';

// @desc    Student generates a new learning pathway based on an AI report
// @route   POST /api/pathways/generate
// @desc    Student generates a new learning pathway based on an AI report
// @route   POST /api/pathways/generate
export const generatePathway = asyncHandler(async (req, res) => {
    const { aiReportId } = req.body;
    const studentId = req.user.id;
    
    try {
    if (!aiReportId) {
        return res.status(400).json({ success: false, message: "AI Report ID is required." });
    }

    // 1. Verify the student owns the report
    const report = await AIReport.findOne({ _id: aiReportId, student: studentId });
    if (!report) {
        return res.status(404).json({ success: false, message: "AI Report not found or you do not have permission." });
    }

    // 2. Check if a pathway already exists for this report
    const existingPathway = await LearningPathway.findOne({ basedOnAIReport: aiReportId });
    if (existingPathway) {
        // Return the existing pathway instead of an error
        return res.status(200).json({ success: true, message: "Learning pathway already exists.", data: existingPathway });
    }

    // 3. Parse the standard_report content to extract key info
    let standardReportContent;
        standardReportContent = JSON.parse(report.standard_report.standard_content);
        console.log(standardReportContent)
    

    const key_stressors = standardReportContent.analytics?.key_stressors_identified || [];
    // The topics are nested inside 'summary' in the new report structure
    const suggested_resource_topics = standardReportContent?.risk_assessment?.red_flags || [];
    
    if (suggested_resource_topics.length === 0) {
         return res.status(400).json({ success: false, message: "No suggested topics found in the report to generate a pathway." });
    }

    // 4. Call the agentic server to get the pathway JSON
    const agentResponse = await axios.post(`${AGENTIC_SERVER_URL}/generate-pathway`, {
        key_stressors: key_stressors,
        suggested_resource_topics: suggested_resource_topics,
        student_language: 'en', // TODO: Get this from student profile later
    });

    const pathwayData = agentResponse.data;

    if (!pathwayData || !pathwayData.title || !pathwayData.steps) {
        throw new Error('Invalid pathway structure from agentic server.');
    }

    // 5. Create the LearningPathway document in the database
    // Ensure the resource ID is a valid ObjectId
    const validatedSteps = pathwayData.steps.map(step => ({
        ...step,
        resource: new mongoose.Types.ObjectId(step.resource)
    }));

    const newPathway = await LearningPathway.create({
        student: studentId,
        basedOnAIReport: aiReportId,
        title: pathwayData.title,
        steps: validatedSteps,
    });

    res.status(201).json({ success: true, message: "Learning pathway generated successfully.", data: newPathway });

    } catch (e) {
        return res.status(500).json({ success: false, message: `Could not parse AI report data: ${e.message}` });
    }
});

// @desc    Student gets all their generated learning pathways
// @route   GET /api/pathways/my
export const getMyPathways = asyncHandler(async (req, res) => {
    const pathways = await LearningPathway.find({ student: req.user.id })
        .populate('basedOnAIReport', 'createdAt')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: pathways });
});

// @desc    Student marks a step in a pathway as complete
// @route   PATCH /api/pathways/:pathwayId/steps/:resourceId/complete
export const markStepComplete = asyncHandler(async (req, res) => {
    const { pathwayId, resourceId } = req.params;
    const studentId = req.user.id;

    const pathway = await LearningPathway.findOne({ _id: pathwayId, student: studentId });

    if (!pathway) {
        return res.status(404).json({ success: false, message: "Learning pathway not found." });
    }

    const stepIndex = pathway.steps.findIndex(step => step.resource.toString() === resourceId);

    if (stepIndex === -1) {
        return res.status(404).json({ success: false, message: "Step not found in this pathway." });
    }
    
    pathway.steps[stepIndex].completed = true;
    pathway.steps[stepIndex].completedAt = new Date();

    await pathway.save();

    res.status(200).json({ success: true, message: "Step marked as complete.", data: pathway });
});