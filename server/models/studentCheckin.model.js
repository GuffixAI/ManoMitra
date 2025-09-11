// server/models/studentCheckin.model.js
import mongoose from "mongoose";

const studentCheckinSchema = new mongoose.Schema(
  {
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Student',
      required: true,
      index: true
    },
    moodScore: { 
      type: Number, 
      min: 1, // 1 = Very Bad
      max: 5, // 5 = Very Good
      required: true 
    },
    stressLevel: { 
      type: Number, 
      min: 1, // 1 = Very Low
      max: 5, // 5 = Very High
      required: true 
    },
    openEndedFeedback: { 
      type: String,
      maxlength: 500
    },
  },
  { timestamps: true }
);

export default mongoose.model("StudentCheckin", studentCheckinSchema);