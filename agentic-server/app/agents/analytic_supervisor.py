# agentic-server/app/agents/analytic_supervisor.py

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
import pandas as pd
import json
import hashlib
from collections import Counter
import numpy as np
import os
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, END
from app.utils.logger import get_logger
from app.services.data_fetcher import DataFetcher
from app.schemas.analytics import AnalyticsSnapshot, AIReportFull
from app.db.connect import get_db

# Import Langchain components for NLP
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

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
    raw_volunteers: List[Dict[str, Any]]

    reports_df: Optional[pd.DataFrame]
    ai_reports_df: Optional[pd.DataFrame]
    combined_reports_df: Optional[pd.DataFrame]
    
    analytic_results: Optional[Dict[str, Any]]
    
    snapshot_version: str
    period_start: Optional[datetime]
    period_end: Optional[datetime]
    filters_used: Dict[str, Any]
    raw_checkins: List[Dict[str, Any]]
    checkins_df: Optional[pd.DataFrame]

# ---------------- Analytic Agent Functions ---------------- #

data_fetcher = DataFetcher()
analytics_collection = get_db()["analyticssnapshots"]

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

    if state["raw_reports"]:
        reports_df = pd.DataFrame(state["raw_reports"])
        reports_df['createdAt'] = pd.to_datetime(reports_df['createdAt'])
        reports_df['report_type'] = 'manual'
        reports_df['owner_id'] = reports_df['owner'].astype(str)
        reports_df['assigned_to_id'] = reports_df['assignedTo'].astype(str)
        reports_df = reports_df.drop(columns=['owner', 'assignedTo'], errors='ignore')
        state["reports_df"] = reports_df
        logger.info(f"Processed {len(reports_df)} manual reports into DataFrame.")
    else:
        state["reports_df"] = pd.DataFrame()
        logger.warning("No raw manual reports to preprocess.")

    if state["raw_ai_reports"]:
        ai_reports_list = [AIReportFull(**raw_report).dict(by_alias=True, exclude_none=True) for raw_report in state["raw_ai_reports"]]
        ai_reports_df = pd.DataFrame(ai_reports_list)
        ai_reports_df['createdAt'] = pd.to_datetime(ai_reports_df['createdAt'])
        ai_reports_df['report_type'] = 'ai'
        ai_reports_df['owner_id'] = ai_reports_df['student'].astype(str)
        ai_reports_df = ai_reports_df.drop(columns=['student'], errors='ignore')

        ai_reports_df['sentiment'] = ai_reports_df['standard_report'].apply(lambda x: x.get('risk_assessment', {}).get('sentiment') if isinstance(x, dict) else None)
        ai_reports_df['risk_level'] = ai_reports_df['standard_report'].apply(lambda x: x.get('risk_assessment', {}).get('risk_level') if isinstance(x, dict) else None)
        ai_reports_df['red_flags'] = ai_reports_df['standard_report'].apply(lambda x: x.get('risk_assessment', {}).get('red_flags') if isinstance(x, dict) else [])
        ai_reports_df['phq_9_score'] = ai_reports_df['standard_report'].apply(lambda x: x.get('screening_scores', {}).get('phq_9_score') if isinstance(x, dict) else None)
        ai_reports_df['gad_7_score'] = ai_reports_df['standard_report'].apply(lambda x: x.get('screening_scores', {}).get('gad_7_score') if isinstance(x, dict) else None)
        
        state["ai_reports_df"] = ai_reports_df
        logger.info(f"Processed {len(ai_reports_df)} AI reports into DataFrame.")
    else:
        state["ai_reports_df"] = pd.DataFrame()
        logger.warning("No raw AI reports to preprocess.")

    if not state["reports_df"].empty or not state["ai_reports_df"].empty:
        state["combined_reports_df"] = pd.concat([state["reports_df"], state["ai_reports_df"]], ignore_index=True)
    else:
        state["combined_reports_df"] = pd.DataFrame()
        logger.warning("No reports to combine.")
    
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
    logger.info("Analytic Agent: sentiment_risk_analyzer started.")
    analytic_results = state.get("analytic_results", {})
    df = state["combined_reports_df"]

    if df.empty:
        logger.warning("No combined reports DataFrame for sentiment_risk_analyzer.")
        state["analytic_results"] = analytic_results
        return state

    analytic_results['sentimentDistribution'] = df['sentiment'].value_counts(dropna=True).to_dict()
    analytic_results['riskLevelDistribution'] = df['risk_level'].value_counts(dropna=True).to_dict()
    
    all_red_flags = [flag for flags_list in df['red_flags'].dropna() if isinstance(flags_list, list) for flag in flags_list]
    top_flags = Counter(all_red_flags).most_common(10)
    analytic_results['topRedFlags'] = [{"flag": flag, "count": count} for flag, count in top_flags]

    state["analytic_results"] = analytic_results
    logger.info("Sentiment and Risk analysis complete.")
    return state

