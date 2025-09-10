// server/models/analyticSnapshot.model.js
import mongoose from "mongoose";

const analyticSnapshotSchema = new mongoose.Schema(
  {
    snapshotTimestamp: { type: Date, required: true, default: Date.now },
    snapshotVersion: { type: String, required: true, index: true }, // e.g., v1.0, v2.1. Automatically generated.
    periodStart: { type: Date }, // Start date of data included in this snapshot
    periodEnd: { type: Date },   // End date of data included in this snapshot
    
    // --- High-Level Metrics ---
    totalReports: { type: Number, default: 0 },
    totalAIReports: { type: Number, default: 0 },
    totalManualReports: { type: Number, default: 0 },
    totalStudentsEngaged: { type: Number, default: 0 },

    // --- Sentiment & Risk Trends ---
    sentimentDistribution: { // e.g., { 'Anxious': 150, 'Depressed': 120, 'Overwhelmed': 80 }
      type: mongoose.Schema.Types.Mixed, // Stored as a flexible object/dict
      default: {}
    },
    riskLevelDistribution: { // e.g., { 'Low': 300, 'Medium': 50, 'High': 10, 'Critical': 2 }
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    topRedFlags: [{
      _id: false, // Don't create an _id for sub-documents in this array
      flag: String,
      count: Number
    }], // e.g., [{ flag: 'hopelessness', count: 25 }]

    // --- Screening Score Insights ---
    avgPHQ9: { type: Number, default: 0 },
    avgGAD7: { type: Number, default: 0 },
    avgGHQ: { type: Number, default: 0 }, // Assuming GHQ will also be integrated
    scoreInterpretationDistribution: { // e.g., { 'Mild Anxiety': 100, 'Moderate Depression': 50 }
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    phq9Distribution: { type: mongoose.Schema.Types.Mixed, default: {} }, // Raw distribution of scores
    gad7Distribution: { type: mongoose.Schema.Types.Mixed, default: {} },
    ghqDistribution: { type: mongoose.Schema.Types.Mixed, default: {} },

    // --- Stressor & Concern Analysis ---
    topStressors: [{
      _id: false,
      stressor: String,
      count: Number
    }],
    topStudentConcerns: [{
      _id: false,
      concern: String,
      count: Number
    }],
    
    // --- Resource Recommendation Effectiveness (if trackable) ---
    topSuggestedResourceTopics: [{
      _id: false,
      topic: String,
      count: Number
    }],
    
    // --- Resolution & Assignment Metrics (for manual reports) ---
    avgReportResolutionTimeDays: { type: Number, default: 0 },
    reportsByStatus: { // { 'pending': 50, 'in_progress': 20, 'resolved': 200, 'closed': 100 }
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    topCounsellorsByReportsResolved: [{
      _id: false,
      counsellorId: mongoose.Schema.Types.ObjectId,
      name: String,
      resolvedCount: Number
    }],
    avgTimeToAssignReportHours: { type: Number, default: 0 },

    // --- User Engagement Metrics ---
    activeStudentsDaily: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g., {'2023-01-01': 50, '2023-01-02': 55}
    activeStudentsWeekly: { type: mongoose.Schema.Types.Mixed, default: {} },
    activeStudentsMonthly: { type: mongoose.Schema.Types.Mixed, default: {} },

    // --- Additional Advanced Metrics ---
    emergingThemes: [String], // Discovered by LLM-based analysis
    sentimentOverTime: [{ // Time series of average sentiment
      _id: false,
      date: Date,
      averageSentimentScore: Number // Could be a numerical scale
    }],

    // --- Raw data hashes/versioning for audit ---
    rawDataHash: String, // A hash of the underlying data used to create this snapshot

    // Add fields for filtering reports included in the snapshot (optional for later)
    filtersUsed: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

// Add indexes for efficient querying
analyticSnapshotSchema.index({ snapshotTimestamp: -1 }); // Latest snapshots first
analyticSnapshotSchema.index({ snapshotVersion: 1 });   // Efficient lookup by version
analyticSnapshotSchema.index({ periodStart: 1, periodEnd: 1 }); // For range queries

export default mongoose.model("AnalyticsSnapshot", analyticSnapshotSchema);