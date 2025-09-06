import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles.js";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: ROLES.ADMIN },
    permissions: [
      {
        type: String,
        enum: [
          "manage_users",
          "manage_counsellors",
          "manage_volunteers",
          "manage_reports",
          "view_analytics",
          "system_settings",
          "emergency_access",
        ],
        default: ["manage_users", "manage_counsellors", "manage_volunteers"],
      },
    ],
    counsellors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Counsellor" }],
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" }],
    isSuperAdmin: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
    profileImage: String,
    contactNumber: String,
    emergencyAccess: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
adminSchema.index({ isActive: 1 });
adminSchema.index({ permissions: 1 });

// Virtual for total managed users
adminSchema.virtual("totalManagedUsers").get(function () {
  return this.counsellors.length + this.volunteers.length;
});

// Virtual for admin level
adminSchema.virtual("adminLevel").get(function () {
  if (this.isSuperAdmin) return "super";
  if (this.permissions.includes("emergency_access")) return "emergency";
  if (this.permissions.includes("system_settings")) return "system";
  return "standard";
});

// Hash password before save
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Match password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check permission
adminSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission) || this.isSuperAdmin;
};

// Method to add permission
adminSchema.methods.addPermission = function (permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
    return this.save();
  }
  return this;
};

// Method to remove permission
adminSchema.methods.removePermission = function (permission) {
  this.permissions = this.permissions.filter((p) => p !== permission);
  return this.save();
};

// Method to add counsellor to management
adminSchema.methods.addCounsellor = function (counsellorId) {
  if (!this.counsellors.includes(counsellorId)) {
    this.counsellors.push(counsellorId);
    return this.save();
  }
  return this;
};

// Method to remove counsellor from management
adminSchema.methods.removeCounsellor = function (counsellorId) {
  this.counsellors = this.counsellors.filter(
    (id) => id.toString() !== counsellorId.toString()
  );
  return this.save();
};

// Method to add volunteer to management
adminSchema.methods.addVolunteer = function (volunteerId) {
  if (!this.volunteers.includes(volunteerId)) {
    this.volunteers.push(volunteerId);
    return this.save();
  }
  return this;
};

// Method to remove volunteer from management
adminSchema.methods.removeVolunteer = function (volunteerId) {
  this.volunteers = this.volunteers.filter(
    (id) => id.toString() !== volunteerId.toString()
  );
  return this.save();
};

// Method to update last login
adminSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Method to check if admin can manage a specific user
adminSchema.methods.canManageUser = function (userId, userType) {
  if (this.isSuperAdmin) return true;

  if (userType === "counsellor") {
    return this.counsellors.some((id) => id.toString() === userId.toString());
  }

  if (userType === "volunteer") {
    return this.volunteers.some((id) => id.toString() === userId.toString());
  }

  return false;
};

// Method to get managed users count by type
adminSchema.methods.getManagedUsersCount = function (userType) {
  if (userType === "counsellor") return this.counsellors.length;
  if (userType === "volunteer") return this.volunteers.length;
  return 0;
};

// Method to enable emergency access
adminSchema.methods.enableEmergencyAccess = function () {
  if (this.hasPermission("emergency_access")) {
    this.emergencyAccess = true;
    return this.save();
  }
  throw new Error("Insufficient permissions for emergency access");
};

// Method to disable emergency access
adminSchema.methods.disableEmergencyAccess = function () {
  this.emergencyAccess = false;
  return this.save();
};

export default mongoose.model("Admin", adminSchema);
