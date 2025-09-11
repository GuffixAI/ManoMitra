// server/controllers/studentCheckin.controller.js
import StudentCheckin from '../models/studentCheckin.model.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

// @desc    Student submits a new check-in
// @route   POST /api/checkins
export const submitCheckin = asyncHandler(async (req, res) => {
  const { moodScore, stressLevel, openEndedFeedback } = req.body;
  const studentId = req.user.id;

  if (!moodScore || !stressLevel) {
    return res.status(400).json({ success: false, message: "Mood score and stress level are required." });
  }

  const checkin = await StudentCheckin.create({
    student: studentId,
    moodScore,
    stressLevel,
    openEndedFeedback
  });

  res.status(201).json({ success: true, message: "Check-in recorded successfully.", data: checkin });
});

// @desc    Student gets their check-in history for wellness trends
// @route   GET /api/checkins/history
export const getCheckinHistory = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  // Fetch check-ins from the last 90 days for trend analysis
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const history = await StudentCheckin.find({
    student: studentId,
    createdAt: { $gte: ninetyDaysAgo }
  }).sort({ createdAt: 'asc' });

  res.status(200).json({ success: true, data: history });
});