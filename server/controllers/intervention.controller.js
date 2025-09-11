// server/controllers/intervention.controller.js
import Intervention from '../models/intervention.model.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

// @desc    Admin creates a new intervention
// @route   POST /api/interventions
export const createIntervention = asyncHandler(async (req, res) => {
  const { name, description, startDate, endDate, targetAudience } = req.body;
  const adminId = req.user.id;

  const intervention = await Intervention.create({
    name, description, startDate, endDate, targetAudience, createdBy: adminId
  });

  res.status(201).json({ success: true, message: "Intervention created successfully.", data: intervention });
});

// @desc    Admin gets all interventions
// @route   GET /api/interventions
export const getAllInterventions = asyncHandler(async (req, res) => {
  const interventions = await Intervention.find().sort({ startDate: -1 });
  res.status(200).json({ success: true, data: interventions });
});

// @desc    Admin updates an intervention
// @route   PUT /api/interventions/:id
export const updateIntervention = asyncHandler(async (req, res) => {
  const { name, description, startDate, endDate, targetAudience } = req.body;
  const intervention = await Intervention.findByIdAndUpdate(
    req.params.id,
    { name, description, startDate, endDate, targetAudience },
    { new: true, runValidators: true }
  );

  if (!intervention) {
    return res.status(404).json({ success: false, message: "Intervention not found." });
  }

  res.status(200).json({ success: true, message: "Intervention updated successfully.", data: intervention });
});

// @desc    Admin deletes an intervention
// @route   DELETE /api/interventions/:id
export const deleteIntervention = asyncHandler(async (req, res) => {
  const intervention = await Intervention.findByIdAndDelete(req.params.id);

  if (!intervention) {
    return res.status(404).json({ success: false, message: "Intervention not found." });
  }

  res.status(200).json({ success: true, message: "Intervention deleted successfully." });
});