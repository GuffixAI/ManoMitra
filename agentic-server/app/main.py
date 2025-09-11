# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict

from .services.report_service import generate_student_report
from .utils.logger import get_logger
from .services.pathway_service import generate_learning_pathway
from .schemas.learning_pathway import PathwayGenerationRequest, LearningPathwayOutput

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup...")
    yield
    logger.info("Application shut down...")

app = FastAPI(
    title="Mental Health Multi-Agent System",
    description="An API for generating psychological support reports from student chat histories.",
    version="1.0.0",
    lifespan=lifespan
)

logger = get_logger(__name__)

class ChatHistoryRequest(BaseModel):
    conversation_history: str


@app.get("/", tags=["Health Check"])
async def read_root():
    return {"status": "API is running"}

@app.post("/generate-report", tags=["Reports"])
async def create_report(request: ChatHistoryRequest) -> Dict:
    """
    Accepts a student's conversation history and returns a comprehensive
    student-facing (demo) and admin-facing (standard) report.
    """
    try:
        logger.info("Received request to generate a new report.")
        if not request.conversation_history.strip():
            raise HTTPException(status_code=400, detail="Conversation history cannot be empty.")
            
        reports = await generate_student_report(request.conversation_history)
        return reports
    except Exception as e:
        logger.error(f"An error occurred during report generation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    
@app.post("/generate-pathway", response_model=LearningPathwayOutput, tags=["Pathways"])
async def create_learning_pathway(request: PathwayGenerationRequest):
    """
    Accepts key stressors and topics from an AI report and generates
    a personalized learning pathway for the student.
    """
    try:
        logger.info(f"Received request to generate a new learning pathway with topics: {request.suggested_resource_topics}")
        
        pathway = await generate_learning_pathway(
            stressors=request.key_stressors,
            topics=request.suggested_resource_topics,
            language=request.student_language
        )
        return pathway
    except ValueError as ve:
        logger.error(f"Validation error during pathway generation: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"An error occurred during pathway generation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")