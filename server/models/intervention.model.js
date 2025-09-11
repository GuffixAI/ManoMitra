// server/models/intervention.model.js
import mongoose from "mongoose";

const interventionSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200 
    },
    description: { 
      type: String,
      maxlength: 1000
    },
    startDate: { 
      type: Date, 
      required: true,
      index: true
    },
    endDate: { 
      type: Date, 
      required: true,
      index: true
    },
    targetAudience: { 
      type: String,
      default: "All Students"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Intervention", interventionSchema);