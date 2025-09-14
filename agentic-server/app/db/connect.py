
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from app.utils.logger import get_logger

# Load environment variables
load_dotenv()

logger = get_logger(__name__)

client = None # Global client instance

def connect_db():
    global client
    if client is None:
        try:
            mongo_uri = os.getenv("MONGO_URI")
            if not mongo_uri:
                raise ValueError("MONGO_URI environment variable not set.")
            
            client = MongoClient(mongo_uri)
            # The ismaster command is cheap and does not require auth.
            client.admin.command('ismaster') 
            logger.info("MongoDB Connected successfully for analytic server.")
            return client
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    return client

def get_db():
    """Returns the database instance."""
    if client is None:
        connect_db()
    return client.get_database() # Assuming database name is part of MONGO_URI, or specify directly

def close_db():
    """Closes the MongoDB connection."""
    global client
    if client:
        client.close()
        client = None
        logger.info("MongoDB connection closed for analytic server.")

# Ensure connection is closed when the script exits
import atexit
atexit.register(close_db)