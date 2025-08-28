import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles.js";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    studentCode: { type: String, required: true, unique: true },
    counsellorConnected: [{ type: mongoose.Schema.Types.ObjectId, ref: "Counsellor" }],
    volunteerConnected: [{ type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" }],
    role: { type: String, default: ROLES.STUDENT },
    report: [{ type: String }], // Markdown file URLs
  },
  { timestamps: true }
);

// Hash password before save
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Match password
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Student", studentSchema);
