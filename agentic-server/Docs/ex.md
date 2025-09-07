# app/agents/supervisor.py

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict, Any, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from ..config import GOOGLE_API_KEY
from ..tools.search_tools import all_tools
from ..schemas.demo_report import DemoReport
from ..schemas.standard_report import StandardReport
from ..utils.logger import get_logger
import datetime

os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

# --- Initialize Logger and LLM ---
logger = get_logger(__name__)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

# --- Agent State Definition ---
class AgentState(TypedDict):
    conversation_history: str
    sentiment_analysis: Optional[Dict]
    screening_scores: Optional[Dict]
    summary: Optional[Dict]
    resource_categories: Optional[Dict]
    retrieved_resources: Optional[List[Dict]]
    matched_resources: Optional[List[Dict]]
    final_report: Optional[Dict]

# --- Pydantic Models for Agent Outputs ---
class SentimentRiskOutput(BaseModel):
    sentiment: str
    emotional_intensity: str
    risk_level: str
    red_flags: List[str] = []

class ScreeningOutput(BaseModel):
    phq_9: int
    gad_7: int
    ghq: int

class SummaryOutput(BaseModel):
    chat_summary: str
    key_points: List[str]
    student_expressed_concerns: List[str]

class RecommendationOutput(BaseModel):
    recommended_categories: List[str]
    justification: str

class ResourceMatcherOutput(BaseModel):
    matched_resources: List[Dict]

class FinalReportOutput(BaseModel):
    demo_report: DemoReport
    standard_report: StandardReport