async def screening_score_aggregator(state: AnalyticState) -> AnalyticState:
    logger.info("Analytic Agent: screening_score_aggregator started.")
    analytic_results = state.get("analytic_results", {})
    df = state["combined_reports_df"]

    if df.empty:
        state["analytic_results"] = analytic_results
        return state

    analytic_results['avgPHQ9'] = df['phq_9_score'].mean() if 'phq_9_score' in df.columns else 0.0
    analytic_results['avgGAD7'] = df['gad_7_score'].mean() if 'gad_7_score' in df.columns else 0.0
    analytic_results['avgGHQ'] = df['ghq'].mean() if 'ghq' in df.columns else 0.0

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
    logger.info("Analytic Agent: stressor_concern_extractor started.")
    analytic_results = state.get("analytic_results", {})
    df = state["combined_reports_df"]

    if df.empty:
        state["analytic_results"] = analytic_results
        return state

    all_stressors = []
    all_concerns = []
    
    if 'standard_report' in df.columns:
        df['standard_report'].dropna().apply(lambda x: all_stressors.extend(x.get('analytics', {}).get('key_stressors_identified', [])) if isinstance(x, dict) else None)
        df['standard_report'].dropna().apply(lambda x: all_concerns.extend(x.get('summary', {}).get('student_expressed_concerns', [])) if isinstance(x, dict) else None)
    if 'demo_report' in df.columns:
        df['demo_report'].dropna().apply(lambda x: all_concerns.extend(x.get('student_expressed_concerns', [])) if isinstance(x, dict) else None)
    if 'tags' in df.columns:
        df['tags'].dropna().apply(lambda x: all_stressors.extend(x) if isinstance(x, list) else None)

    analytic_results['topStressors'] = [{"stressor": s, "count": c} for s, c in Counter(all_stressors).most_common(10)]
    analytic_results['topStudentConcerns'] = [{"concern": c, "count": count} for c, count in Counter(all_concerns).most_common(10)]

    state["analytic_results"] = analytic_results
    logger.info("Stressor and concern extraction complete.")
    return state

async def resource_topic_aggregator(state: AnalyticState) -> AnalyticState:
    logger.info("Analytic Agent: resource_topic_aggregator started.")
    analytic_results = state.get("analytic_results", {})
    df = state["ai_reports_df"]

    if df.empty:
        analytic_results['topSuggestedResourceTopics'] = []
        state["analytic_results"] = analytic_results
        return state

    all_resource_topics = []
    if 'demo_report' in df.columns:
         df['demo_report'].dropna().apply(lambda x: all_resource_topics.extend(x.get('suggested_resource_topics', [])) if isinstance(x, dict) else None)

    analytic_results['topSuggestedResourceTopics'] = [{"topic": t, "count": c} for t, c in Counter(all_resource_topics).most_common(10)]
    state["analytic_results"] = analytic_results
    logger.info("Resource topic aggregation complete.")
    return state

