# analytic-agentic-server/agents/analytic_supervisor.py

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
import pandas as pd
import json
import hashlib
from collections import Counter
import numpy as np # For numerical operations, especially averages
import os
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, END
from app.utils.logger import get_logger
from app.services.data_fetcher import DataFetcher
from app.schemas.analytics import AnalyticsSnapshot, AIReportFull
from app.db.connect import get_db

# Optional: If you decide to use an LLM for advanced theme detection
# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.pydantic_v1 import BaseModel, Field

logger = get_logger(__name__)

# ---------------- Analytic Agent State ---------------- #

class AnalyticState(TypedDict):
    """
    Represents the state passed between analytic agents.
    """
    raw_reports: List[Dict[str, Any]]
    raw_ai_reports: List[Dict[str, Any]]
    raw_students: List[Dict[str, Any]]
    raw_counsellors: List[Dict[str, Any]]
    raw_volunteers: List[Dict[str, Any]] # Add volunteers if needed for engagement analysis

    reports_df: Optional[pd.DataFrame] # Processed DataFrame for manual reports
    ai_reports_df: Optional[pd.DataFrame] # Processed DataFrame for AI reports
    combined_reports_df: Optional[pd.DataFrame] # Combined DataFrame for overall analysis
    
    analytic_results: Optional[Dict[str, Any]] # Final structured analytics
    
    snapshot_version: str
    period_start: Optional[datetime]
    period_end: Optional[datetime]
    filters_used: Dict[str, Any] # Filters applied when generating this snapshot
    raw_checkins: List[Dict[str, Any]] # NEW
    checkins_df: Optional[pd.DataFrame] # NEW

# ---------------- Analytic Agent Functions ---------------- #

# Initialize DataFetcher and AnalyticSnapshot collection
data_fetcher = DataFetcher()
analytics_collection = get_db()["analyticssnapshots"] # Collection name matches model in Node.js

async def report_ingestion_agent(state: AnalyticState) -> AnalyticState:
    """
    Fetches raw reports (manual and AI-generated) from MongoDB.
    """
    logger.info("Analytic Agent: report_ingestion_agent started.")
    
    period_start = state.get("period_start")
    period_end = state.get("period_end")

    try:
        state["raw_reports"] = data_fetcher.fetch_all_reports(period_start=period_start, end_date=period_end)
        state["raw_ai_reports"] = data_fetcher.fetch_all_ai_reports(period_start=period_start, end_date=period_end)
        
        # Fetch auxiliary data needed for linking/contextualizing
        state["raw_students"] = data_fetcher.fetch_all_students()
        state["raw_counsellors"] = data_fetcher.fetch_all_counsellors()
        state["raw_volunteers"] = data_fetcher.fetch_all_volunteers()
        state["raw_checkins"] = data_fetcher.fetch_all_checkins(period_start=period_start, end_date=period_end)

        logger.info(f"Fetched {len(state['raw_reports'])} manual reports and {len(state['raw_ai_reports'])} AI reports.")
        logger.info(f"Fetched {len(state['raw_students'])} students, {len(state['raw_counsellors'])} counsellors.")
        logger.info(f"Fetched {len(state['raw_checkins'])} student check-ins.")
    except Exception as e:
        logger.error(f"Error in report_ingestion_agent: {e}", exc_info=True)
        raise

    return state

