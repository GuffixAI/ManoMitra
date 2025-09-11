# agentic-server/app/schemas/learning_pathway.py
from pydantic import BaseModel, Field
from typing import List, Optional

class PathwayGenerationRequest(BaseModel):
    key_stressors: List[str]
    suggested_resource_topics: List[str]
    student_language: str = "en"

class PathwayStep(BaseModel):
    resource: str = Field(..., description="The ObjectId of the PsychoeducationalResource.")
    title: str
    description: Optional[str] = None
    type: str
    url: str
    completed: bool = False

class LearningPathwayOutput(BaseModel):
    title: str = Field(..., description="An empathetic and encouraging title for the pathway, e.g., 'A Path to Calmer Nights and Focused Days'.")
    steps: List[PathwayStep] = Field(..., description="A sequenced list of resource steps for the student.")