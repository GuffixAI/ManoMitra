import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true }, // local path (or S3 key in prod)
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