# --- Agent Functions (Nodes) ---
def sentiment_risk_analyzer_agent(state: AgentState) -> AgentState:
    logger.info("Running Sentiment & Risk Analyzer Agent...")
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Sentiment & Risk Analyzer Agent. 
        Analyze the student conversation for sentiment, emotional intensity, and red-flag risks.
        Output a JSON object."""), 
        ("user", "Conversation:\n\n{conversation_history}")
    ])
    chain = prompt | llm.with_structured_output(SentimentRiskOutput)
    result = chain.invoke({"conversation_history": state["conversation_history"]})
    logger.info(f"Sentiment Analysis: {result}")
    return {"sentiment_analysis": result.dict()}

def screening_agent(state: AgentState) -> AgentState:
    logger.info("Running Screening Agent...")
    prompt = ChatPromptTemplate.from_messages([
        ("system", """Estimate standardized screening scores (PHQ-9, GAD-7, GHQ) from conversation history.
        Output a JSON object."""), 
        ("user", "Conversation:\n\n{conversation_history}")
    ])
    chain = prompt | llm.with_structured_output(ScreeningOutput)
    result = chain.invoke({"conversation_history": state["conversation_history"]})
    logger.info(f"Screening Scores: {result}")
    return {"screening_scores": result.dict()}

def conversation_summarizer_agent(state: AgentState) -> AgentState:
    logger.info("Running Conversation Summarizer Agent...")
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Summarize conversation with key points and expressed concerns."),
        ("user", "Conversation:\n\n{conversation_history}")
    ])
    chain = prompt | llm.with_structured_output(SummaryOutput)
    result = chain.invoke({"conversation_history": state["conversation_history"]})
    logger.info(f"Summary: {result}")
    return {"summary": result.dict()}

def recommendation_agent(state: AgentState) -> AgentState:
    logger.info("Running Recommendation Agent...")
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Recommend categories of resources based on analysis, screening scores, and summary."),
        ("user", """Sentiment Analysis: {sentiment_analysis}
        Screening Scores: {screening_scores}
        Summary: {summary}""")
    ])
    chain = prompt | llm.with_structured_output(RecommendationOutput)
    result = chain.invoke({
        "sentiment_analysis": state["sentiment_analysis"],
        "screening_scores": state["screening_scores"],
        "summary": state["summary"]
    })
    logger.info(f"Recommended Categories: {result}")
    return {"resource_categories": result.dict()}

def resource_retrieval_agent(state: AgentState) -> AgentState:
    logger.info("Running Resource Retrieval Agent...")
    categories = state["resource_categories"]["recommended_categories"]
    concerns = state["summary"]["student_expressed_concerns"]
    query = f"Find resources about {', '.join(concerns)} focusing on the categories: {', '.join(categories)}"

    prompt = ChatPromptTemplate.from_messages([
        ("system", "Use the available tools to find resources."),
        ("user", "{input}")
    ])
    
    agent = create_tool_calling_agent(llm, all_tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=all_tools, verbose=True)
    
    result = agent_executor.invoke({"input": query})
    logger.info(f"Retrieved Resources raw output: {result['output']}")

    # --- Standardize resources ---
    structured_resources = []
    # If output is a string, split by lines or use a placeholder structure
    raw = result.get("output", "")
    if isinstance(raw, str):
        # Simple fallback: wrap as one resource
        structured_resources.append({"title": "Retrieved Resources", "url": "", "category": "General", "content": raw})
    elif isinstance(raw, list):
        for r in raw:
            structured_resources.append({
                "title": r.get("title", r.get("content", "")),
                "url": r.get("url", ""),
                "category": r.get("category", "General"),
                "content": r.get("content", "")
            })
    state["retrieved_resources"] = structured_resources
    return {"retrieved_resources": structured_resources}

def resource_matcher_agent(state: AgentState) -> AgentState:
    logger.info("Running Resource Matcher Agent...")
    prompt = ChatPromptTemplate.from_messages([
        ("system", """Filter and match retrieved resources to student's needs.
        Rules:
        - Top 3–5 most relevant
        - Format: {'category','title','url','reason_for_recommendation'}"""),
        ("user", """Student summary: {summary}
        Retrieved resources: {resources}""")
    ])
    chain = prompt | llm.with_structured_output(ResourceMatcherOutput)
    
    # Ensure proper input
    resources_input = state.get("retrieved_resources", [])
    result = chain.invoke({"summary": state["summary"], "resources": resources_input})
    matched = result.matched_resources

    # Fallback if LLM fails
    if not matched or all(not r for r in matched):
        matched = resources_input[:5]  # take top 5
        for r in matched:
            r.setdefault("reason_for_recommendation", "Relevant to student's expressed concerns")
    logger.info(f"Matched Resources: {matched}")
    return {"matched_resources": matched}

def report_generator_agent(state: AgentState) -> AgentState:
    logger.info("Running Report Generator Agent...")
    prompt = ChatPromptTemplate.from_messages([
        ("system", """Compile all outputs into:
        1. Demo Report (student-facing)
        2. Standard Report (admin-facing)
        Output JSON object."""), 
        ("user", """Sentiment: {sentiment_analysis}
        Screening: {screening_scores}
        Summary: {summary}
        Matched Resources: {matched_resources}""")
    ])
    chain = prompt | llm.with_structured_output(FinalReportOutput)
    current_time = datetime.datetime.now()
    
    result = chain.invoke({
        "sentiment_analysis": state["sentiment_analysis"],
        "screening_scores": state["screening_scores"],
        "summary": state["summary"],
        "matched_resources": state["matched_resources"],
    })
    
    result.standard_report.report_generated_at = current_time
    logger.info("Final reports generated.")
    return {"final_report": result.dict()}

# --- Build the LangGraph ---
def build_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("sentiment_risk_analyzer", sentiment_risk_analyzer_agent)
    workflow.add_node("screening", screening_agent)
    workflow.add_node("summarizer", conversation_summarizer_agent)
    workflow.add_node("recommender", recommendation_agent)
    workflow.add_node("retriever", resource_retrieval_agent)
    workflow.add_node("matcher", resource_matcher_agent)
    workflow.add_node("report_generator", report_generator_agent)
    workflow.set_entry_point("sentiment_risk_analyzer")
    workflow.add_edge("sentiment_risk_analyzer", "screening")
    workflow.add_edge("screening", "summarizer")
    workflow.add_edge("summarizer", "recommender")
    workflow.add_edge("recommender", "retriever")
    workflow.add_edge("retriever", "matcher")
    workflow.add_edge("matcher", "report_generator")
    workflow.add_edge("report_generator", END)
    app = workflow.compile()
    return app

graph_app = build_graph()











# app/services/report_service.py

from ..agents.supervisor import graph_app, AgentState
from ..utils.logger import get_logger

logger = get_logger(__name__)

async def generate_student_report(conversation_history: str) -> dict:
    """
    Runs the full agentic workflow to generate student and admin reports.
    """
    logger.info("Starting report generation service...")
    
    # Initial state for the graph
    initial_state: AgentState = {"conversation_history": conversation_history}
    
    # The `stream` method is asynchronous and returns the final state
    final_state = await graph_app.ainvoke(initial_state)
    
    if final_state and final_state.get("final_report"):
        logger.info("Successfully generated final report.")
        return final_state["final_report"]
    else:
        logger.error("Report generation failed or returned an empty state.")
        raise ValueError("Could not generate the final report.")