async def resolution_efficiency_metrics(state: AnalyticState) -> AnalyticState:
    logger.info("Analytic Agent: resolution_efficiency_metrics started.")
    analytic_results = state.get("analytic_results", {})
    df = state["reports_df"]

    if df.empty:
        state["analytic_results"] = analytic_results
        return state

    analytic_results['reportsByStatus'] = df['status'].value_counts(dropna=False).to_dict()
    resolved_reports = df[df['status'] == 'resolved'].copy()
    if not resolved_reports.empty:
        resolved_reports['resolvedAt'] = pd.to_datetime(resolved_reports['resolvedAt'])
        resolved_reports['resolution_duration'] = (resolved_reports['resolvedAt'] - resolved_reports['createdAt']).dt.total_seconds() / (3600 * 24)
        analytic_results['avgReportResolutionTimeDays'] = resolved_reports['resolution_duration'].mean()
    else:
        analytic_results['avgReportResolutionTimeDays'] = 0.0

    if 'assigned_to_id' in df.columns and not state["raw_counsellors"].empty:
        counsellors_df = pd.DataFrame(state["raw_counsellors"])
        resolved_counts = df[df['status'] == 'resolved']['assigned_to_id'].value_counts().reset_index()
        resolved_counts.columns = ['counsellorId', 'resolvedCount']
        
        if not resolved_counts.empty:
            top_counsellors = pd.merge(resolved_counts, counsellors_df[['_id', 'name']], left_on='counsellorId', right_on='_id', how='left')
            top_counsellors['name'] = top_counsellors['name'].fillna("Unknown Counsellor")
            analytic_results['topCounsellorsByReportsResolved'] = top_counsellors.head(5).to_dict(orient='records')
        else:
            analytic_results['topCounsellorsByReportsResolved'] = []
    else:
        analytic_results['topCounsellorsByReportsResolved'] = []

    state["analytic_results"] = analytic_results
    logger.info("Resolution efficiency metrics complete.")
    return state

async def user_engagement_metrics(state: AnalyticState) -> AnalyticState:
    logger.info("Analytic Agent: user_engagement_metrics started.")
    analytic_results = state.get("analytic_results", {})
    
    if not state["raw_students"]:
        state["analytic_results"] = analytic_results
        return state

    students_df = pd.DataFrame(state["raw_students"])
    if 'lastActive' not in students_df.columns:
        state["analytic_results"] = analytic_results
        return state

    students_df['lastActive'] = pd.to_datetime(students_df['lastActive'])
    period_end = state.get("period_end") or datetime.now(timezone.utc)
    period_start = state.get("period_start") or (period_end - timedelta(days=30))
    active_students_in_period = students_df[(students_df['lastActive'] >= period_start) & (students_df['lastActive'] <= period_end)]

    analytic_results['totalStudentsEngaged'] = active_students_in_period['_id'].nunique()
    analytic_results['activeStudentsDaily'] = {str(date): count for date, count in active_students_in_period.groupby(active_students_in_period['lastActive'].dt.date)['_id'].nunique().items()}
    analytic_results['activeStudentsWeekly'] = {str(period): count for period, count in active_students_in_period.groupby(active_students_in_period['lastActive'].dt.to_period('W'))['_id'].nunique().items()}
    analytic_results['activeStudentsMonthly'] = {str(period): count for period, count in active_students_in_period.groupby(active_students_in_period['lastActive'].dt.to_period('M'))['_id'].nunique().items()}

    state["analytic_results"] = analytic_results
    logger.info("User engagement metrics complete.")
    return state

class EmergingThemesOutput(BaseModel):
    emerging_themes: List[str] = Field(..., description="List of 3-5 distinct, emerging mental health themes or trends observed in the provided text samples.")

llm_analytic = ChatGoogleGenerativeAI(model=os.getenv("LLM_MODEL")) 