async def data_preprocessing_agent(state: AnalyticState) -> AnalyticState:
    """
    Converts raw data into Pandas DataFrames, parses nested JSON, and standardizes fields.
    """
    logger.info("Analytic Agent: data_preprocessing_agent started.")

    # Process Manual Reports
    if state["raw_reports"]:
        reports_df = pd.DataFrame(state["raw_reports"])
        # Ensure 'createdAt' is datetime for sorting and filtering
        reports_df['createdAt'] = pd.to_datetime(reports_df['createdAt'])
        reports_df['report_type'] = 'manual'
        reports_df['owner_id'] = reports_df['owner'].astype(str) # Ensure string conversion
        reports_df['assigned_to_id'] = reports_df['assignedTo'].astype(str) # Ensure string conversion
        # Drop original ObjectId references if no longer needed
        reports_df = reports_df.drop(columns=['owner', 'assignedTo'], errors='ignore')
        state["reports_df"] = reports_df
        logger.info(f"Processed {len(reports_df)} manual reports into DataFrame.")
    else:
        state["reports_df"] = pd.DataFrame()
        logger.warning("No raw manual reports to preprocess.")

    # Process AI Reports
    if state["raw_ai_reports"]:
        ai_reports_list = []
        for raw_ai_report in state["raw_ai_reports"]:
            try:
                # Use AIReportFull schema for robust parsing of nested JSON strings
                parsed_ai_report = AIReportFull(**raw_ai_report).dict(by_alias=True, exclude_none=True)
                ai_reports_list.append(parsed_ai_report)
            except Exception as e:
                logger.error(f"Failed to parse AI report content for ID {raw_ai_report.get('_id')}: {e}", exc_info=True)
                # Append raw report if parsing fails, but be aware of its format
                ai_reports_list.append(raw_ai_report)

        ai_reports_df = pd.DataFrame(ai_reports_list)
        ai_reports_df['createdAt'] = pd.to_datetime(ai_reports_df['createdAt'])
        ai_reports_df['report_type'] = 'ai'
        ai_reports_df['owner_id'] = ai_reports_df['student'].astype(str) # AI reports are owned by 'student' field
        ai_reports_df = ai_reports_df.drop(columns=['student'], errors='ignore')

        # Extract nested fields from parsed JSON
        # Example: Sentiment and Risk from standard_report
        ai_reports_df['sentiment'] = ai_reports_df['standard_report'].apply(lambda x: x.get('risk_assessment', {}).get('sentiment') if isinstance(x, dict) else None)
        ai_reports_df['risk_level'] = ai_reports_df['standard_report'].apply(lambda x: x.get('risk_assessment', {}).get('risk_level') if isinstance(x, dict) else None)
        ai_reports_df['red_flags'] = ai_reports_df['standard_report'].apply(lambda x: x.get('risk_assessment', {}).get('red_flags') if isinstance(x, dict) else [])
        ai_reports_df['phq_9_score'] = ai_reports_df['standard_report'].apply(lambda x: x.get('screening_scores', {}).get('phq_9_score') if isinstance(x, dict) else None)
        ai_reports_df['gad_7_score'] = ai_reports_df['standard_report'].apply(lambda x: x.get('screening_scores', {}).get('gad_7_score') if isinstance(x, dict) else None)
        # Add other extractions as needed for PHQ/GAD interpretation, stressors, etc.
        
        state["ai_reports_df"] = ai_reports_df
        logger.info(f"Processed {len(ai_reports_df)} AI reports into DataFrame.")
    else:
        state["ai_reports_df"] = pd.DataFrame()
        logger.warning("No raw AI reports to preprocess.")

    # Combine DataFrames if both exist
    if not state["reports_df"].empty and not state["ai_reports_df"].empty:
        # Align columns before concatenation
        common_columns = list(set(state["reports_df"].columns) & set(state["ai_reports_df"].columns))
        state["combined_reports_df"] = pd.concat([
            state["reports_df"][common_columns],
            state["ai_reports_df"][common_columns]
        ], ignore_index=True)
    elif not state["reports_df"].empty:
        state["combined_reports_df"] = state["reports_df"]
    elif not state["ai_reports_df"].empty:
        state["combined_reports_df"] = state["ai_reports_df"]
    else:
        state["combined_reports_df"] = pd.DataFrame()
        logger.warning("No reports (manual or AI) to combine.")
    
    
    if state["raw_checkins"]:
        checkins_df = pd.DataFrame(state["raw_checkins"])
        checkins_df['createdAt'] = pd.to_datetime(checkins_df['createdAt'])
        checkins_df['student_id'] = checkins_df['student'].astype(str)
        checkins_df = checkins_df.drop(columns=['student'], errors='ignore')
        state["checkins_df"] = checkins_df
        logger.info(f"Processed {len(checkins_df)} check-ins into DataFrame.")
    else:
        state["checkins_df"] = pd.DataFrame()
        logger.warning("No raw check-in data to preprocess.")

    return state

