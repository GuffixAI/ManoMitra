# app/agents/supervisor.py

# FIX: Add MessagesPlaceholder to the imports
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict, Any, Optional
from datetime import datetime
import os
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from ..config import GOOGLE_API_KEY
from ..tools.search_tools import all_tools
from ..schemas.demo_report import DemoReport, HelpfulResources as DemoResources, Resource as DemoResource
from ..schemas.standard_report import StandardReport, RiskAssessment, ScreeningScores, CounselorRecommendations, RecommendedResource, ClinicalAnalytics
from ..utils.logger import get_logger
import re
from urllib.parse import urlparse


os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
logger = get_logger(__name__)

# Use a more capable model for analysis and generation
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")

# ---------------- Pydantic Output Models for Agents ---------------- #

URL_REGEX = re.compile(r"https?://[^\s)\]}>,]+", re.IGNORECASE)

def _ensure_list(x):
    return x if isinstance(x, list) else ([] if x is None else [x])

def _domain(url: str) -> str:
    try:
        return urlparse(url).netloc
    except Exception:
        return ""

def _parse_urls_from_text(text: str):
    if not isinstance(text, str):
        return []
    return URL_REGEX.findall(text)

def _parse_youtube_result(raw) -> List[Dict[str, Any]]:
    """Normalize YouTube tool outputs into [{title,url,description,type,source_tool}]"""
    print("[parse_youtube] raw type:", type(raw))
    results: List[Dict[str, Any]] = []

    # Common: agent returns dict with 'output' and 'intermediate_steps'
    if isinstance(raw, dict):
        # 1) If tool returned a structured list directly
        if isinstance(raw.get("results"), list):
            for item in raw["results"]:
                url = item.get("link") or item.get("url") or ""
                title = item.get("title") or item.get("name") or "Untitled"
                desc = item.get("description") or item.get("content") or ""
                if url and ("youtube.com" in url or "youtu.be" in url):
                    results.append({
                        "title": title,
                        "url": url,
                        "description": desc,
                        "type": "video",
                        "source_tool": "youtube_search",
                    })
        # 2) Fallback: parse any URLs in 'output' text
        out = raw.get("output")
        if isinstance(out, str):
            for url in _parse_urls_from_text(out):
                if "youtube.com" in url or "youtu.be" in url:
                    results.append({
                        "title": "YouTube Video",
                        "url": url,
                        "description": "",
                        "type": "video",
                        "source_tool": "youtube_search",
                    })
        # 3) Try to mine intermediate steps text for links (if present)
        for step in _ensure_list(raw.get("intermediate_steps")):
            if isinstance(step, (list, tuple)) and len(step) >= 2:
                obs = step[1]
                if isinstance(obs, str):
                    for url in _parse_urls_from_text(obs):
                        if "youtube.com" in url or "youtu.be" in url:
                            results.append({
                                "title": "YouTube Video",
                                "url": url,
                                "description": "",
                                "type": "video",
                                "source_tool": "youtube_search",
                            })

    elif isinstance(raw, list):
        # Some tools return a list of dicts directly
        for item in raw:
            if not isinstance(item, dict):
                continue
            url = item.get("link") or item.get("url") or ""
            title = item.get("title") or item.get("name") or "Untitled"
            desc = item.get("description") or item.get("content") or ""
            if url and ("youtube.com" in url or "youtu.be" in url):
                results.append({
                    "title": title,
                    "url": url,
                    "description": desc,
                    "type": "video",
                    "source_tool": "youtube_search",
                })

    elif isinstance(raw, str):
        # Plain text: extract links
        for url in _parse_urls_from_text(raw):
            if "youtube.com" in url or "youtu.be" in url:
                results.append({
                    "title": "YouTube Video",
                    "url": url,
                    "description": "",
                    "type": "video",
                    "source_tool": "youtube_search",
                })

    print(f"[parse_youtube] parsed {len(results)} items")
    return results


def _parse_tavily_result(raw) -> List[Dict[str, Any]]:
    """Normalize Tavily outputs into [{title,url,description,type,source_tool}]"""
    print("[parse_tavily] raw type:", type(raw))
    results: List[Dict[str, Any]] = []

    if isinstance(raw, dict):
        if isinstance(raw.get("results"), list):
            for item in raw["results"]:
                url = item.get("url") or ""
                title = item.get("title") or "Untitled"
                desc = item.get("content") or item.get("raw_content") or ""
                if url:
                    results.append({
                        "title": title,
                        "url": url,
                        "description": desc,
                        "type": "article",
                        "source_tool": "tavily_search",
                    })
        # Also parse any urls in 'answer'/'output'
        for key in ("answer", "output"):
            if isinstance(raw.get(key), str):
                for url in _parse_urls_from_text(raw[key]):
                    results.append({
                        "title": "Web Resource",
                        "url": url,
                        "description": "",
                        "type": "article",
                        "source_tool": "tavily_search",
                    })

    elif isinstance(raw, list):
        for item in raw:
            if not isinstance(item, dict):
                continue
            url = item.get("url") or ""
            title = item.get("title") or "Untitled"
            desc = item.get("content") or item.get("raw_content") or ""
            if url:
                results.append({
                    "title": title,
                    "url": url,
                    "description": desc,
                    "type": "article",
                    "source_tool": "tavily_search",
                })

    elif isinstance(raw, str):
        for url in _parse_urls_from_text(raw):
            results.append({
                "title": "Web Resource",
                "url": url,
                "description": "",
                "type": "article",
                "source_tool": "tavily_search",
            })

    print(f"[parse_tavily] parsed {len(results)} items")
    return results


