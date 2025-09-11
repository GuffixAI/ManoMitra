// server/models/learningPathway.model.js
import mongoose from "mongoose";

const pathwayStepSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PsychoeducationalResource',
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['video', 'audio', 'article', 'document'], required: true },
  url: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { _id: false }); // Do not generate _id for subdocuments

const learningPathwaySchema = new mongoose.Schema(
  {
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Student',
      required: true,
      index: true
    },
    basedOnAIReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIReport',
      required: true,
      unique: true // Ensure only one pathway per AI report
    },
    title: { type: String, required: true }, // e.g., "A Pathway to Manage Exam Stress"
    steps: [pathwayStepSchema],
  },
  { timestamps: true }
);

export default mongoose.model("LearningPathway", learningPathwaySchema);