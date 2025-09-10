// web/types/analytics.d.ts

// --- Helper Types for Nested Data ---

interface TopItem {
  item: string;
  count: number;
}

interface CounselorReportCount {
  counsellorId: string;
  name: string;
  resolvedCount: number;
}

interface SentimentTrendItem {
  date: string; // ISO string from backend
  averageSentimentScore: number;
}

// --- Main AnalyticsSnapshot Type ---

export interface AnalyticsSnapshot {
  _id: string; // MongoDB ObjectId as string
  snapshotTimestamp: string; // ISO string from backend
  snapshotVersion: string;
  periodStart?: string; // ISO string
  periodEnd?: string;   // ISO string
  
  // --- High-Level Metrics ---
  totalReports: number;
  totalAIReports: number;
  totalManualReports: number;
  totalStudentsEngaged: number;

  // --- Sentiment & Risk Trends ---
  sentimentDistribution: { [key: string]: number };
  riskLevelDistribution: { [key: string]: number };
  topRedFlags: TopItem[];

  // --- Screening Score Insights ---
  avgPHQ9: number;
  avgGAD7: number;
  avgGHQ: number;
  scoreInterpretationDistribution: { [key: string]: number };
  phq9Distribution: { [key: string]: number };
  gad7Distribution: { [key: string]: number };
  ghqDistribution: { [key: string]: number };

  // --- Stressor & Concern Analysis ---
  topStressors: TopItem[];
  topStudentConcerns: TopItem[];
  
  // --- Resource Recommendation Effectiveness ---
  topSuggestedResourceTopics: TopItem[];
  
  // --- Resolution & Assignment Metrics ---
  avgReportResolutionTimeDays: number;
  reportsByStatus: { [key: string]: number };
  topCounsellorsByReportsResolved: CounselorReportCount[];
  avgTimeToAssignReportHours: number;

  // --- User Engagement Metrics ---
  activeStudentsDaily: { [date: string]: number };
  activeStudentsWeekly: { [period: string]: number };
  activeStudentsMonthly: { [period: string]: number };

  // --- Additional Advanced Metrics ---
  emergingThemes: string[];
  sentimentOverTime: SentimentTrendItem[];

  // --- Raw data hashes/versioning for audit ---
  rawDataHash?: string;
  filtersUsed: { [key: string]: any };

  createdAt: string;
  updatedAt: string;
}

// --- API Response Type for Triggering ---
export interface TriggerAnalyticsResponse {
  success: boolean;
  message: string;
  snapshot_id: string;
  snapshot_version: string;
}

// --- API Response Type for Fetching (consistent with Node.js controller) ---
export interface FetchAnalyticsResponse {
    success: boolean;
    data: AnalyticsSnapshot;
}

export interface FetchAnalyticsVersionsResponse {
    success: boolean;
    data: Array<{
        _id: string;
        snapshotVersion: string;
        snapshotTimestamp: string;
        periodStart?: string;
        periodEnd?: string;
    }>;
}