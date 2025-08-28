import mongoose from "mongoose";
import dayjs from "dayjs";

const bookingSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    counsellor: { type: mongoose.Schema.Types.ObjectId, ref: "Counsellor", required: true, index: true },
    start: { type: Date, required: true },
    end:   { type: Date, required: true },
    mode:  { type: String, enum: ["in_person", "video"], default: "in_person" },
    status:{ type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending", index: true },
    notes: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

// Helper to check overlap
bookingSchema.statics.overlaps = async function (counsellorId, start, end) {
  return this.exists({
    counsellor: counsellorId,
    status: { $in: ["pending", "approved"] },
    $or: [
      { start: { $lt: end }, end: { $gt: start } }, // any overlap
    ],
  });
};

export default mongoose.model("Booking", bookingSchema);