class SentimentRiskOutput(BaseModel):
    """Structured output for Sentiment and Risk Analysis."""
    sentiment: str
    emotional_intensity: str
    risk_level: str
    red_flags: List[str]

class ScreeningScoresOutput(BaseModel):
    """Structured output for Screening Scores."""
    phq_9_score: int
    gad_7_score: int
    interpretation: str

class SummaryOutput(BaseModel):
    """Structured output for Conversation Summary."""
    chat_summary_clinical: str
    chat_summary_student: str
    key_stressors: List[str]
    student_expressed_concerns: List[str]
    suggested_resource_topics: List[str]

# ---------------- Agent State ---------------- #

class AgentState(TypedDict):
    conversation_history: str
    sentiment_risk: Optional[SentimentRiskOutput]
    screening_scores: Optional[ScreeningScoresOutput]
    summary: Optional[SummaryOutput]
    retrieved_resources: Optional[List[Dict]]
    final_report: Optional[Dict]

# ---------------- Agent Functions (Now with LLM) ---------------- #

async def sentiment_risk_agent(state: AgentState) -> Dict[str, Any]:
    logger.info("Running Sentiment & Risk Analyzer Agent...")
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a clinical psychologist analyzing a student's conversation for sentiment and risk factors.
         Analyze the conversation and provide your assessment based on the following criteria:
         - Sentiment: Predominant feeling (e.g., Anxious, Depressed, Overwhelmed, Stressed).
         - Emotional Intensity: How strong are the emotions? (Low, Moderate, High).
         - Risk Level: Assess the immediate risk. (Low, Medium, High).
         - Red Flags: Identify specific keywords or themes of concern (e.g., hopelessness, isolation, panic attacks, worthlessness, severe sleep deprivation)."""),
        ("user", "Here is the conversation history:\n\n{conversation}")
    ])
    
    analyzer_chain = prompt | llm.with_structured_output(SentimentRiskOutput)
    result = await analyzer_chain.ainvoke({"conversation": state["conversation_history"]})
    
    state["sentiment_risk"] = result
    logger.info(f"Sentiment Analysis complete: {result}")
    return state

async def screening_agent(state: AgentState) -> Dict[str, Any]:
    logger.info("Running Screening Agent...")
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a psychological assessment expert. Based on the student's conversation, estimate their scores on the PHQ-9 (for depression) and GAD-7 (for anxiety) scales.
         These are estimations, not a formal diagnosis.
         Provide the estimated scores and a brief clinical interpretation."""),
        ("user", "Here is the conversation history:\n\n{conversation}")
    ])

    screener_chain = prompt | llm.with_structured_output(ScreeningScoresOutput)
    result = await screener_chain.ainvoke({"conversation": state["conversation_history"]})
    
    state["screening_scores"] = result
    logger.info(f"Screening Scores estimated: {result}")
    return state

