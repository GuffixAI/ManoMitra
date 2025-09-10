// server/models/psychoeducationalResource.model.js
import mongoose from "mongoose";

const psychoeducationalResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    url: { 
      type: String, 
      trim: true, 
      // Basic URL validation, refine if needed
      match: /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i, 
      // Only required if type is not 'document' or if no file is uploaded
      required: function() { return !this.file; } 
    },
    file: { // For uploaded documents/audio/video files
      filename: String,      // Name on disk (e.g., 1678912345_abc.pdf)
      originalName: String,  // Original name provided by user
      mimeType: String,      // e.g., application/pdf, audio/mp3
      size: Number,          // File size in bytes
      url: String,           // Public URL to access the uploaded file
    },
    type: {
      type: String,
      enum: ["video", "audio", "article", "document"], // Match UI options
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ["en", "hi", "bn", "ta", "te", "mr", "gu", "pa"], // Extend as needed
      required: true,
      index: true,
    },
    category: [{ type: String, trim: true }], // e.g., ["anxiety", "stress", "mindfulness"]
    isApproved: { type: Boolean, default: true }, // For future moderation if needed
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

export default mongoose.model("PsychoeducationalResource", psychoeducationalResourceSchema);