async def sentiment_risk_analyzer(state: AnalyticState) -> AnalyticState:
    """
    Analyzes sentiment and risk levels across all reports.
    """
    logger.info("Analytic Agent: sentiment_risk_analyzer started.")
    analytic_results = state.get("analytic_results", {})
    df = state["combined_reports_df"]

    if df.empty:
        logger.warning("No combined reports DataFrame for sentiment_risk_analyzer.")
        state["analytic_results"] = analytic_results
        return state

    # Sentiment Distribution
    sentiment_counts = df['sentiment'].value_counts(dropna=True).to_dict()
    analytic_results['sentimentDistribution'] = sentiment_counts
    
    # Risk Level Distribution
    risk_level_counts = df['risk_level'].value_counts(dropna=True).to_dict()
    analytic_results['riskLevelDistribution'] = risk_level_counts

    # Top Red Flags (requires handling lists of red flags)
    all_red_flags = []
    # Collect red flags from AI reports (already parsed as list)
    if 'red_flags' in df.columns:
        df['red_flags'].dropna().apply(lambda x: all_red_flags.extend(x) if isinstance(x, list) else None)
    # You might need to add a "red_flags" extraction for manual reports too if they have a similar field
    
    top_flags = Counter(all_red_flags).most_common(10)
    analytic_results['topRedFlags'] = [{"flag": flag, "count": count} for flag, count in top_flags]

    state["analytic_results"] = analytic_results
    logger.info("Sentiment and Risk analysis complete.")
    return state

async def screening_score_aggregator(state: AnalyticState) -> AnalyticState:
    """
    Aggregates and analyzes screening scores (PHQ-9, GAD-7, GHQ).
    """
    logger.info("Analytic Agent: screening_score_aggregator started.")
    analytic_results = state.get("analytic_results", {})
    df = state["combined_reports_df"]

    if df.empty:
        logger.warning("No combined reports DataFrame for screening_score_aggregator.")
        state["analytic_results"] = analytic_results
        return state

    # Average Scores
    analytic_results['avgPHQ9'] = df['phq_9_score'].mean() if 'phq_9_score' in df.columns else 0.0
    analytic_results['avgGAD7'] = df['gad_7_score'].mean() if 'gad_7_score' in df.columns else 0.0
    # Assuming GHQ will be extracted if available
    analytic_results['avgGHQ'] = df['ghq'].mean() if 'ghq' in df.columns else 0.0 # Placeholder

    # Score Distributions (simple binning for PHQ-9/GAD-7)
    # You can define more sophisticated bins based on clinical guidelines
    if 'phq_9_score' in df.columns:
        phq9_bins = pd.cut(df['phq_9_score'], bins=[-1, 4, 9, 14, 19, 27], labels=['Minimal', 'Mild', 'Moderate', 'Mod-Severe', 'Severe'])
        analytic_results['phq9Distribution'] = phq9_bins.value_counts(dropna=False).to_dict()
    
    if 'gad_7_score' in df.columns:
        gad7_bins = pd.cut(df['gad_7_score'], bins=[-1, 4, 9, 14, 21], labels=['Minimal', 'Mild', 'Moderate', 'Severe'])
        analytic_results['gad7Distribution'] = gad7_bins.value_counts(dropna=False).to_dict()

    state["analytic_results"] = analytic_results
    logger.info("Screening score aggregation complete.")
    return state

