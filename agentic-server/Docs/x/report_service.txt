# app/services/report_service.py

from ..agents.supervisor import graph_app, AgentState
from ..utils.logger import get_logger
from typing import Dict, Any

logger = get_logger(__name__)

async def generate_student_report(conversation_history: str) -> Dict[str, Any]:
    """
    Runs the full agentic workflow to generate student and admin reports.
    Returns a dict containing both demo_report and standard_report.
    """
    logger.info("Starting report generation service...")

    # Initialize agent state
    initial_state: AgentState = {"conversation_history": conversation_history}

    try:
        # Run the LangGraph workflow asynchronously
        final_state: AgentState = await graph_app.ainvoke(initial_state)

        # Ensure final_report exists
        if final_state and final_state.get("final_report"):
            logger.info("Successfully generated final report.")
            return final_state["final_report"]
        else:
            logger.error("Report generation returned an empty final state.")
            raise ValueError("Could not generate the final report.")

    except Exception as e:
        logger.exception(f"An error occurred during report generation: {e}")
        raise
