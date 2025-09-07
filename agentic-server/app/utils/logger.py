# app/utils/logger.py

import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger("mental_health_agent")

def get_logger(name: str):
    """Returns a logger instance for a specific module."""
    return logging.getLogger(name)