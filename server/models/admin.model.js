import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles.js";

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    password: { type: String, required: true },
    counsellors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Counsellor" }],
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" }],
    role: { type: String, default: ROLES.ADMIN },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("Admin", adminSchema);