async def conversation_summarizer_agent(state: AgentState) -> Dict[str, Any]:
    logger.info("Running Conversation Summarizer Agent...")
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert summarizer. Analyze the conversation and create multiple summaries:
         1.  `chat_summary_clinical`: A concise, objective summary for a counselor.
         2.  `chat_summary_student`: An empathetic summary for the student, using "you" language.
         3.  `key_stressors`: A list of the primary factors causing distress.
         4.  `student_expressed_concerns`: A list of the main problems the student explicitly mentioned.
         5.  `suggested_resource_topics`: A list of 3-4 specific topics to search for resources on (e.g., 'time management for students', 'guided meditation for sleep anxiety', 'overcoming fear of failure')."""),
        ("user", "Here is the conversation history:\n\n{conversation}")
    ])

    summarizer_chain = prompt | llm.with_structured_output(SummaryOutput)
    result = await summarizer_chain.ainvoke({"conversation": state["conversation_history"]})

    state["summary"] = result
    logger.info(f"Summarization complete.")
    return state

# ---------------- Resource Retrieval Agent ---------------- #

async def resource_retrieval_agent(state: AgentState) -> Dict[str, Any]:
    logger.info("Running Resource Retrieval Agent...")
    print("\n[retriever] START ------------------------------------")
    topics = state["summary"].suggested_resource_topics
    print(f"[retriever] topics ({len(topics)}): {topics}")

    # Map tools by name for direct calls
    tool_map = {t.name: t for t in all_tools}
    print(f"[retriever] available tools: {list(tool_map.keys())}")

    yt_tool = tool_map.get("youtube_search")
    tavily_tool = tool_map.get("tavily_search")

    all_resources: List[Dict[str, Any]] = []
    seen_urls: set[str] = set()

    # Helper to insert with dedupe + prints
    def _add_resources(tag: str, items: List[Dict[str, Any]], topic: str):
        print(f"[retriever] adding {len(items)} {tag} items for topic '{topic}'")
        added = 0
        for r in items:
            url = (r.get("url") or "").strip()
            if not url:
                continue
            if url in seen_urls:
                print(f"[retriever] skip duplicate: {url}")
                continue
            r["source_topic"] = topic
            all_resources.append(r)
            seen_urls.add(url)
            added += 1
        print(f"[retriever] added {added}/{len(items)} new items (unique so far: {len(seen_urls)})")

    # Query per topic
    for idx, topic in enumerate(topics):
        print(f"\n[retriever] === Topic {idx+1}/{len(topics)}: '{topic}' ===")

        # ---- YouTube (videos) ----
        if yt_tool is not None:
            yt_query = f"{topic},5"  # required format: "query,NUM"
            print(f"[retriever][youtube] query: {yt_query}")
            try:
                yt_raw = await yt_tool.ainvoke(yt_query)
                print("[retriever][youtube] RAW:", yt_raw)
                yt_parsed = _parse_youtube_result(yt_raw)
                print("[retriever][youtube] PARSED:", yt_parsed)
                _add_resources("youtube", yt_parsed, topic)
            except Exception as e:
                logger.error(f"YouTube retrieval error for '{topic}': {e}")
                print(f"[retriever][youtube] ERROR: {e}")
        else:
            print("[retriever][youtube] tool not available")

        # ---- Tavily (articles) ----
        if tavily_tool is not None:
            tavily_query = {"query": topic, "include_images": False}
            print(f"[retriever][tavily] query: {tavily_query}")
            try:
                tavily_raw = await tavily_tool.ainvoke(tavily_query)
                print("[retriever][tavily] RAW:", tavily_raw)
                tavily_parsed = _parse_tavily_result(tavily_raw)
                print("[retriever][tavily] PARSED:", tavily_parsed)
                _add_resources("tavily", tavily_parsed, topic)
            except Exception as e:
                logger.error(f"Tavily retrieval error for '{topic}': {e}")
                print(f"[retriever][tavily] ERROR: {e}")
        else:
            print("[retriever][tavily] tool not available")

    print(f"\n[retriever] total unique resources collected: {len(all_resources)}")
    # Persist as-is (no static fallbacks)
    state["retrieved_resources"] = all_resources
    logger.info("Resource Retrieval complete.")
    print("[retriever] END --------------------------------------\n")
    return state

# ---------------- Report Generator Agent ---------------- #

def report_generator(state: AgentState) -> Dict[str, Any]:
    logger.info("Running Report Generator Agent...")
    print("\n[report] START ---------------------------------------")

    summary: SummaryOutput = state["summary"]
    risk: SentimentRiskOutput = state["sentiment_risk"]
    scores: ScreeningScoresOutput = state["screening_scores"]

    print("[report] summary:", summary)
    print("[report] risk:", risk)
    print("[report] scores:", scores)

    raw_resources: List[Dict[str, Any]] = state.get("retrieved_resources") or []
    print(f"[report] raw_resources count: {len(raw_resources)}")
    print("[report] raw_resources sample (up to 3):", raw_resources[:3])

    # Group resources
    videos_raw = [r for r in raw_resources if r.get("type") == "video"]
    articles_raw = [r for r in raw_resources if r.get("type") == "article"]
    print(f"[report] videos_raw: {len(videos_raw)}  articles_raw: {len(articles_raw)}")

    # Convert to DemoResource objects
    def _to_demo_resource(r: Dict[str, Any]) -> DemoResource:
        return DemoResource(
            title=(r.get("title") or "Untitled"),
            url=(r.get("url") or ""),
            description=(r.get("description") or ""),
        )

    videos = [_to_demo_resource(r) for r in videos_raw]
    articles = [_to_demo_resource(r) for r in articles_raw]

    print(f"[report] videos for demo: {len(videos)}")
    for i, v in enumerate(videos[:3]):
        print(f"[report] video[{i}]:", v)

    print(f"[report] articles for demo: {len(articles)}")
    for i, a in enumerate(articles[:3]):
        print(f"[report] article[{i}]:", a)

    # Build HelpfulResources from dynamic data ONLY (no static)
    demo_resources = DemoResources(
        videos_and_audio=videos,
        articles_and_guides=articles,
        on_campus_support=[],  # kept empty since you requested zero static data
    )

    # Dynamic key takeaways from stressors
    key_takes = [f"Addressing feelings around {s.lower()}" for s in summary.key_stressors]
    print("[report] key_takeaways:", key_takes)

    # Dynamic suggested first steps based on what's available
    first_steps: List[str] = []
    if videos:
        first_steps.append("Pick one short video from the list and try it today.")
    if articles:
        first_steps.append("Open one article below and note 1–2 ideas to try this week.")
    # Always include a self-reg step; still dynamic wording
    first_steps.append("Try a 2-minute breathing break when emotions spike.")

    print("[report] suggested_first_steps:", first_steps)

    # ---- Build Demo Report (Student-Facing) ----
    demo_report = DemoReport(
        student_summary=summary.chat_summary_student,
        key_takeaways=key_takes,
        suggested_first_steps=first_steps,
        helpful_resources=demo_resources,
        message_of_encouragement=(
            "You took a real step by talking about this. Be gentle with yourself; small actions count."
        ),
    )
    print("[report] demo_report constructed.")

    # ---- Counselor-facing: derive recommendations from retrieved resources ----
    # Use top articles (up to 5) as recommended resources; fall back to videos if no articles
    counselor_source_pool = articles_raw if articles_raw else videos_raw
    print(f"[report] counselor_source_pool size: {len(counselor_source_pool)} (articles first, else videos)")

    recs = []
    for r in counselor_source_pool[:5]:
        recs.append(
            RecommendedResource(
                category=("Article" if r.get("type") == "article" else "Video"),
                title=(r.get("title") or "Untitled"),
                url=(r.get("url") or ""),
                relevance=f"Matches topics: {', '.join(summary.suggested_resource_topics)}; domain: {_domain(r.get('url',''))}",
                source_tool=(r.get("source_tool") or "unknown"),
            )
        )
    print(f"[report] counselor recommended_resources: {len(recs)}")

    # Dynamic suggested next steps from stressors + available resources
    dynamic_steps: List[str] = []
    for s in summary.key_stressors[:3]:
        dynamic_steps.append(f"Explore stressor: {s} and its impact on daily functioning.")
    if videos_raw or articles_raw:
        dynamic_steps.append(
            f"Share {len(videos_raw)} video(s) and {len(articles_raw)} article(s) aligned to: {', '.join(summary.suggested_resource_topics)}."
        )
    # Tie to screening data
    dynamic_steps.append(
        f"Monitor symptoms consistent with PHQ-9={scores.phq_9_score}, GAD-7={scores.gad_7_score}; consider follow-up screening in 2–4 weeks."
    )

    print("[report] counselor suggested_next_steps:", dynamic_steps)

    standard_report = StandardReport(
        chat_summary=summary.chat_summary_clinical,
        risk_assessment=RiskAssessment(**risk.dict()),
        screening_scores=ScreeningScores(**scores.dict()),
        counselor_recommendations=CounselorRecommendations(
            recommended_resources=recs,
            suggested_next_steps=dynamic_steps,
        ),
        analytics=ClinicalAnalytics(
            key_stressors_identified=summary.key_stressors,
            potential_underlying_issues=[
                # purely illustrative and dynamic-friendly suggestions; feel free to adjust upstream
                "Cognitive distortions related to loss/achievement",
                "Sleep disturbance impacting concentration",
                "Reduced social support/connectedness",
            ],
        ),
        report_generated_at=datetime.utcnow(),
    )
    print("[report] standard_report constructed.")

    state["final_report"] = {
        "demo_report": demo_report.dict(),
        "standard_report": standard_report.dict(),
    }
    print("[report] final_report keys:", list(state["final_report"].keys()))
    print("[report] END -----------------------------------------\n")
    return state

# ---------------- Graph Orchestration (Same as before) ---------------- #
def build_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("sentiment_risk", sentiment_risk_agent)
    workflow.add_node("screening", screening_agent)
    workflow.add_node("summarizer", conversation_summarizer_agent)
    workflow.add_node("retriever", resource_retrieval_agent)
    workflow.add_node("report_generator", report_generator)

    workflow.set_entry_point("sentiment_risk")
    workflow.add_edge("sentiment_risk", "screening")
    workflow.add_edge("screening", "summarizer")
    workflow.add_edge("summarizer", "retriever")
    workflow.add_edge("retriever", "report_generator")
    workflow.add_edge("report_generator", END)

    return workflow.compile()

graph_app = build_graph()

# Placeholder for the resource content from your original log for the generator function
your_original_retrieved_content_from_the_log = """
Here are some resources... (the full text blob from your log)
"""