async def emerging_theme_detector_agent(state: AnalyticState) -> AnalyticState:
    logger.info("Analytic Agent: emerging_theme_detector_agent started.")
    analytic_results = state.get("analytic_results", {})
    df = state["combined_reports_df"]

    if df.empty or 'content' not in df.columns:
        analytic_results['emergingThemes'] = []
        state["analytic_results"] = analytic_results
        return state

    sample_contents = df['content'].dropna().sample(n=min(50, len(df.dropna())), replace=False).tolist()
    
    if not sample_contents:
        analytic_results['emergingThemes'] = []
        state["analytic_results"] = analytic_results
        return state

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "You are an expert mental health analyst. Read the following anonymous student report summaries and identify 3-5 distinct, emerging mental health themes or trends. Focus on patterns. Output as a JSON list of themes."),
        ("user", "Analyze these reports:\n\n---\n\n{reports_sample}")
    ])
    
    try:
        chain = prompt_template | llm_analytic.with_structured_output(EmergingThemesOutput)
        reports_sample_text = "\n\n---\n\n".join(map(str, sample_contents))
        result = await chain.ainvoke({"reports_sample": reports_sample_text})
        analytic_results['emergingThemes'] = result.emerging_themes
        logger.info(f"LLM detected emerging themes: {result.emerging_themes}")
    except Exception as e:
        logger.error(f"LLM failed to detect emerging themes: {e}", exc_info=True)
        analytic_results['emergingThemes'] = ["LLM detection failed."]

    state["analytic_results"] = analytic_results
    return state

async def snapshot_generator(state: AnalyticState) -> AnalyticState:
    logger.info("Analytic Agent: snapshot_generator started.")
    analytic_results = state.get("analytic_results", {})
    final_snapshot_data = AnalyticsSnapshot(
        snapshotVersion=state["snapshot_version"],
        periodStart=state.get("period_start"),
        periodEnd=state.get("period_end"),
        filtersUsed=state.get("filters_used", {}),
        **analytic_results
    )
    
    data_to_hash = json.dumps({
        "raw_reports": state["raw_reports"],
        "raw_ai_reports": state["raw_ai_reports"],
        "period_start": state.get("period_start"),
        "period_end": state.get("period_end")
    }, sort_keys=True, default=str)
    final_snapshot_data.rawDataHash = hashlib.sha256(data_to_hash.encode('utf-8')).hexdigest()

    state["analytic_results"] = final_snapshot_data.dict(by_alias=True, exclude_none=True)
    logger.info("Analytics snapshot generated.")
    return state

async def db_saver_agent(state: AnalyticState) -> AnalyticState:
    logger.info("Analytic Agent: db_saver_agent started.")
    if not state.get("analytic_results"):
        return state
    try:
        insert_result = analytics_collection.insert_one(state["analytic_results"])
        state["analytic_results"]["_id"] = str(insert_result.inserted_id)
        logger.info(f"Analytics snapshot saved with ID: {insert_result.inserted_id}")
    except Exception as e:
        logger.error(f"Error saving analytic results to DB: {e}", exc_info=True)
        raise
    return state

async def predictive_risk_analyzer(state: AnalyticState) -> AnalyticState:
    logger.info("Analytic Agent: predictive_risk_analyzer started.")
    analytic_results = state.get("analytic_results", {})
    checkins_df = state.get("checkins_df")

    if checkins_df is None or checkins_df.empty:
        analytic_results['proactiveOutreachSuggestions'] = []
        state["analytic_results"] = analytic_results
        return state

    proactive_outreach_suggestions = []
    for student_id, group in checkins_df.groupby('student_id'):
        group = group.sort_values(by='createdAt')
        if len(group) >= 3:
            if group['moodScore'].tail(3).mean() <= 2:
                proactive_outreach_suggestions.append({ "studentId": student_id, "riskScore": 0.6, "justification": f"Low mood (avg {group['moodScore'].tail(3).mean():.1f}/5)." })
            if group['stressLevel'].tail(3).mean() >= 4:
                proactive_outreach_suggestions.append({ "studentId": student_id, "riskScore": 0.7, "justification": f"High stress (avg {group['stressLevel'].tail(3).mean():.1f}/5)." })

    analytic_results['proactiveOutreachSuggestions'] = proactive_outreach_suggestions
    state["analytic_results"] = analytic_results
    logger.info(f"Generated {len(proactive_outreach_suggestions)} outreach suggestions.")
    return state

# ---------------- Graph Orchestration ---------------- #

def build_analytic_graph():
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
    workflow.add_node("emerging_themes", emerging_theme_detector_agent)
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
    workflow.add_edge("predictive_risk", "emerging_themes")
    workflow.add_edge("emerging_themes", "snapshot_generation")
    workflow.add_edge("snapshot_generation", "db_saver")
    workflow.add_edge("db_saver", END)

    return workflow.compile()

analytic_graph_app = build_analytic_graph()