async def stressor_concern_extractor(state: AnalyticState) -> AnalyticState:
    """
    Extracts and ranks key stressors and student-expressed concerns.
    """
    logger.info("Analytic Agent: stressor_concern_extractor started.")
    analytic_results = state.get("analytic_results", {})
    df = state["combined_reports_df"]

    if df.empty:
        logger.warning("No combined reports DataFrame for stressor_concern_extractor.")
        state["analytic_results"] = analytic_results
        return state

    all_stressors = []
    all_concerns = []
    
    # Process AI report analytics for stressors and concerns
    if 'standard_report' in df.columns:
        df['standard_report'].dropna().apply(lambda x: all_stressors.extend(x.get('analytics', {}).get('key_stressors_identified', [])) if isinstance(x, dict) else None)
        df['standard_report'].dropna().apply(lambda x: all_concerns.extend(x.get('summary', {}).get('student_expressed_concerns', [])) if isinstance(x, dict) else None)
        # Note: 'summary' is from demo_report, 'analytics' is from standard_report
        # You might need to unify these in preprocessing or extract from both.
        df['demo_report'].dropna().apply(lambda x: all_concerns.extend(x.get('student_expressed_concerns', [])) if isinstance(x, dict) else None)

    # Process manual reports: assume 'content' might contain keywords or 'tags' field
    # This requires more advanced NLP or explicit tag extraction from manual report content
    if 'tags' in df.columns:
        df['tags'].dropna().apply(lambda x: all_stressors.extend(x) if isinstance(x, list) else None)
        
    # As a fallback for manual reports, simple keyword extraction from content
    # For a real system, you'd apply NLP models here.
    if 'content' in df.columns:
        for content in df['content'].dropna():
            if "exam" in content.lower(): all_stressors.append("Exam Stress")
            if "sleep" in content.lower(): all_stressors.append("Sleep Problems")
            if "alone" in content.lower(): all_concerns.append("Feeling Alone")


    top_stressors = Counter(all_stressors).most_common(10)
    analytic_results['topStressors'] = [{"stressor": s, "count": c} for s, c in top_stressors]

    top_concerns = Counter(all_concerns).most_common(10)
    analytic_results['topStudentConcerns'] = [{"concern": c, "count": c_count} for c, c_count in top_concerns]

    state["analytic_results"] = analytic_results
    logger.info("Stressor and concern extraction complete.")
    return state

async def resource_topic_aggregator(state: AnalyticState) -> AnalyticState:
    """
    Aggregates suggested resource topics from AI reports.
    """
    logger.info("Analytic Agent: resource_topic_aggregator started.")
    analytic_results = state.get("analytic_results", {})
    df = state["ai_reports_df"] # Only AI reports suggest resource topics

    if df.empty:
        logger.warning("No AI reports DataFrame for resource_topic_aggregator.")
        analytic_results['topSuggestedResourceTopics'] = []
        state["analytic_results"] = analytic_results
        return state

    all_resource_topics = []
    if 'standard_report' in df.columns:
        df['standard_report'].dropna().apply(lambda x: all_resource_topics.extend(x.get('summary', {}).get('suggested_resource_topics', [])) if isinstance(x, dict) else None)
    # The new AI reports place suggested_resource_topics in `summary`, which is part of the `demo_report`
    if 'demo_report' in df.columns:
         df['demo_report'].dropna().apply(lambda x: all_resource_topics.extend(x.get('suggested_resource_topics', [])) if isinstance(x, dict) else None)


    top_resource_topics = Counter(all_resource_topics).most_common(10)
    analytic_results['topSuggestedResourceTopics'] = [{"topic": t, "count": c} for t, c in top_resource_topics]

    state["analytic_results"] = analytic_results
    logger.info("Resource topic aggregation complete.")
    return state


