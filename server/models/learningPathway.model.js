// server/models/learningPathway.model.js
import mongoose from "mongoose";

const pathwayStepSchema = new mongoose.Schema({
  resource: {
    type: String, // changed from ObjectId → String
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['video', 'audio', 'article', 'document', 'meditation',"exercise"], // added meditation
  },
  url: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { _id: false });


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
      unique: true
    },
    title: { type: String, required: true }, 
    steps: [pathwayStepSchema],
  },
  { timestamps: true }
);

export default mongoose.model("LearningPathway", learningPathwaySchema);