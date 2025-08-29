import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles.js";

const counsellorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    specialization: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    qualifications: [String],
    experience: { type: Number, min: 0, default: 0 },
    availableTime: [
      {
        day: { 
          type: String, 
          enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
          required: true
        },
        slots: [{ 
          start: { type: String, required: true }, 
          end: { type: String, required: true } 
        }],
      },
    ],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    feedback: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now }
      },
    ],
    isActive: { type: Boolean, default: true },
    maxStudents: { type: Number, default: 20, min: 1, max: 50 },
    role: { type: String, default: ROLES.COUNSELLOR },
    profileImage: String,
    contactNumber: String,
    emergencyContact: String
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
counsellorSchema.index({ specialization: 1, isActive: 1 });
counsellorSchema.index({ "availableTime.day": 1 });
counsellorSchema.index({ rating: -1 });

// Virtual for average rating
counsellorSchema.virtual('averageRating').get(function () {
  if (this.feedback.length === 0) return 0;
  const total = this.feedback.reduce((sum, f) => sum + f.rating, 0);
  return (total / this.feedback.length).toFixed(1);
});

// Virtual for total feedback count
counsellorSchema.virtual('feedbackCount').get(function () {
  return this.feedback.length;
});

// Virtual for available slots count
counsellorSchema.virtual('availableSlotsCount').get(function () {
  return this.availableTime.reduce((total, day) => total + day.slots.length, 0);
});

// Virtual for current student count
counsellorSchema.virtual('currentStudentCount').get(function () {
  return this.students.length;
});

// Virtual for availability status
counsellorSchema.virtual('isAvailable').get(function () {
  return this.isActive && this.currentStudentCount < this.maxStudents;
});

// Hide feedback details from counsellor
counsellorSchema.methods.getAverageRating = function () {
  if (this.feedback.length === 0) return 0;
  const total = this.feedback.reduce((sum, f) => sum + f.rating, 0);
  return (total / this.feedback.length).toFixed(1);
};

// Method to add student
counsellorSchema.methods.addStudent = function(studentId) {
  if (!this.students.includes(studentId) && this.currentStudentCount < this.maxStudents) {
    this.students.push(studentId);
    return this.save();
  }
  throw new Error('Cannot add more students or student already exists');
};

// Method to remove student
counsellorSchema.methods.removeStudent = function(studentId) {
  this.students = this.students.filter(id => id.toString() !== studentId.toString());
  return this.save();
};

// Method to check availability for a specific time
counsellorSchema.methods.isAvailableAt = function(day, time) {
  const daySchedule = this.availableTime.find(d => d.day === day);
  if (!daySchedule) return false;
  
  return daySchedule.slots.some(slot => {
    return time >= slot.start && time <= slot.end;
  });
};

// Method to get available slots for a day
counsellorSchema.methods.getAvailableSlots = function(day) {
  const daySchedule = this.availableTime.find(d => d.day === day);
  return daySchedule ? daySchedule.slots : [];
};

// Method to add feedback
counsellorSchema.methods.addFeedback = function(studentId, rating, comment = '') {
  // Remove existing feedback from same student
  this.feedback = this.feedback.filter(f => f.student.toString() !== studentId.toString());
  
  // Add new feedback
  this.feedback.push({
    student: studentId,
    rating,
    comment,
    createdAt: new Date()
  });
  
  return this.save();
};

// Hash password before save
counsellorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Match password
counsellorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Counsellor", counsellorSchema);
