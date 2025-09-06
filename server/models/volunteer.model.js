import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles.js";

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    description: { type: String, maxlength: 1000 },
    skills: [String],
    interests: [String],
    experience: { type: Number, min: 0, default: 0 },
    availability: {
      type: String,
      enum: ["full-time", "part-time", "weekends", "evenings", "flexible"],
      default: "flexible",
    },
    preferredTopics: [
      {
        type: String,
        enum: [
          "general",
          "anxiety",
          "depression",
          "sleep",
          "exam",
          "relationships",
        ],
      },
    ],
    feedback: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
    passwordResetToken: String,
    passwordResetExpires: Date,
    maxConcurrentChats: { type: Number, default: 3, min: 1, max: 5 },
    role: { type: String, default: ROLES.VOLUNTEER },
    profileImage: String,
    contactNumber: String,
    trainingCompleted: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
volunteerSchema.index({ isActive: 1, preferredTopics: 1 });
volunteerSchema.index({ rating: -1 });
volunteerSchema.index({ lastActive: -1 });

// Virtual for average rating
volunteerSchema.virtual("averageRating").get(function () {
  // FIX: Added a check to ensure 'this.feedback' exists before reducing it.
  if (!this.feedback || this.feedback.length === 0) return 0;
  const total = this.feedback.reduce((sum, f) => sum + f.rating, 0);
  return (total / this.feedback.length).toFixed(1);
});

// Virtual for total feedback count
volunteerSchema.virtual("feedbackCount").get(function () {
  // FIX: Added a check to ensure 'this.feedback' exists before accessing its length.
  if (!this.feedback) return 0;
  return this.feedback.length;
});


// Virtual for total experience in years
volunteerSchema.virtual("experienceYears").get(function () {
  return this.experience;
});

// Virtual for availability status
volunteerSchema.virtual("isAvailable").get(function () {
  return this.isActive && this.trainingCompleted;
});

// Virtual for current chat count (placeholder for future implementation)
volunteerSchema.virtual("currentChatCount").get(function () {
  return 0; // This would be calculated from active chat sessions
});

// Method to add feedback
volunteerSchema.methods.addFeedback = function (
  studentId,
  rating,
  comment = ""
) {
  // Remove existing feedback from same student
  this.feedback = this.feedback.filter(
    (f) => f.student.toString() !== studentId.toString()
  );

  // Add new feedback
  this.feedback.push({
    student: studentId,
    rating,
    comment,
    createdAt: new Date(),
  });

  return this.save();
};

// Method to update last active time
volunteerSchema.methods.updateLastActive = function () {
  this.lastActive = new Date();
  return this.save();
};

// Method to check if volunteer can take more chats
volunteerSchema.methods.canTakeMoreChats = function () {
  return this.currentChatCount < this.maxConcurrentChats;
};

// Method to get preferred topics
volunteerSchema.methods.getPreferredTopics = function () {
  return this.preferredTopics;
};

// Method to add skill
volunteerSchema.methods.addSkill = function (skill) {
  if (!this.skills.includes(skill)) {
    this.skills.push(skill);
    return this.save();
  }
  return this;
};

// Method to remove skill
volunteerSchema.methods.removeSkill = function (skill) {
  this.skills = this.skills.filter((s) => s !== skill);
  return this.save();
};

// Method to add interest
volunteerSchema.methods.addInterest = function (interest) {
  if (!this.interests.includes(interest)) {
    this.interests.push(interest);
    return this.save();
  }
  return this;
};

// Method to remove interest
volunteerSchema.methods.removeInterest = function (interest) {
  this.interests = this.interests.filter((i) => i !== interest);
  return this.save();
};

// Method to mark training as completed
volunteerSchema.methods.completeTraining = function () {
  this.trainingCompleted = true;
  return this.save();
};

// Hash password before save
volunteerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Match password
volunteerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Volunteer", volunteerSchema);