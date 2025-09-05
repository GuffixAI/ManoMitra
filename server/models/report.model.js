// FILE: server/models/report.model.js

import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Student", 
      required: true, 
      index: true 
    },
    title: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 200
    },
    content: { 
      type: String, 
      required: true,
      maxlength: 5000
    },
    category: {
      type: String,
      enum: [
        "academic",
        "personal",
        "health",
        "bullying",
        "financial",
        "relationship",
        "social",
        "mental",
        "other"
      ],
      default: "other",
      required: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "closed"],
      default: "pending",
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counsellor",
      default: null
    },
    attachments: [{
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      url: String
    }],
    tags: [String],
    isAnonymous: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date,
    resolutionNotes: String
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
reportSchema.index({ createdAt: -1 });
reportSchema.index({ category: 1, status: 1 });
reportSchema.index({ priority: 1, status: 1 });

// Virtual for time since creation
reportSchema.virtual('timeSinceCreation').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for time since resolution
reportSchema.virtual('timeSinceResolution').get(function() {
  if (!this.resolvedAt) return null;
  return Date.now() - this.resolvedAt;
});

// Pre-save middleware to update resolvedAt when status changes
reportSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

// Static method to get reports by status
reportSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('owner', 'name').populate('assignedTo', 'name');
};

// Static method to get urgent reports
reportSchema.statics.getUrgent = function() {
  return this.find({ 
    priority: 'urgent', 
    status: { $in: ['pending', 'in_progress'] } 
  }).populate('owner', 'name').populate('assignedTo', 'name');
};

// Instance method to assign to counsellor
reportSchema.methods.assignToCounsellor = function(counsellorId) {
  this.assignedTo = counsellorId;
  this.status = 'in_progress';
  return this.save();
};

// Instance method to resolve report
reportSchema.methods.resolve = function(notes) {
  this.status = 'resolved';
  this.resolutionNotes = notes;
  this.resolvedAt = new Date();
  return this.save();
};

export default mongoose.model("Report", reportSchema);