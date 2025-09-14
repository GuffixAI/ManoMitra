# agentic-server/app/schemas/analytics.py

from pydantic import BaseModel, Field, conlist, field_validator
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

# --- Helper Schemas for Nested Data ---

class TopItem(BaseModel):
    """Schema for items like top stressors or red flags."""
    item: str = Field(..., alias="flag" or "stressor" or "concern" or "topic")
    count: int = Field(..., ge=0)

class CounselorReportCount(BaseModel):
    """Schema for top counsellors by reports resolved."""
    counsellorId: str
    name: str
    resolvedCount: int = Field(..., ge=0)

class SentimentTrendItem(BaseModel):
    """Schema for sentiment over time."""
    date: datetime
    averageSentimentScore: float

# --- Main AnalyticsSnapshot Schema ---

class AnalyticsSnapshot(BaseModel):
    """
    Pydantic schema representing a comprehensive analytics snapshot.
    NOTE: The Pylance warning 'Call expression not allowed in type expression' for `conlist` is a known linter issue.
    This syntax is correct for Pydantic v2 constrained types.
    """
    snapshotTimestamp: datetime = Field(default_factory=datetime.utcnow)
    snapshotVersion: str = Field(...)
    periodStart: Optional[datetime] = None
    periodEnd: Optional[datetime] = None
    
    # --- High-Level Metrics ---
    totalReports: int = Field(default=0, ge=0)
    totalAIReports: int = Field(default=0, ge=0)
    totalManualReports: int = Field(default=0, ge=0)
    totalStudentsEngaged: int = Field(default=0, ge=0)

    # --- Sentiment & Risk Trends ---
    sentimentDistribution: Dict[str, int] = Field(default_factory=dict)
    riskLevelDistribution: Dict[str, int] = Field(default_factory=dict)
    topRedFlags: conlist(TopItem, max_length=10) = Field(default_factory=list)

    # --- Screening Score Insights ---
    avgPHQ9: float = Field(default=0.0, ge=0.0)
    avgGAD7: float = Field(default=0.0, ge=0.0)
    avgGHQ: float = Field(default=0.0, ge=0.0)
    scoreInterpretationDistribution: Dict[str, int] = Field(default_factory=dict)
    phq9Distribution: Dict[str, int] = Field(default_factory=dict)
    gad7Distribution: Dict[str, int] = Field(default_factory=dict)
    ghqDistribution: Dict[str, int] = Field(default_factory=dict)

    # --- Stressor & Concern Analysis ---
    topStressors: conlist(TopItem, max_length=10) = Field(default_factory=list)
    topStudentConcerns: conlist(TopItem, max_length=10) = Field(default_factory=list)
    
    # --- Resource Recommendation Effectiveness ---
    topSuggestedResourceTopics: conlist(TopItem, max_length=10) = Field(default_factory=list)
    
    # --- Resolution & Assignment Metrics ---
    avgReportResolutionTimeDays: float = Field(default=0.0, ge=0.0)
    reportsByStatus: Dict[str, int] = Field(default_factory=dict)
    topCounsellorsByReportsResolved: conlist(CounselorReportCount, max_length=5) = Field(default_factory=list)
    avgTimeToAssignReportHours: float = Field(default=0.0, ge=0.0)

    # --- User Engagement Metrics (Calculated for period) ---
    activeStudentsDaily: Dict[str, int] = Field(default_factory=dict)
    activeStudentsWeekly: Dict[str, int] = Field(default_factory=dict)
    activeStudentsMonthly: Dict[str, int] = Field(default_factory=dict)

    # --- Additional Advanced Metrics ---
    emergingThemes: List[str] = Field(default_factory=list)
    sentimentOverTime: List[SentimentTrendItem] = Field(default_factory=list)

    # --- Raw data hashes/versioning for audit ---
    rawDataHash: Optional[str] = None
    filtersUsed: Dict[str, Any] = Field(default_factory=dict)
    
    proactiveOutreachSuggestions: List[Dict[str, Any]] = Field(default_factory=list)

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
        extra = "allow"

# --- Request/Input Schemas for triggering analytics ---

class AnalyticsRequest(BaseModel):
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    filters: Dict[str, Any] = Field(default_factory=dict)

class AnalyticsResponse(BaseModel):
    success: bool
    message: str
    snapshot_id: Optional[str] = None
    snapshot_version: Optional[str] = None
    data: Optional[AnalyticsSnapshot] = None

# --- Helper schemas for parsing raw AI report content ---

class AIReportDemoContent(BaseModel):
    student_summary: Optional[str] = None
    key_takeaways: Optional[List[str]] = None
    suggested_first_steps: Optional[List[str]] = None
    helpful_resources: Optional[Dict[str, Any]] = None
    message_of_encouragement: Optional[str] = None

class AIReportStandardRiskAssessment(BaseModel):
    sentiment: Optional[str] = None
    emotional_intensity: Optional[str] = None
    risk_level: Optional[str] = None
    red_flags: Optional[List[str]] = None

class AIReportStandardScreeningScores(BaseModel):
    phq_9_score: Optional[int] = None
    gad_7_score: Optional[int] = None
    interpretation: Optional[str] = None

class AIReportStandardCounselorRecommendations(BaseModel):
    recommended_resources: Optional[List[Dict[str, Any]]] = None
    suggested_next_steps: Optional[List[str]] = None

class AIReportStandardAnalytics(BaseModel):
    key_stressors_identified: Optional[List[str]] = None
    potential_underlying_issues: Optional[List[str]] = None

class AIReportStandardContent(BaseModel):
    student_id: Optional[str] = None
    chat_summary: Optional[str] = None
    risk_assessment: Optional[AIReportStandardRiskAssessment] = None
    screening_scores: Optional[AIReportStandardScreeningScores] = None
    counselor_recommendations: Optional[AIReportStandardCounselorRecommendations] = None
    analytics: Optional[AIReportStandardAnalytics] = None
    report_generated_at: Optional[datetime] = None

class AIReportFull(BaseModel):
    _id: str
    student: str
    demo_report: Dict[str, Any]
    standard_report: Dict[str, Any]
    createdAt: datetime
    updatedAt: datetime

    @field_validator('demo_report', 'standard_report', mode='before')
    @classmethod
    def parse_json_content(cls, v: Any) -> Any:
        """
        This validator runs before standard validation to parse JSON strings
        found within the 'demo_report' and 'standard_report' fields from the database.
        """
        content_key = 'demo_content' if 'demo_content' in v else 'standard_content'
        
        if isinstance(v, dict) and content_key in v and isinstance(v[content_key], str):
            try:
                return json.loads(v[content_key])
            except json.JSONDecodeError:
                return {}
        return v