async def resolution_efficiency_metrics(state: AnalyticState) -> AnalyticState:
    """
    Calculates metrics related to manual report resolution and assignment.
    """
    logger.info("Analytic Agent: resolution_efficiency_metrics started.")
    analytic_results = state.get("analytic_results", {})
    df = state["reports_df"] # Only manual reports have 'status', 'assignedTo', 'resolvedAt'

    if df.empty:
        logger.warning("No manual reports DataFrame for resolution_efficiency_metrics.")
        state["analytic_results"] = analytic_results
        return state

    # Reports by Status
    analytic_results['reportsByStatus'] = df['status'].value_counts(dropna=False).to_dict()

    # Average Resolution Time (for 'resolved' reports)
    resolved_reports = df[df['status'] == 'resolved'].copy() # Use .copy() to avoid SettingWithCopyWarning
    if not resolved_reports.empty:
        resolved_reports['resolvedAt'] = pd.to_datetime(resolved_reports['resolvedAt'])
        resolved_reports['resolution_duration'] = (resolved_reports['resolvedAt'] - resolved_reports['createdAt']).dt.total_seconds() / (3600 * 24) # in days
        analytic_results['avgReportResolutionTimeDays'] = resolved_reports['resolution_duration'].mean()
    else:
        analytic_results['avgReportResolutionTimeDays'] = 0.0

    # Average Time to Assign (for reports that were assigned)
    assigned_reports = df[df['assigned_to_id'].notna()].copy()
    if not assigned_reports.empty:
        # Assuming we might not have an 'assignedAt' timestamp, use the first 'updatedAt' after assignment if 'assignedTo' exists
        # A proper 'assignedAt' field in Report model would be ideal.
        # For now, let's assume 'assignedTo' is set early and use report creation time.
        # This metric would be more accurate if there was an 'assignedAt' field in the DB.
        # Let's placeholder this or make it more robust later.
        analytic_results['avgTimeToAssignReportHours'] = 0.0 # Placeholder for now

    # Top Counsellors by Reports Resolved
    if 'assigned_to_id' in df.columns and not state["raw_counsellors"].empty:
        counsellors_df = pd.DataFrame(state["raw_counsellors"])
        resolved_counts = df[df['status'] == 'resolved']['assigned_to_id'].value_counts().reset_index()
        resolved_counts.columns = ['counsellorId', 'resolvedCount']
        
        if not resolved_counts.empty:
            top_counsellors = pd.merge(resolved_counts, counsellors_df[['_id', 'name']], left_on='counsellorId', right_on='_id', how='left')
            top_counsellors['name'] = top_counsellors['name'].fillna("Unknown Counsellor")
            top_counsellors = top_counsellors[['counsellorId', 'name', 'resolvedCount']].sort_values(by='resolvedCount', ascending=False).head(5)
            analytic_results['topCounsellorsByReportsResolved'] = top_counsellors.to_dict(orient='records')
        else:
            analytic_results['topCounsellorsByReportsResolved'] = []
    else:
        analytic_results['topCounsellorsByReportsResolved'] = []


    state["analytic_results"] = analytic_results
    logger.info("Resolution efficiency metrics complete.")
    return state


async def user_engagement_metrics(state: AnalyticState) -> AnalyticState:
    """
    Calculates user engagement metrics (e.g., active students).
    Requires 'lastActive' field on Student model.
    """
    logger.info("Analytic Agent: user_engagement_metrics started.")
    analytic_results = state.get("analytic_results", {})
    
    if not state["raw_students"]:
        logger.warning("No raw student data for user_engagement_metrics.")
        state["analytic_results"] = analytic_results
        return state

    students_df = pd.DataFrame(state["raw_students"])
    if 'lastActive' not in students_df.columns:
        logger.warning("Student DataFrame missing 'lastActive' column for engagement metrics.")
        state["analytic_results"] = analytic_results
        return state

    students_df['lastActive'] = pd.to_datetime(students_df['lastActive'])
    
    # Define the period for this snapshot if not already set (e.g., for ad-hoc)
    period_end = state.get("period_end") or datetime.now(timezone.utc)
    period_start = state.get("period_start") or (period_end - timedelta(days=30)) # Default to last 30 days if not specified

    # Filter students active within the snapshot period
    active_students_in_period = students_df[(students_df['lastActive'] >= period_start) & (students_df['lastActive'] <= period_end)]

    # Total students engaged in the period (unique active students)
    analytic_results['totalStudentsEngaged'] = active_students_in_period['_id'].nunique()

    # Daily Active Students (DAS) for the period
    # Group by date of last active and count unique students
    daily_active_counts = active_students_in_period.groupby(active_students_in_period['lastActive'].dt.date)['_id'].nunique()
    analytic_results['activeStudentsDaily'] = {str(date): count for date, count in daily_active_counts.items()}
    
    # Weekly Active Students (WAS)
    weekly_active_counts = active_students_in_period.groupby(active_students_in_period['lastActive'].dt.to_period('W'))['_id'].nunique()
    analytic_results['activeStudentsWeekly'] = {str(period): count for period, count in weekly_active_counts.items()}
    
    # Monthly Active Students (MAS)
    monthly_active_counts = active_students_in_period.groupby(active_students_in_period['lastActive'].dt.to_period('M'))['_id'].nunique()
    analytic_results['activeStudentsMonthly'] = {str(period): count for period, count in monthly_active_counts.items()}

    state["analytic_results"] = analytic_results
    logger.info("User engagement metrics complete.")
    return state


# Optional: LLM agent for emerging themes
# class EmergingThemesOutput(BaseModel):
#     emerging_themes: List[str] = Field(..., description="List of 3-5 emerging mental health themes from reports.")

# llm_analytic = ChatGoogleGenerativeAI(model="gemini-2.0-flash") # Use a cheaper model for this if possible

