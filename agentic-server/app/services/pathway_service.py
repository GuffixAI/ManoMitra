# agentic-server/app/services/pathway_service.py
from typing import List, Dict, Any
from ..agents.pathway_generator import learning_path_generator_agent
from ..utils.logger import get_logger

logger = get_logger(__name__)

async def generate_learning_pathway(stressors: List[str], topics: List[str], language: str) -> Dict[str, Any]:
    """
    Service to orchestrate the generation of a learning pathway.
    """
    logger.info("Pathway service initiated.")
    try:
        pathway = await learning_path_generator_agent(
            stressors=stressors,
            topics=topics,
            language=language
        )
        
        return pathway
    except Exception as e:
        logger.error(f"Error in pathway service: {e}", exc_info=True)
        raise