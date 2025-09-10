# analytic-agentic-server/utils/logger.py

import logging
import os

# Create logs directory if it doesn't exist
log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

# Basic configuration for console and file logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.FileHandler(os.path.join(log_dir, "analytic_server.log")),
        logging.StreamHandler()
    ]
)

def get_logger(name: str):
    """Returns a logger instance for a specific module."""
    return logging.getLogger(name)