# async def emerging_theme_detector_agent(state: AnalyticState) -> AnalyticState:
#     """
#     Uses an LLM to detect emerging themes from a sample of report contents.
#     """
#     logger.info("Analytic Agent: emerging_theme_detector_agent started.")
#     analytic_results = state.get("analytic_results", {})
#     df = state["combined_reports_df"]

#     if df.empty or 'content' not in df.columns:
#         logger.warning("No reports or content column for emerging_theme_detector_agent.")
#         analytic_results['emergingThemes'] = []
#         state["analytic_results"] = analytic_results
#         return state

#     # Take a sample of report contents (e.g., top 20 most recent reports)
#     sample_contents = df.sort_values(by='createdAt', ascending=False)['content'].head(20).tolist()
#     if not sample_contents:
#         analytic_results['emergingThemes'] = []
#         state["analytic_results"] = analytic_results
#         return state

#     prompt_template = ChatPromptTemplate.from_messages([
#         ("system", """You are an expert mental health analyst. Read the following student report summaries/contents and identify 3-5 distinct, emerging mental health themes or trends that might require institutional attention. Focus on patterns rather than single incidents. Output as a JSON list of themes."""),
#         ("user", "Recent student reports:\n\n{reports_sample}")
#     ])
    
#     try:
#         chain = prompt_template | llm_analytic.with_structured_output(EmergingThemesOutput)
#         result = await chain.ainvoke({"reports_sample": "\n---\n".join(sample_contents)})
#         analytic_results['emergingThemes'] = result.emerging_themes
#     except Exception as e:
#         logger.error(f"LLM failed to detect emerging themes: {e}", exc_info=True)
#         analytic_results['emergingThemes'] = ["LLM theme detection failed."]

#     state["analytic_results"] = analytic_results
#     logger.info("Emerging theme detection complete.")
#     return state


async def snapshot_generator(state: AnalyticState) -> AnalyticState:
    """
    Finalizes the analytic results into the AnalyticsSnapshot schema.
    """
    logger.info("Analytic Agent: snapshot_generator started.")
    
    analytic_results = state.get("analytic_results", {})
    
    # Ensure all required fields for AnalyticsSnapshot are present, even if empty/default
    # Use the Pydantic model to validate and structure the final output
    final_snapshot_data = AnalyticsSnapshot(
        snapshotVersion=state["snapshot_version"],
        periodStart=state.get("period_start"),
        periodEnd=state.get("period_end"),
        filtersUsed=state.get("filters_used", {}),
        **analytic_results
    )
    
    # Generate a simple hash of the input data for auditing
    data_to_hash = {
        "raw_reports": state["raw_reports"],
        "raw_ai_reports": state["raw_ai_reports"],
        "period_start": state.get("period_start"),
        "period_end": state.get("period_end")
    }
    json_string = json.dumps(data_to_hash, sort_keys=True, default=str)
    final_snapshot_data.rawDataHash = hashlib.sha256(json_string.encode('utf-8')).hexdigest()

    state["analytic_results"] = final_snapshot_data.dict(by_alias=True, exclude_none=True)
    logger.info("Analytics snapshot generated.")
    return state

async def db_saver_agent(state: AnalyticState) -> AnalyticState:
    """
    Saves the final analytic results to the AnalyticsSnapshot collection in MongoDB.
    """
    logger.info("Analytic Agent: db_saver_agent started.")
    
    if not state.get("analytic_results"):
        logger.error("No analytic results to save to database.")
        return state

    try:
        # Pymongo insert_one expects a dictionary
        insert_result = analytics_collection.insert_one(state["analytic_results"])
        state["analytic_results"]["_id"] = str(insert_result.inserted_id) # Add generated ID back to results
        logger.info(f"Analytics snapshot saved with ID: {insert_result.inserted_id}")
    except Exception as e:
        logger.error(f"Error saving analytic results to DB: {e}", exc_info=True)
        raise

    return state



