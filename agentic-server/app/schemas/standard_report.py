# app/schemas/standard_report.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class RiskAssessment(BaseModel):
    sentiment: str = Field(..., description="Predominant sentiment (e.g., Anxious, Depressed, Overwhelmed).")
    emotional_intensity: str = Field(..., description="Intensity of expressed emotion (e.g., Low, Moderate, High).")
    risk_level: str = Field(..., description="Assessed risk level (Low, Medium, High) based on detected flags.")
    red_flags: List[str] = Field(default_factory=list, description="List of detected keywords or themes indicating risk (e.g., 'hopelessness', 'social isolation', 'panic attacks').")

class ScreeningScores(BaseModel):
    phq_9_score: Optional[int] = Field(None, description="Estimated PHQ-9 score based on conversation indicators.")
    gad_7_score: Optional[int] = Field(None, description="Estimated GAD-7 score based on conversation indicators.")
    interpretation: str = Field(..., description="Brief clinical interpretation of the scores (e.g., 'Scores suggest moderate anxiety and mild depressive symptoms.').")

class RecommendedResource(BaseModel):
    category: str = Field(..., description="The category of the resource (e.g., 'Clinical Guide', 'Psychoeducational Video', 'Academic Research').")
    title: str = Field(..., description="The title of the resource.")
    url: str = Field(..., description="The URL of the resource.")
    relevance: str = Field(..., description="Justification for why this resource is relevant for the counselor or student's case.")
    source_tool: str = Field(..., description="The tool used to find it (e.g., 'pubmed_search', 'youtube_search').")

class CounselorRecommendations(BaseModel):
    recommended_resources: List[RecommendedResource] = Field(..., description="List of resources for the counselor's reference.")
    suggested_next_steps: List[str] = Field(..., description="Suggested actions for the counselor (e.g., 'Prioritize outreach for an initial consultation.', 'Explore CBT-based interventions for anxiety.').")

class ClinicalAnalytics(BaseModel):
    key_stressors_identified: List[str] = Field(..., description="Primary stressors identified from the chat (e.g., 'Academic Performance Pressure', 'Sleep Disruption', 'Fear of Failure').")
    potential_underlying_issues: List[str] = Field(..., description="Potential underlying themes to explore (e.g., 'Perfectionism', 'Lack of Social Support Network').")

class StandardReport(BaseModel):
    student_id: str = Field("anonymous_student_123", description="Anonymized student identifier.")
    chat_summary: str = Field(..., description="A concise, clinical summary of the conversation, focusing on presenting issues and symptoms.")
    risk_assessment: RiskAssessment
    screening_scores: ScreeningScores
    counselor_recommendations: CounselorRecommendations
    analytics: ClinicalAnalytics
    report_generated_at: datetime = Field(default_factory=datetime.utcnow, description="ISO timestamp of report generation.")