# agentic-server/app/agents/pathway_generator.py
import os
import httpx
import json
from typing import List, Dict, Any

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from ..schemas.learning_pathway import LearningPathwayOutput, PathwayStep
from ..utils.logger import get_logger

logger = get_logger(__name__)

# Get the Node.js backend URL from environment variables
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api")

# Initialize the LLM for structuring the pathway
llm = ChatGoogleGenerativeAI(model=os.getenv("LLM_MODEL"))

# Define the system prompt for the LLM
PROMPT_TEMPLATE = ChatPromptTemplate.from_messages([
    ("system", """
    You are a compassionate curriculum designer for mental wellness. Your task is to create a personalized, step-by-step "Learning Pathway" for a student based on their key stressors and a list of key_stressors_identified.

    **Instructions:**
    1.  **Create an Empathetic Title:** Based on the student's key stressors, create a warm and encouraging title for the pathway. For example, if stressors are "exam anxiety" and "sleep problems," a good title would be "A Pathway to Restful Sleep and Confident Exams."
    2.  **Logically Sequence the Resources:** Review the provided list of topic. Based on that give authentic response links of videos do not add just example resources and etc etc in depth analysis.
    3.  **Ensure Correct Formatting:** Your final output must be a JSON object that strictly adheres to the provided `LearningPathwayOutput` schema. Do not add any extra text or explanations outside of the JSON structure.
    """),
    ("user", """
    **Student's Key Stressors:**
    {key_stressors}

    **Available Resources (JSON format) basically that is key_stressors_identified:**
    ```json
    {available_resources}
    ```

    Please generate the `LearningPathwayOutput` JSON based on these inputs.
    """)
])

async def learning_path_generator_agent(stressors: List[str], topics: List[str], language: str = "en") -> Dict[str, Any]:
    """
    Generates a personalized learning pathway for a student.
    """
    logger.info(f"Starting pathway generation for stressors: {stressors}, topics: {topics}")

    # 1. Fetch pre-vetted resources from the Node.js backend
    
    # try:
    #     async with httpx.AsyncClient() as client:
    #         logger.info(f"Querying Node.js backend for resources: {topics}")
    #         response = await client.get(
    #             f"{BACKEND_API_URL}/resources/recommended",
    #             params={"topics": ",".join(topics), "language": language},
    #             timeout=10.0
    #         )
    #         response.raise_for_status()
    #         available_resources = response.json().get("data", [])
    #         logger.info(f"Received {len(available_resources)} resources from backend.")
    # except Exception as e:
    #     logger.error(f"Failed to fetch resources from backend: {e}", exc_info=True)
    #     raise ValueError("Could not retrieve resources to build the pathway.") from e

    # if not available_resources:
    #     logger.warning("No resources found for the given topics. Cannot generate a pathway.")
    #     return {"title": "Resources for You", "steps": []}

    # 2. Use the LLM to structure the pathway
    try:
        logger.info("Invoking LLM to structure the learning pathway.")
        pathway_chain = PROMPT_TEMPLATE | llm.with_structured_output(LearningPathwayOutput)
        
        pathway_result: LearningPathwayOutput = await pathway_chain.ainvoke({
            "key_stressors": ", ".join(stressors),
            "available_resources": json.dumps(topics, indent=2)
        })

        logger.info(f"Successfully generated pathway titled: '{pathway_result.title}'")
        return pathway_result.model_dump()

    except Exception as e:
        logger.error(f"LLM failed to generate pathway: {e}", exc_info=True)
        raise ValueError("AI model failed to structure the learning pathway.") from e