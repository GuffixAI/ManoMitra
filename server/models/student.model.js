import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles.js";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    studentCode: { type: String, required: true, unique: true, maxlength: 20 },
    counsellorConnected: [{ type: mongoose.Schema.Types.ObjectId, ref: "Counsellor" }],
    volunteerConnected: [{ type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" }],
    role: { type: String, default: ROLES.STUDENT },
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
    profileImage: String,
    contactNumber: String,
    emergencyContact: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say"
    },
    academicYear: {
      type: Number,
      min: 1,
      max: 6,
      default: 1
    },
    department: String,
    isActive: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
    preferences: {
      notificationEmail: { type: Boolean, default: true },
      notificationSMS: { type: Boolean, default: false },
      anonymousMode: { type: Boolean, default: false }
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
studentSchema.index({ studentCode: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ isActive: 1 });
studentSchema.index({ lastActive: -1 });

// Virtual for age
studentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for total connections
studentSchema.virtual('totalConnections').get(function() {
  return this.counsellorConnected.length + this.volunteerConnected.length;
});

// Virtual for active status
studentSchema.virtual('isOnline').get(function() {
  const now = new Date();
  const lastActive = new Date(this.lastActive);
  const diffInMinutes = (now - lastActive) / (1000 * 60);
  return diffInMinutes < 30; // Consider online if active in last 30 minutes
});

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

// Method to connect with counsellor
studentSchema.methods.connectCounsellor = function(counsellorId) {
  if (!this.counsellorConnected.includes(counsellorId)) {
    this.counsellorConnected.push(counsellorId);
    return this.save();
  }
  return this;
};

// Method to disconnect from counsellor
studentSchema.methods.disconnectCounsellor = function(counsellorId) {
  this.counsellorConnected = this.counsellorConnected.filter(
    id => id.toString() !== counsellorId.toString()
  );
  return this.save();
};

// Method to connect with volunteer
studentSchema.methods.connectVolunteer = function(volunteerId) {
  if (!this.volunteerConnected.includes(volunteerId)) {
    this.volunteerConnected.push(volunteerId);
    return this.save();
  }
  return this;
};

// Method to disconnect from volunteer
studentSchema.methods.disconnectVolunteer = function(volunteerId) {
  this.volunteerConnected = this.volunteerConnected.filter(
    id => id.toString() !== volunteerId.toString()
  );
  return this.save();
};

// Method to add report
studentSchema.methods.addReport = function(reportId) {
  if (!this.reports.includes(reportId)) {
    this.reports.push(reportId);
    return this.save();
  }
  return this;
};

// Method to remove report
studentSchema.methods.removeReport = function(reportId) {
  this.reports = this.reports.filter(
    id => id.toString() !== reportId.toString()
  );
  return this.save();
};

// Method to update last active time
studentSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Method to check if student has active connections
studentSchema.methods.hasActiveConnections = function() {
  return this.totalConnections > 0;
};

// Method to get connection status with a specific counsellor
studentSchema.methods.isConnectedToCounsellor = function(counsellorId) {
  return this.counsellorConnected.some(
    id => id.toString() === counsellorId.toString()
  );
};

// Method to get connection status with a specific volunteer
studentSchema.methods.isConnectedToVolunteer = function(volunteerId) {
  return this.volunteerConnected.some(
    id => id.toString() === volunteerId.toString()
  );
};

// Method to update preferences
studentSchema.methods.updatePreferences = function(newPreferences) {
  this.preferences = { ...this.preferences, ...newPreferences };
  return this.save();
};

export default mongoose.model("Student", studentSchema);
