# analytic-agentic-server/services/data_fetcher.py

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from analytic_agentic_server.db.connect import get_db
from analytic_agentic_server.utils.logger import get_logger

logger = get_logger(__name__)

class DataFetcher:
    def __init__(self):
        self.db = get_db()
        self.reports_collection = self.db["reports"]
        self.aireports_collection = self.db["aireports"]
        self.students_collection = self.db["students"]
        self.counsellors_collection = self.db["counsellors"]
        self.volunteers_collection = self.db["volunteers"]

    def _convert_object_id_to_str(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        """Converts ObjectId fields in a document to strings."""
        if '_id' in doc:
            doc['_id'] = str(doc['_id'])
        if 'owner' in doc and doc['owner']:
            doc['owner'] = str(doc['owner'])
        if 'assignedTo' in doc and doc['assignedTo']:
            doc['assignedTo'] = str(doc['assignedTo'])
        # Add other ObjectId fields as necessary
        return doc

    def fetch_all_reports(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetches all manual reports, optionally filtered by date range."""
        query = {}
        if start_date or end_date:
            query['createdAt'] = {}
            if start_date:
                query['createdAt']['$gte'] = start_date
            if end_date:
                query['createdAt']['$lte'] = end_date
        
        logger.info(f"Fetching manual reports with query: {query}")
        reports = list(self.reports_collection.find(query))
        return [self._convert_object_id_to_str(report) for report in reports]

    def fetch_all_ai_reports(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetches all AI reports, optionally filtered by date range."""
        query = {}
        if start_date or end_date:
            query['createdAt'] = {}
            if start_date:
                query['createdAt']['$gte'] = start_date
            if end_date:
                query['createdAt']['$lte'] = end_date

        logger.info(f"Fetching AI reports with query: {query}")
        ai_reports = list(self.aireports_collection.find(query))
        return [self._convert_object_id_to_str(report) for report in ai_reports]

    def fetch_all_students(self) -> List[Dict[str, Any]]:
        """Fetches all student data."""
        students = list(self.students_collection.find({}))
        return [self._convert_object_id_to_str(student) for student in students]

    def fetch_all_counsellors(self) -> List[Dict[str, Any]]:
        """Fetches all counsellor data."""
        counsellors = list(self.counsellors_collection.find({}))
        return [self._convert_object_id_to_str(counsellor) for counsellor in counsellors]

    def fetch_all_volunteers(self) -> List[Dict[str, Any]]:
        """Fetches all volunteer data."""
        volunteers = list(self.volunteers_collection.find({}))
        return [self._convert_object_id_to_str(volunteer) for volunteer in volunteers]
    
    def fetch_all_checkins(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetches all student check-ins, optionally filtered by date range."""
        query = {}
        if start_date or end_date:
            query['createdAt'] = {}
            if start_date:
                query['createdAt']['$gte'] = start_date
            if end_date:
                query['createdAt']['$lte'] = end_date
        
        logger.info(f"Fetching student check-ins with query: {query}")
        checkins = list(self.db["studentcheckins"].find(query))
        return [self._convert_object_id_to_str(checkin) for checkin in checkins]