async def predictive_risk_analyzer(state: AnalyticState) -> AnalyticState:
    """
    Analyzes check-in data to identify students with concerning wellness trends.
    """
    logger.info("Analytic Agent: predictive_risk_analyzer started.")
    analytic_results = state.get("analytic_results", {})
    checkins_df = state.get("checkins_df")
    reports_df = state.get("combined_reports_df")

    proactive_outreach_suggestions = []

    if checkins_df is None or checkins_df.empty:
        logger.warning("No check-in data available for predictive risk analysis.")
        analytic_results['proactiveOutreachSuggestions'] = []
        state["analytic_results"] = analytic_results
        return state

    # Group by student and analyze trends
    for student_id, group in checkins_df.groupby('student_id'):
        group = group.sort_values(by='createdAt')
        if len(group) >= 3: # Need at least 3 data points for a simple trend
            # Rule 1: Consistently low mood
            if group['moodScore'].tail(3).mean() <= 2:
                suggestion = {
                    "studentId": student_id,
                    "riskScore": 0.6,
                    "justification": f"Consistently low mood score (avg {group['moodScore'].tail(3).mean():.1f}/5) over last 3 check-ins."
                }
                proactive_outreach_suggestions.append(suggestion)

            # Rule 2: Persistently high stress
            if group['stressLevel'].tail(3).mean() >= 4:
                 suggestion = {
                    "studentId": student_id,
                    "riskScore": 0.7,
                    "justification": f"Persistently high stress level (avg {group['stressLevel'].tail(3).mean():.1f}/5) over last 3 check-ins."
                }
                 proactive_outreach_suggestions.append(suggestion)
    
    # Cross-reference with high-priority reports if available
    if reports_df is not None and not reports_df.empty:
        high_priority_students = reports_df[reports_df['priority'].isin(['high', 'urgent'])]['owner_id'].unique()
        for suggestion in proactive_outreach_suggestions:
            if suggestion['studentId'] in high_priority_students:
                suggestion['riskScore'] = min(suggestion['riskScore'] + 0.2, 1.0) # Boost risk score
                suggestion['justification'] += " Also submitted a high/urgent priority report."

    analytic_results['proactiveOutreachSuggestions'] = proactive_outreach_suggestions
    state["analytic_results"] = analytic_results
    logger.info(f"Generated {len(proactive_outreach_suggestions)} proactive outreach suggestions.")
    return state

# ---------------- Graph Orchestration ---------------- #

def build_analytic_graph():
    """
    Builds the LangGraph workflow for advanced analytics.
    """
    workflow = StateGraph(AnalyticState)

    workflow.add_node("ingestion", report_ingestion_agent)
    workflow.add_node("preprocessing", data_preprocessing_agent)
    workflow.add_node("sentiment_risk", sentiment_risk_analyzer)
    workflow.add_node("screening_scores", screening_score_aggregator)
    workflow.add_node("stressors_concerns", stressor_concern_extractor)
    workflow.add_node("resource_topics", resource_topic_aggregator)
    workflow.add_node("resolution_metrics", resolution_efficiency_metrics)
    workflow.add_node("user_engagement", user_engagement_metrics)
    workflow.add_node("predictive_risk", predictive_risk_analyzer)
    # workflow.add_node("emerging_themes", emerging_theme_detector_agent) # Uncomment if using LLM agent
    workflow.add_node("snapshot_generation", snapshot_generator)
    workflow.add_node("db_saver", db_saver_agent)

    workflow.set_entry_point("ingestion")
    workflow.add_edge("ingestion", "preprocessing")
    workflow.add_edge("preprocessing", "sentiment_risk")
    workflow.add_edge("sentiment_risk", "screening_scores")
    workflow.add_edge("screening_scores", "stressors_concerns")
    workflow.add_edge("stressors_concerns", "resource_topics")
    workflow.add_edge("resource_topics", "resolution_metrics")
    workflow.add_edge("resolution_metrics", "user_engagement")
    workflow.add_edge("user_engagement", "predictive_risk")
    workflow.add_edge("predictive_risk", "snapshot_generation")
    # workflow.add_edge("user_engagement", "emerging_themes") # Connect if using LLM agent
    # workflow.add_edge("emerging_themes", "snapshot_generation") # Connect if using LLM agent
    workflow.add_edge("user_engagement", "snapshot_generation") # If not using LLM agent
    workflow.add_edge("snapshot_generation", "db_saver")
    workflow.add_edge("db_saver", END)

    return workflow.compile()

analytic_graph_app = build_analytic_graph()