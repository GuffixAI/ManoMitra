# analytic-agentic-server/main.py

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import uuid # For generating unique snapshot versions

from analytic_agentic_server.utils.logger import get_logger
from analytic_agentic_server.db.connect import connect_db, close_db, get_db
from analytic_agentic_server.agents.analytic_supervisor import analytic_graph_app, AnalyticState
from analytic_agentic_server.schemas.analytics import AnalyticsRequest, AnalyticsResponse, AnalyticsSnapshot

# Load environment variables
load_dotenv()

logger = get_logger(__name__)

# Global variable for MongoDB client to be managed by lifespan
mongo_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events for the FastAPI application.
    Connects to the database on startup, closes on shutdown.
    """
    logger.info("Analytic Server: Application startup initiated...")
    try:
        global mongo_client
        mongo_client = connect_db()
        logger.info("Analytic Server: MongoDB connection established.")
        yield
        logger.info("Analytic Server: Application shutting down. Closing MongoDB connection...")
        close_db()
        logger.info("Analytic Server: MongoDB connection closed.")
    except Exception as e:
        logger.error(f"Analytic Server: Fatal error during startup or shutdown: {e}", exc_info=True)
        # Optionally re-raise to prevent server from starting if DB connection is critical
        # raise

app = FastAPI(
    title="ManoMitra Advanced Analytics API",
    description="API for fetching, processing, and serving advanced mental health report analytics.",
    version="1.0.0",
    lifespan=lifespan
)

# --- Utility Functions ---
def _generate_snapshot_version(prefix: str = "Manual", period_start: Optional[datetime] = None, period_end: Optional[datetime] = None) -> str:
    """Generates a version string for the analytics snapshot."""
    if period_start and period_end:
        start_str = period_start.strftime("%Y%m%d")
        end_str = period_end.strftime("%Y%m%d")
        return f"{prefix}-{start_str}_to_{end_str}-{uuid.uuid4().hex[:6]}"
    return f"{prefix}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"


# --- Endpoints ---

@app.get("/", tags=["Health Check"])
async def read_root():
    """Basic health check endpoint."""
    return {"status": "Analytic API is running"}

@app.post("/generate-analytics", response_model=AnalyticsResponse, tags=["Analytics Generation"])
async def trigger_analytics_generation(request: AnalyticsRequest = AnalyticsRequest()):
    """
    Triggers the multi-agent workflow to generate a new analytics snapshot.
    Accepts optional period_start and period_end for historical analysis.
    """
    logger.info(f"Received request to generate analytics with filters: {request.dict()}")

    # Determine period for this snapshot. Default to last 30 days if not specified.
    period_end = request.period_end or datetime.now(timezone.utc)
    period_start = request.period_start or (period_end - timedelta(days=30))

    # Generate a unique snapshot version
    version_prefix = os.getenv("ANALYTIC_SNAPSHOT_VERSION_PREFIX", "Daily")
    snapshot_version = _generate_snapshot_version(
        prefix=version_prefix, 
        period_start=period_start, 
        period_end=period_end
    )

    initial_state: AnalyticState = {
        "raw_reports": [],
        "raw_ai_reports": [],
        "raw_students": [],
        "raw_counsellors": [],
        "raw_volunteers": [],
        "reports_df": pd.DataFrame(),
        "ai_reports_df": pd.DataFrame(),
        "combined_reports_df": pd.DataFrame(),
        "analytic_results": {},
        "snapshot_version": snapshot_version,
        "period_start": period_start,
        "period_end": period_end,
        "filters_used": request.filters,
    }

    try:
        final_state: AnalyticState = await analytic_graph_app.ainvoke(initial_state)

        if final_state and final_state.get("analytic_results"):
            # The _id field is added by db_saver_agent
            snapshot_id = final_state["analytic_results"].get("_id") 
            logger.info(f"Analytics snapshot {snapshot_version} generated successfully with ID: {snapshot_id}")
            return AnalyticsResponse(
                success=True,
                message=f"Analytics snapshot '{snapshot_version}' generated successfully.",
                snapshot_id=snapshot_id,
                snapshot_version=snapshot_version
            )
        else:
            logger.error("Analytics generation completed, but no results found in final state.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Analytics generation failed: No results produced."
            )

    except Exception as e:
        logger.error(f"Error during analytics generation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error during analytics generation: {str(e)}"
        )

@app.get("/analytics/latest", response_model=AnalyticsResponse, tags=["Analytics Retrieval"])
async def get_latest_analytics_snapshot():
    """
    Retrieves the most recent analytics snapshot.
    """
    logger.info("Received request for latest analytics snapshot.")
    try:
        db = get_db()
        analytics_collection = db["analyticssnapshots"]
        
        latest_snapshot_doc = analytics_collection.find_one(
            {},
            sort=[("snapshotTimestamp", -1)] # Sort by latest timestamp
        )

        if latest_snapshot_doc:
            # Convert ObjectId to string for Pydantic compatibility
            latest_snapshot_doc['_id'] = str(latest_snapshot_doc['_id'])
            # Pydantic will handle nested types from dict
            latest_snapshot = AnalyticsSnapshot(**latest_snapshot_doc)
            logger.info(f"Retrieved latest snapshot: {latest_snapshot.snapshotVersion}")
            return AnalyticsResponse(
                success=True,
                message="Latest analytics snapshot retrieved.",
                data=latest_snapshot,
                snapshot_id=latest_snapshot.snapshotTimestamp, # Use timestamp as a unique ID
                snapshot_version=latest_snapshot.snapshotVersion
            )
        else:
            logger.warning("No analytics snapshots found.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No analytics snapshots found."
            )
    except Exception as e:
        logger.error(f"Error retrieving latest analytics snapshot: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )

@app.get("/analytics/versions", response_model=List[Dict[str, Any]], tags=["Analytics Retrieval"])
async def get_all_snapshot_versions():
    """
    Retrieves a list of all available analytics snapshot versions and their timestamps.
    """
    logger.info("Received request for all analytics snapshot versions.")
    try:
        db = get_db()
        analytics_collection = db["analyticssnapshots"]
        
        # Project only necessary fields to keep payload small
        versions = list(analytics_collection.find({}, {"snapshotVersion": 1, "snapshotTimestamp": 1, "periodStart": 1, "periodEnd": 1}).sort("snapshotTimestamp", -1))
        
        # Convert ObjectId to string
        for version in versions:
            version['_id'] = str(version['_id'])

        logger.info(f"Retrieved {len(versions)} snapshot versions.")
        return versions
    except Exception as e:
        logger.error(f"Error retrieving snapshot versions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )


@app.get("/analytics/{snapshot_id}", response_model=AnalyticsResponse, tags=["Analytics Retrieval"])
async def get_analytics_by_id(snapshot_id: str):
    """
    Retrieves a specific analytics snapshot by its MongoDB ID.
    """
    logger.info(f"Received request for analytics snapshot with ID: {snapshot_id}")
    try:
        from bson import ObjectId # Import ObjectId for querying by ID
        db = get_db()
        analytics_collection = db["analyticssnapshots"]
        
        snapshot_doc = analytics_collection.find_one({"_id": ObjectId(snapshot_id)})

        if snapshot_doc:
            snapshot_doc['_id'] = str(snapshot_doc['_id'])
            snapshot = AnalyticsSnapshot(**snapshot_doc)
            logger.info(f"Retrieved snapshot {snapshot.snapshotVersion} by ID: {snapshot_id}")
            return AnalyticsResponse(
                success=True,
                message=f"Analytics snapshot '{snapshot.snapshotVersion}' retrieved.",
                data=snapshot,
                snapshot_id=snapshot_id,
                snapshot_version=snapshot.snapshotVersion
            )
        else:
            logger.warning(f"Analytics snapshot with ID {snapshot_id} not found.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analytics snapshot with ID {snapshot_id} not found."
            )
    except Exception as e:
        logger.error(f"Error retrieving analytics snapshot by ID: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )

# To run this server:
# cd analytic-agentic-server
# uvicorn main:app --reload --port 8001 # Or any other port