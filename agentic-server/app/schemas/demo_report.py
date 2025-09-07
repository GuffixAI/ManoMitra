# app/schemas/demo_report.py
from pydantic import BaseModel, Field
from typing import List, Optional

class Resource(BaseModel):
    title: str = Field(..., description="The title of the resource (e.g., '5-Minute Guided Meditation for Sleep').")
    url: str = Field(..., description="The URL link to the resource.")
    description: str = Field(..., description="A short, simple explanation of why this resource is helpful for the student.")

class HelpfulResources(BaseModel):
    videos_and_audio: Optional[List[Resource]] = Field(None, description="Links to helpful videos or relaxation audio.")
    articles_and_guides: Optional[List[Resource]] = Field(None, description="Links to easy-to-read articles and coping strategy guides.")
    on_campus_support: Optional[List[Resource]] = Field(None, description="Information on booking appointments with the college counselor.")

class DemoReport(BaseModel):
    student_summary: str = Field(..., description="A brief, empathetic summary of the student's situation in 'you' language. e.g., 'It sounds like you're feeling...'")
    key_takeaways: List[str] = Field(..., description="A few bullet points summarizing the main challenges identified, framed positively. e.g., 'Managing exam stress is a key priority right now.'")
    suggested_first_steps: List[str] = Field(..., description="A few simple, actionable, and encouraging steps the student can take right now. e.g., 'Try a 5-minute breathing exercise before you start studying.'")
    helpful_resources: HelpfulResources = Field(..., description="A curated list of resources, categorized for clarity.")
    message_of_encouragement: str = Field(..., description="A final, positive, and supportive message. e.g., 'Remember, feeling overwhelmed is temporary, and reaching out is a sign of strength.'")