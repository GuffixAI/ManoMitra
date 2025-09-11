// server/controllers/session.controller.js
import ScheduledSession from '../models/scheduledSession.model.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

// @desc    Volunteer schedules a new session
// @route   POST /api/sessions
export const scheduleSession = asyncHandler(async (req, res) => {
    const { topic, description, scheduledTime, durationMinutes } = req.body;
    const volunteerId = req.user.id;

    const session = await ScheduledSession.create({
        topic, description, scheduledTime, durationMinutes, volunteerModerator: volunteerId
    });
    res.status(201).json({ success: true, message: "Session scheduled successfully.", data: session });
});

// @desc    Get upcoming sessions for students
// @route   GET /api/sessions/upcoming
export const getUpcomingSessions = asyncHandler(async (req, res) => {
    const sessions = await ScheduledSession.find({ scheduledTime: { $gte: new Date() }, status: 'scheduled' })
        .populate('volunteerModerator', 'name')
        .sort({ scheduledTime: 1 });
    res.status(200).json({ success: true, data: sessions });
});

// @desc    Student RSVPs to a session
// @route   POST /api/sessions/:id/rsvp
export const rsvpToSession = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const session = await ScheduledSession.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { attendees: studentId } }, // $addToSet prevents duplicates
        { new: true }
    );
    if (!session) {
        return res.status(404).json({ success: false, message: "Session not found." });
    }
    res.status(200).json({ success: true, message: "RSVP successful.", data: session });
});

// @desc    Volunteer gets their scheduled sessions
// @route   GET /api/sessions/my
export const getMyScheduledSessions = asyncHandler(async (req, res) => {
    const sessions = await ScheduledSession.find({ volunteerModerator: req.user.id })
        .populate('attendees', 'name')
        .sort({ scheduledTime: -1 });
    res.status(200).json({ success: true, data: sessions });
});