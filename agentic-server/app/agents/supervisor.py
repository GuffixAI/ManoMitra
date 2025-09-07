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

os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
logger = get_logger(__name__)

# Use a more capable model for analysis and generation
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")

# ---------------- Pydantic Output Models for Agents ---------------- #

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

async def resource_retrieval_agent(state: AgentState) -> Dict[str, Any]:
    logger.info("Running Resource Retrieval Agent...")
    topics = state["summary"].suggested_resource_topics
    all_found_resources = []

    # Use a set to avoid duplicate URLs
    seen_urls = set()

    # FIX: Create a prompt with the required 'agent_scratchpad' variable
    search_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are a helpful research assistant."),
            ("user", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )
    
    agent = create_tool_calling_agent(llm, all_tools, search_prompt)
    executor = AgentExecutor(agent=agent, tools=all_tools, verbose=True)

    # 1. Search for Videos and Audio
    video_query = f"Find helpful YouTube videos about: {', '.join(topics)}"
    video_results = await executor.ainvoke({"input": video_query})
    # Process and add results... (This part needs parsing logic based on tool output)

    # 2. Search for Articles and Guides
    article_query = f"Find practical articles, guides, and coping strategies for: {', '.join(topics)}"
    article_results = await executor.ainvoke({"input": article_query})
    # Process and add results...

    # For this example, we will use the simplified output from your log for brevity
    # In a real implementation, you would parse the output of each executor call
    retrieved_content = your_original_retrieved_content_from_the_log # Placeholder
    
    state["retrieved_resources"] = [{"title": "Retrieved Resources", "content": retrieved_content}] # Simplified for example
    logger.info("Resource Retrieval complete.")
    return state

def report_generator(state: AgentState) -> Dict[str, Any]:
    logger.info("Running Report Generator Agent...")
    
    # Data from state
    summary = state["summary"]
    risk = state["sentiment_risk"]
    scores = state["screening_scores"]
    # Assuming retrieved_resources is populated correctly in a real scenario
    resources_raw = state.get("retrieved_resources", [{"content": ""}])[0]['content']

    # ---- Build Demo Report (Student-Facing) ----
    demo_report = DemoReport(
        student_summary=summary.chat_summary_student,
        key_takeaways=[f"Addressing feelings around {s.lower()}" for s in summary.key_stressors],
        suggested_first_steps=[
            "Take a moment for yourself with a short, guided breathing exercise.",
            "Browse one of the articles below that feels most relevant to you right now.",
            "Consider scheduling a confidential chat with a campus counselor. It's a free and supportive service."
        ],
        helpful_resources=DemoResources(
            videos_and_audio=[DemoResource(title="5-Minute Meditation", url="https://youtube.com/...", description="A short video to help calm your mind when you feel overwhelmed.")],
            articles_and_guides=[DemoResource(title="Coping with Exam Stress", url="https://helpguide.org/...", description="An article with practical tips for managing stress during exam season.")],
            on_campus_support=[DemoResource(title="Book a Counselor Appointment", url="https://yourcollege.edu/counseling", description="Your link to schedule a private session with a professional counselor on campus.")]
        ),
        message_of_encouragement="Please remember, it's okay to not be okay, and reaching out for support is a sign of strength. You've already taken a positive step. We're here to help."
    )

    # ---- Build Standard Report (Counselor-Facing) ----
    standard_report = StandardReport(
        chat_summary=summary.chat_summary_clinical,
        risk_assessment=RiskAssessment(**risk.dict()),
        screening_scores=ScreeningScores(**scores.dict()),
        counselor_recommendations=CounselorRecommendations(
            recommended_resources=[
                RecommendedResource(
                    category="Psychoeducational Guide",
                    title="HelpGuide.org: A trusted guide to mental health",
                    url="https://www.helpguide.org/",
                    relevance="Provides evidence-based, easy-to-understand information on anxiety, stress, and sleep issues that can be shared with the student.",
                    source_tool="tavily_search"
                ),
                RecommendedResource(
                    category="University Mental Health Portal",
                    title="Georgia Tech Self-Help Resources",
                    url="https://mentalhealth.gatech.edu/resources/students/self-help-resources",
                    relevance="Example of a well-structured university resource hub for student self-help.",
                    source_tool="tavily_search"
                )
            ],
            suggested_next_steps=[
                "Prioritize student for outreach due to high GAD-7 score and expressed feelings of isolation.",
                "In initial session, explore the theme of 'fear of failure' and its connection to academic pressure.",
                "Introduce psychoeducation on the connection between anxiety, sleep disruption, and concentration."
            ]
        ),
        analytics=ClinicalAnalytics(
            key_stressors_identified=summary.key_stressors,
            potential_underlying_issues=["Perfectionism", "Imposter Syndrome", "Lack of effective study/coping strategies"]
        ),
        report_generated_at=datetime.utcnow()
    )

    state["final_report"] = {
        "demo_report": demo_report.dict(),
        "standard_report": standard_report.dict()
    }
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