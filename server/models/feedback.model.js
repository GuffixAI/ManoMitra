// server/models/feedback.model.js
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    rater: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    targetType: { type: String, enum: ["Counsellor","Volunteer"], required: true, index: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, refPath: 'targetType' },
    raterHash: { type: String, required: true, index: true, unique: true },
    rating: { type: Number, min:1, max:5, required: true },
    comment: { type: String, maxlength: 600 },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);