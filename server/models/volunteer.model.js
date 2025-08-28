import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles.js";

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    description: { type: String },
    feedback: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    role: { type: String, default: ROLES.VOLUNTEER },
  },
  { timestamps: true }
);

volunteerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

volunteerSchema.methods.getAverageRating = function () {
  if (this.feedback.length === 0) return 0;
  const total = this.feedback.reduce((sum, f) => sum + f.rating, 0);
  return (total / this.feedback.length).toFixed(1);
};

export default mongoose.model("Volunteer", volunteerSchema);
