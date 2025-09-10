You're embarking on an exciting extension that will significantly boost the administrative capabilities of ManoMitra! Creating a separate, independent analytic-agentic-server is a smart move to maintain the integrity of your existing codebase while adding powerful new features.

Here's a comprehensive roadmap for developing this independent analytic-multi-agentic-server, along with a detailed explanation of its components and how it will interact with your existing system.

---

## Roadmap: Independent Analytic-Multi-Agentic-Server

This roadmap outlines the steps to build a standalone Python-based analytic server that fetches, processes, and stores advanced mental health report analytics, which can then be displayed in an enhanced admin dashboard.

### Phase 1: Planning & Data Modeling (Analytic Server)

**Goal:** Define the data sources, the structure of the advanced analytics, and how they will be stored.

1.  **Identify All Report Data Sources:**
    *   `Report` model (manual reports submitted by students).
    *   `AIReport` model (AI-generated reports).
    *   Consider `Feedback` data for counsellor/volunteer performance in relation to student outcomes.
    *   Consider `Conversation` history (for AI reports) to extract raw text for advanced NLP.

2.  **Define Advanced Analytics Data Structure (`AnalyticsSnapshot` Model):**
    This is crucial. You need a new MongoDB model to store the *output* of your analytic agents. This model will hold pre-calculated, aggregated, and time-stamped insights.

    ```javascript
    // Conceptual: server/models/analyticSnapshot.model.js (or similar)
    // This model will be managed by the NEW analytic server.
    // It will be stored in your EXISTING MongoDB database, but accessed by the new Python server.
    const analyticSnapshotSchema = new mongoose.Schema(
      {
        snapshotTimestamp: { type: Date, required: true, default: Date.now },
        snapshotVersion: { type: String, required: true }, // e.g., v1.0, v2.1
        periodStart: { type: Date }, // Start date of data included in this snapshot
        periodEnd: { type: Date },   // End date of data included in this snapshot
        
        // --- High-Level Metrics ---
        totalReports: { type: Number, default: 0 },
        totalAIReports: { type: Number, default: 0 },
        totalManualReports: { type: Number, default: 0 },
        totalStudentsEngaged: { type: Number, default: 0 },

        // --- Sentiment & Risk Trends ---
        sentimentDistribution: { // e.g., { 'Anxious': 150, 'Depressed': 120, 'Overwhelmed': 80 }
          type: mongoose.Schema.Types.Mixed, // Stored as a flexible object/dict
          default: {}
        },
        riskLevelDistribution: { // e.g., { 'Low': 300, 'Medium': 50, 'High': 10 }
          type: mongoose.Schema.Types.Mixed,
          default: {}
        },
        topRedFlags: [{
          _id: false,
          flag: String,
          count: Number
        }], // e.g., [{ flag: 'hopelessness', count: 25 }]

        // --- Screening Score Insights ---
        avgPHQ9: { type: Number, default: 0 },
        avgGAD7: { type: Number, default: 0 },
        scoreInterpretationDistribution: { // e.g., { 'Mild Anxiety': 100, 'Moderate Depression': 50 }
          type: mongoose.Schema.Types.Mixed,
          default: {}
        },

        // --- Stressor & Concern Analysis ---
        topStressors: [{
          _id: false,
          stressor: String,
          count: Number
        }],
        topStudentConcerns: [{
          _id: false,
          concern: String,
          count: Number
        }],
        stressorTrends: { // Time-series data for stressors
          type: mongoose.Schema.Types.Mixed,
          default: {}
        },

        // --- Resource Recommendation Effectiveness (if trackable) ---
        topSuggestedResourceTopics: [{
          _id: false,
          topic: String,
          count: Number
        }],
        
        // --- Resolution & Assignment Metrics (for manual reports) ---
        avgReportResolutionTimeDays: { type: Number, default: 0 },
        reportsByStatus: { // { 'pending': 50, 'resolved': 200 }
          type: mongoose.Schema.Types.Mixed,
          default: {}
        },
        topCounsellorsByReportsResolved: [{
          _id: false,
          counsellorId: mongoose.Schema.Types.ObjectId,
          name: String,
          resolvedCount: Number
        }],

        // --- Advanced NLP Insights (requires raw conversation access) ---
        // e.g., keyword frequency, sentiment intensity over conversation duration,
        // detection of emerging themes not explicitly tagged.
        emergingThemes: [String],
        // ... more advanced metrics

        // --- Raw data hashes/versioning for audit ---
        // You might want to store a hash of the raw data used for this snapshot
        // to ensure reproducibility if comparing versions.
        rawDataHash: String,
      },
      { timestamps: true }
    );

    // Add indexes for efficient querying
    analyticSnapshotSchema.index({ snapshotTimestamp: -1 });
    analyticSnapshotSchema.index({ snapshotVersion: 1 });

    // The analytic server will *create* these documents.
    // The existing Node.js server will *read* them.
    // You'll need to define this model in your Node.js server too if Node is reading it.
    // Ensure both Python and Node.js use the same MongoDB connection string.
    ```
3.  **Choose Analytic Frameworks (Python):**
    *   **Data Manipulation:** Pandas (essential for data aggregation, time-series, etc.).
    *   **NLP (Optional for deeper insights):** NLTK, spaCy, scikit-learn (for text vectorization, topic modeling).
    *   **Charting Data Preparation:** Just prepare the raw data for charting; the frontend will do the actual rendering.

### Phase 2: Analytic Agentic Server (Python FastAPI)

**Goal:** Build a new FastAPI application that can fetch raw data, process it using various "analytic agents," and save the results.

1.  **Project Setup:**
    *   Create a new Python project directory (e.g., `analytic-agentic-server/`).
    *   `pyproject.toml` or `requirements.txt`: `fastapi`, `uvicorn`, `pymongo` (for MongoDB interaction), `pandas`, `langchain-core` (if using LLM for more complex analysis like emerging themes).
    *   `.env.example`: `MONGO_URI`, `LLM_API_KEY` (if agents use LLM).

2.  **Database Connection (`analytic-agentic-server/db/connect.py`)**
    *   Use `pymongo` to connect to your existing MongoDB database. This server will *read* from `Report`, `AIReport` and *write* to `AnalyticsSnapshot`.

3.  **Data Fetching Layer (`analytic-agentic-server/services/data_fetcher.py`)**
    *   Functions to fetch all reports (`Report.model.js`, `AIReport.model.js`) from MongoDB.
    *   Functions to fetch all counsellor/student/volunteer data, as needed for contextualizing reports.
    *   These functions should convert MongoDB documents into Python dictionaries/Pandas DataFrames for easier processing.

4.  **Core Analytic Agents (`analytic-agentic-server/agents/analytic_supervisor.py`)**
    This will be the heart of your new server, orchestrating various analytic "sub-agents."

    *   **`AnalyticState` (TypedDict):** Similar to your existing `AgentState`, but for analytics.
        ```python
        class AnalyticState(TypedDict):
            raw_reports: List[Dict[str, Any]]
            raw_ai_reports: List[Dict[str, Any]]
            raw_feedback: List[Dict[str, Any]]
            processed_df: Optional[pd.DataFrame] # Intermediate processed data
            analytic_results: Optional[Dict[str, Any]] # Final structured analytics
            snapshot_version: str
            period_start: Optional[datetime]
            period_end: Optional[datetime]
        ```

    *   **Sub-Agents (Functions):**
        *   **`report_ingestion_agent(state)`:** Fetches `Report` and `AIReport` data from MongoDB. Parses `demo_report` and `standard_report` JSON strings into Python dicts for `AIReport`.
        *   **`data_preprocessing_agent(state)`:** Converts raw data into a Pandas DataFrame. Standardizes fields (e.g., extract `sentiment`, `risk_level` from parsed AI reports). Handles missing values. Creates common identifiers (e.g., `student_id`, `report_type`).
        *   **`sentiment_risk_analyzer(state)`:** Calculates distribution of sentiments, emotional intensities, risk levels, and identifies top red flags.
        *   **`screening_score_aggregator(state)`:** Computes average PHQ-9/GAD-7 scores, distributions of interpretations.
        *   **`stressor_concern_extractor(state)`:** Aggregates `key_stressors` and `student_expressed_concerns` from all reports. Identifies top themes. Can use simple text processing (count, TF-IDF) or advanced NLP for emerging themes.
        *   **`resolution_efficiency_metrics(state)`:** Calculates average resolution time for manual reports, counts reports by status. Identifies top counsellors by reports resolved.
        *   **(Optional - LLM Agent): `emerging_theme_detector(state)`:** If you want more advanced insights, an LLM could analyze common keywords, phrases, or report content to identify emerging themes not explicitly tagged. This would use `langchain-google-genai` and your `llm`.
        *   **`snapshot_generator(state)`:** Combines all computed metrics into the `analytic_results` dictionary, structured according to your `AnalyticsSnapshot` model.
        *   **`db_saver_agent(state)`:** Saves the `analytic_results` to a new `AnalyticsSnapshot` document in MongoDB.

    *   **LangGraph Workflow (`analytic_supervisor.py`):** Orchestrates these sub-agents in a sequential workflow.

5.  **FastAPI Application (`analytic-agentic-server/main.py`)**
    *   Define a `/generate-analytics` endpoint.
        *   This endpoint will accept optional parameters like `period_start`, `period_end` to filter data.
        *   It will trigger the `AnalyticSupervisor` workflow.
        *   It will return the `_id` of the newly created `AnalyticsSnapshot` document.
    *   Define a `/latest-analytics` endpoint to retrieve the most recent snapshot.
    *   Define a `/analytics-by-version/:version` endpoint to retrieve a specific snapshot.
    *   Include necessary `pydantic` schemas for API request/response.

### Phase 3: Existing Backend (`server` - Node.js) Integration

**Goal:** Modify your Node.js backend to interact with the new analytic server and serve the advanced analytics to the frontend.

1.  **Update Admin Controller (`server/controllers/admin.controller.js`)**
    *   Add a new function, e.g., `triggerAdvancedAnalytics`.
        *   This function will make an HTTP POST request to `analytic-agentic-server/generate-analytics`.
        *   It will receive the ID of the new `AnalyticsSnapshot` document.
        *   It should then return a success message.
    *   Add a new function, e.g., `getAdvancedAnalytics`.
        *   This function will query your MongoDB to retrieve `AnalyticsSnapshot` documents (e.g., the latest, or by version).

2.  **Update Admin Routes (`server/routes/admin.routes.js`)**
    *   Add a new route: `POST /api/admin/analytics/generate` -> `triggerAdvancedAnalytics`.
    *   Add a new route: `GET /api/admin/analytics/advanced/latest` -> `getAdvancedAnalytics`.
    *   Add a new route: `GET /api/admin/analytics/advanced/:version` -> `getAdvancedAnalytics`.

3.  **Add `AnalyticsSnapshot` Model (Node.js for consistency)**
    *   Even though the Python server *creates* the documents, your Node.js server should have the Mongoose model defined to correctly *read* them.
    *   `server/models/analyticSnapshot.model.js` (copy the schema from Phase 1).

### Phase 4: Frontend (`web`) Modifications

**Goal:** Create a new admin page to display the advanced analytics and allow triggering new snapshots.

1.  **New Admin Page (`web/app/(dashboard)/admin/advanced-analytics/page.tsx`)**
    *   This page will replace or extend the current `admin/analytics/page.tsx`.
    *   **"Generate New Snapshot" Button:**
        *   On click, make an API call to `server/api/admin/analytics/generate`.
        *   Show a loading spinner and progress (if you want to get fancy with real-time feedback from the analytic server, otherwise just a general loading state).
        *   Use `react-query` `useMutation` for this.
    *   **Analytics Display:**
        *   Use `react-query` `useQuery` to fetch the latest `AnalyticsSnapshot` data from `server/api/admin/analytics/advanced/latest`.
        *   **Dynamic Charting:** Utilize a charting library (e.g., Recharts, Nivo, Chart.js) to render:
            *   **Time-series charts:** For sentiment trends, risk level changes, average scores over time.
            *   **Bar charts/Pie charts:** For distributions of stressors, concerns, red flags, sentiment, risk levels.
            *   **Tables:** For top lists (e.g., top counsellors by resolved reports, top red flags).
        *   **Version Selector:** A dropdown or similar UI to select different `snapshotVersion`s of analytics to compare. This would fetch data from `server/api/admin/analytics/advanced/:version`.

2.  **Update Frontend API Client (`web/lib/api.ts`)**
    *   Add methods for the new admin analytics endpoints.

3.  **Update Sidebar Navigation (`web/components/layout/sidebar.tsx`)**
    *   Update the "Analytics" link to point to this new advanced analytics page.

### Phase 5: Advanced Analytics Features (Iterative Development)

Once the core workflow is established, you can progressively add more sophisticated analyses:

1.  **Correlation Analysis:**
    *   Correlation between student academic year and specific stressors.
    *   Impact of resource recommendations on report resolution time (requires more complex tracking).
2.  **Predictive Modeling (Future):**
    *   Identify students at higher risk based on patterns in reports and screening scores.
3.  **Anomaly Detection:**
    *   Flag unusual spikes in specific types of reports or severe sentiment shifts.
4.  **Sentiment over Time in Conversations (AI Reports):**
    *   If you store full AI conversation history, analyze sentiment changes within a single conversation or across a student's history.
5.  **Longitudinal Study:**
    *   Track individual student's mental health journey (anonymized) over longer periods.
6.  **Comparison Tools:**
    *   Allow admins to compare analytics from different time periods or specific student cohorts.

---

### Key Principles for Independence and Non-Disruption:

*   **Separate Codebase:** The `analytic-agentic-server` is a completely new Python project. It has its own `main.py`, `pyproject.toml`, etc.
*   **Database Interaction:** Both your existing Node.js server and the new Python server will connect to the *same MongoDB instance*. This is how they share data.
*   **Read-Only for Existing Models (Analytic Server):** The Python analytic server will *only read* from your existing `Report`, `AIReport`, `Student`, `Counsellor` models. It will *never modify* them.
*   **Dedicated Write Model:** The Python analytic server will *write* its results to a *new* model (`AnalyticsSnapshot`). This model is owned by the analytic server.
*   **API-Driven Integration:** The existing Node.js server communicates with the Python analytic server via HTTP API calls. It doesn't know about Python code directly.
*   **Frontend Reads from Node.js:** The frontend will *only* communicate with your existing Node.js `server`. The Node.js server will act as a proxy, fetching processed data from its own MongoDB (the `AnalyticsSnapshot` documents) and serving it to the frontend.

This roadmap provides a clear path to build a powerful and independent analytics system without impacting your existing ManoMitra application. Good luck!








// pip install "fastapi[standard]" uvicorn pymongo python-dotenv pandas langgraph langchain-google-genai langchain-core numpy












Okay, let's implement the analytic-multi-agentic-server step-by-step. We will start with **Phase 1: Planning & Data Modeling** for the `AnalyticsSnapshot` model.

---

## Phase 1: Planning & Data Modeling (Analytic Server)

**Goal:** Define the data structure for the advanced analytics output (`AnalyticsSnapshot`) and integrate it into your existing Node.js backend. This model will be where your *new* Python analytic server writes its processed data, and your *existing* Node.js server (and frontend) will read from it.

---

### Step 1.1: Create the `AnalyticsSnapshot` Mongoose Model

You need to create a new Mongoose model in your existing Node.js server's `models` directory.

**File to create:** `server/models/analyticSnapshot.model.js`

**Content to add:**

```javascript
// server/models/analyticSnapshot.model.js
import mongoose from "mongoose";

const analyticSnapshotSchema = new mongoose.Schema(
  {
    snapshotTimestamp: { type: Date, required: true, default: Date.now },
    snapshotVersion: { type: String, required: true, index: true }, // e.g., v1.0, v2.1. Automatically generated.
    periodStart: { type: Date }, // Start date of data included in this snapshot
    periodEnd: { type: Date },   // End date of data included in this snapshot
    
    // --- High-Level Metrics ---
    totalReports: { type: Number, default: 0 },
    totalAIReports: { type: Number, default: 0 },
    totalManualReports: { type: Number, default: 0 },
    totalStudentsEngaged: { type: Number, default: 0 },

    // --- Sentiment & Risk Trends ---
    sentimentDistribution: { // e.g., { 'Anxious': 150, 'Depressed': 120, 'Overwhelmed': 80 }
      type: mongoose.Schema.Types.Mixed, // Stored as a flexible object/dict
      default: {}
    },
    riskLevelDistribution: { // e.g., { 'Low': 300, 'Medium': 50, 'High': 10, 'Critical': 2 }
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    topRedFlags: [{
      _id: false, // Don't create an _id for sub-documents in this array
      flag: String,
      count: Number
    }], // e.g., [{ flag: 'hopelessness', count: 25 }]

    // --- Screening Score Insights ---
    avgPHQ9: { type: Number, default: 0 },
    avgGAD7: { type: Number, default: 0 },
    avgGHQ: { type: Number, default: 0 }, // Assuming GHQ will also be integrated
    scoreInterpretationDistribution: { // e.g., { 'Mild Anxiety': 100, 'Moderate Depression': 50 }
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    phq9Distribution: { type: mongoose.Schema.Types.Mixed, default: {} }, // Raw distribution of scores
    gad7Distribution: { type: mongoose.Schema.Types.Mixed, default: {} },
    ghqDistribution: { type: mongoose.Schema.Types.Mixed, default: {} },

    // --- Stressor & Concern Analysis ---
    topStressors: [{
      _id: false,
      stressor: String,
      count: Number
    }],
    topStudentConcerns: [{
      _id: false,
      concern: String,
      count: Number
    }],
    
    // --- Resource Recommendation Effectiveness (if trackable) ---
    topSuggestedResourceTopics: [{
      _id: false,
      topic: String,
      count: Number
    }],
    
    // --- Resolution & Assignment Metrics (for manual reports) ---
    avgReportResolutionTimeDays: { type: Number, default: 0 },
    reportsByStatus: { // { 'pending': 50, 'in_progress': 20, 'resolved': 200, 'closed': 100 }
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    topCounsellorsByReportsResolved: [{
      _id: false,
      counsellorId: mongoose.Schema.Types.ObjectId,
      name: String,
      resolvedCount: Number
    }],
    avgTimeToAssignReportHours: { type: Number, default: 0 },

    // --- User Engagement Metrics ---
    activeStudentsDaily: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g., {'2023-01-01': 50, '2023-01-02': 55}
    activeStudentsWeekly: { type: mongoose.Schema.Types.Mixed, default: {} },
    activeStudentsMonthly: { type: mongoose.Schema.Types.Mixed, default: {} },

    // --- Additional Advanced Metrics ---
    emergingThemes: [String], // Discovered by LLM-based analysis
    sentimentOverTime: [{ // Time series of average sentiment
      _id: false,
      date: Date,
      averageSentimentScore: Number // Could be a numerical scale
    }],

    // --- Raw data hashes/versioning for audit ---
    rawDataHash: String, // A hash of the underlying data used to create this snapshot

    // Add fields for filtering reports included in the snapshot (optional for later)
    filtersUsed: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

// Add indexes for efficient querying
analyticSnapshotSchema.index({ snapshotTimestamp: -1 }); // Latest snapshots first
analyticSnapshotSchema.index({ snapshotVersion: 1 });   // Efficient lookup by version
analyticSnapshotSchema.index({ periodStart: 1, periodEnd: 1 }); // For range queries

export default mongoose.model("AnalyticsSnapshot", analyticSnapshotSchema);
```

**Explanation of the Model:**

*   **`snapshotTimestamp`**: When this specific analytic snapshot was generated.
*   **`snapshotVersion`**: A unique identifier for this particular analytic run (e.g., "Daily-2023-09-10", "Weekly-Aug-2023", or just "v1.0.0"). This allows for historical comparisons.
*   **`periodStart`, `periodEnd`**: Defines the date range of the raw data that was analyzed for this snapshot.
*   **`totalReports`, `totalAIReports`, `totalManualReports`, `totalStudentsEngaged`**: Basic counts.
*   **`sentimentDistribution`, `riskLevelDistribution`**: Objects to store counts of different sentiment labels and risk levels. `Mixed` type allows flexible schema.
*   **`topRedFlags`**: An array of objects, each containing a specific red flag keyword and its occurrence count.
*   **`avgPHQ9`, `avgGAD7`, `avgGHQ`**: Average scores.
*   **`scoreInterpretationDistribution`**: Counts of how many reports fall into "Mild", "Moderate", "Severe" categories for each screening.
*   **`phq9Distribution`, `gad7Distribution`, `ghqDistribution`**: More granular distributions of raw scores (e.g., { '0-4': 100, '5-9': 50 }).
*   **`topStressors`, `topStudentConcerns`, `topSuggestedResourceTopics`**: Arrays of objects to store the most frequently occurring stressors, concerns, and resource topics from all reports.
*   **`avgReportResolutionTimeDays`, `reportsByStatus`, `topCounsellorsByReportsResolved`, `avgTimeToAssignReportHours`**: Metrics specific to the workflow of manual reports.
*   **`activeStudentsDaily/Weekly/Monthly`**: Placeholder for future integration with activity tracking, though the Python analytic server will calculate this.
*   **`emergingThemes`**: An array of strings, potentially populated by an LLM-based agent.
*   **`sentimentOverTime`**: An array for visualizing how average sentiment changes over different periods.
*   **`rawDataHash`**: A hash of the input data can be stored to verify that a snapshot was generated from a specific dataset, useful for auditing and comparing versions reliably.
*   **`filtersUsed`**: To record what filters were applied when generating the snapshot (e.g., `{'department': 'CSE', 'academicYear': 3}`).

---

### Step 1.2: Update `server/server.js` (Existing Node.js Backend)

You need to ensure your existing Node.js server knows about this new model so it can perform read operations later.

**File to modify:** `server/server.js`

**Content to add (within the `// Models` section):**

```javascript
// FILE: server/server.js

// ... (existing imports)

// Models
import Room from "./models/room.model.js";
import Message from "./models/message.model.js";
import Student from "./models/student.model.js";
import Counsellor from "./models/counsellor.model.js";
import Volunteer from "./models/volunteer.model.js";
import Admin from "./models/admin.model.js";
import Conversation from "./models/conversation.model.js";
import PrivateMessage from "./models/privateMessage.model.js";
import Notification from "./models/notification.model.js";
import AnalyticsSnapshot from "./models/analyticSnapshot.model.js"; // NEW: Import the new model

// ... (rest of the file)
```

---

Now your existing Node.js backend is aware of the `AnalyticsSnapshot` model. This concludes Phase 1. We're ready to set up the new Python analytic server.

---

## Phase 2: Analytic Agentic Server (Python FastAPI)

**Goal:** Create a new, independent Python FastAPI application that connects to your MongoDB, fetches raw data from your existing models (`Report`, `AIReport`, `Student`, `Counsellor`), processes it with "analytic agents," and saves the results into the `AnalyticsSnapshot` model.

---

### Step 2.1: Project Setup

First, create a new directory for your analytic server, and set up its basic structure and dependencies.

**Action:** Create a new directory named `analytic-agentic-server` at the same level as your existing `guffixmind-manomitra`, `server`, and `web` directories.

```
└── guffixmind-manomitra/
    ├── README.md
    ├── agentic-server/           <-- Existing AI server
    ├── server/                   <-- Existing Node.js backend
    ├── web/                      <-- Existing Next.js frontend
    └── analytic-agentic-server/  <-- NEW Python analytic server
```

**Action:** Inside `analytic-agentic-server/`, create the following files and directories:

```
analytic-agentic-server/
├── pyproject.toml
├── .env.example
├── main.py
├── db/
│   └── connect.py
├── services/
│   └── data_fetcher.py
├── agents/
│   └── analytic_supervisor.py
├── schemas/
│   └── analytics.py
└── utils/
    └── logger.py
```

**Content for `analytic-agentic-server/pyproject.toml`:**

```toml
# analytic-agentic-server/pyproject.toml
[project]
name = "analytic-agentic-server"
version = "0.1.0"
description = "Multi-agent system for advanced mental health analytics from ManoMitra reports."
requires-python = ">=3.11"
dependencies = [
    "fastapi[standard]>=0.116.1",
    "uvicorn>=0.35.0",
    "pymongo>=4.8.0",
    "python-dotenv>=1.0.0",
    "pandas>=2.2.2",
    "langgraph>=0.6.6", # For agent orchestration
    "langchain-google-genai>=2.1.10", # Optional, if using LLM for theme detection
    "langchain-core>=0.3.75", # Dependency for langgraph/langchain-google-genai
    "numpy>=1.26.4", # Often a dependency for pandas, explicitly add
]

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"
```

**Content for `analytic-agentic-server/.env.example`:**

```
# analytic-agentic-server/.env.example

# MongoDB Connection URI (use the same one as your Node.js server)
MONGO_URI=mongodb://localhost:27017/manomitra

# Your LLM Provider API Key (e.g., Google Gemini, required if using LLM for advanced analysis)
# GOOGLE_API_KEY=***

# Analytic Server Configuration
ANALYTIC_SNAPSHOT_VERSION_PREFIX=Daily # e.g., Daily, Weekly, Monthly
```

**Action:** Install dependencies in your new Python environment:

```bash
# Navigate to your new analytic-agentic-server directory
cd analytic-agentic-server

# Create a virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt # If you prefer requirements.txt
# OR
pip install "fastapi[standard]" uvicorn pymongo python-dotenv pandas langgraph langchain-google-genai langchain-core numpy
```

---

### Step 2.2: Implement Logger Utility

This will provide consistent logging across your new Python analytic server.

**File to create:** `analytic-agentic-server/utils/logger.py`

**Content to add:**

```python
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
```

---

### Step 2.3: Implement Database Connection

This module will handle the connection to your MongoDB database.

**File to create:** `analytic-agentic-server/db/connect.py`

**Content to add:**

```python
# analytic-agentic-server/db/connect.py

import os
from pymongo import MongoClient
from dotenv import load_dotenv
from analytic_agentic_server.utils.logger import get_logger

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

```

---

### Step 2.4: Implement Data Fetching Layer

This service will fetch data from your existing Node.js server's MongoDB collections.

**File to create:** `analytic-agentic-server/services/data_fetcher.py`

**Content to add:**

```python
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

```

---

You have now completed the initial setup, logging, database connection, and data fetching components for your new `analytic-agentic-server`.

**Next, we will define the Pydantic schemas (Phase 2.5) and then the core analytic agents (Phase 2.6).**

---



















Okay, let's continue!

---

## Phase 2: Analytic Agentic Server (Python FastAPI)

### Step 2.5: Define Advanced Analytics Pydantic Schemas

We need Pydantic schemas to ensure data consistency and enable structured output from our analytic agents. These will directly map to the MongoDB `AnalyticsSnapshot` model you created in Node.js.

**File to create:** `analytic-agentic-server/schemas/analytics.py`

**Content to add:**

```python
# analytic-agentic-server/schemas/analytics.py

from pydantic import BaseModel, Field, conlist, validator
from typing import List, Dict, Any, Optional
from datetime import datetime
import json # For parsing nested JSON strings

# --- Helper Schemas for Nested Data ---

class TopItem(BaseModel):
    """Schema for items like top stressors or red flags."""
    item: str = Field(..., alias="flag" or "stressor" or "concern" or "topic") # Generic name, will be aliased
    count: int = Field(..., ge=0)

class CounselorReportCount(BaseModel):
    """Schema for top counsellors by reports resolved."""
    counsellorId: str
    name: str
    resolvedCount: int = Field(..., ge=0)

class SentimentTrendItem(BaseModel):
    """Schema for sentiment over time."""
    date: datetime
    averageSentimentScore: float

# --- Main AnalyticsSnapshot Schema ---

class AnalyticsSnapshot(BaseModel):
    """
    Pydantic schema representing a comprehensive analytics snapshot.
    This structure mirrors the MongoDB model 'AnalyticsSnapshot'.
    """
    snapshotTimestamp: datetime = Field(default_factory=datetime.utcnow)
    snapshotVersion: str = Field(...)
    periodStart: Optional[datetime] = None
    periodEnd: Optional[datetime] = None
    
    # --- High-Level Metrics ---
    totalReports: int = Field(default=0, ge=0)
    totalAIReports: int = Field(default=0, ge=0)
    totalManualReports: int = Field(default=0, ge=0)
    totalStudentsEngaged: int = Field(default=0, ge=0)

    # --- Sentiment & Risk Trends ---
    sentimentDistribution: Dict[str, int] = Field(default_factory=dict)
    riskLevelDistribution: Dict[str, int] = Field(default_factory=dict)
    topRedFlags: conlist(TopItem, max_items=10) = Field(default_factory=list) # Max 10 top flags

    # --- Screening Score Insights ---
    avgPHQ9: float = Field(default=0.0, ge=0.0)
    avgGAD7: float = Field(default=0.0, ge=0.0)
    avgGHQ: float = Field(default=0.0, ge=0.0)
    scoreInterpretationDistribution: Dict[str, int] = Field(default_factory=dict)
    phq9Distribution: Dict[str, int] = Field(default_factory=dict)
    gad7Distribution: Dict[str, int] = Field(default_factory=dict)
    ghqDistribution: Dict[str, int] = Field(default_factory=dict)

    # --- Stressor & Concern Analysis ---
    topStressors: conlist(TopItem, max_items=10) = Field(default_factory=list)
    topStudentConcerns: conlist(TopItem, max_items=10) = Field(default_factory=list)
    
    # --- Resource Recommendation Effectiveness ---
    topSuggestedResourceTopics: conlist(TopItem, max_items=10) = Field(default_factory=list)
    
    # --- Resolution & Assignment Metrics ---
    avgReportResolutionTimeDays: float = Field(default=0.0, ge=0.0)
    reportsByStatus: Dict[str, int] = Field(default_factory=dict)
    topCounsellorsByReportsResolved: conlist(CounselorReportCount, max_items=5) = Field(default_factory=list)
    avgTimeToAssignReportHours: float = Field(default=0.0, ge=0.0)

    # --- User Engagement Metrics (Calculated for period) ---
    activeStudentsDaily: Dict[str, int] = Field(default_factory=dict) # e.g., {'2023-01-01': 50}
    activeStudentsWeekly: Dict[str, int] = Field(default_factory=dict)
    activeStudentsMonthly: Dict[str, int] = Field(default_factory=dict)

    # --- Additional Advanced Metrics ---
    emergingThemes: List[str] = Field(default_factory=list)
    sentimentOverTime: List[SentimentTrendItem] = Field(default_factory=list)

    # --- Raw data hashes/versioning for audit ---
    rawDataHash: Optional[str] = None
    filtersUsed: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat() # Ensure datetime is ISO formatted
        }
        # Allow extra fields temporarily for parsing flexibility,
        # but ideally your input data should match the schema.
        extra = "allow"

# --- Request/Input Schemas for triggering analytics ---

class AnalyticsRequest(BaseModel):
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    # Add any other filters an admin might specify
    filters: Dict[str, Any] = Field(default_factory=dict)

class AnalyticsResponse(BaseModel):
    success: bool
    message: str
    snapshot_id: Optional[str] = None
    snapshot_version: Optional[str] = None
    data: Optional[AnalyticsSnapshot] = None # For fetching a specific snapshot

# --- Helper schemas for parsing raw AI report content ---

class AIReportDemoContent(BaseModel):
    student_summary: Optional[str] = None
    key_takeaways: Optional[List[str]] = None
    suggested_first_steps: Optional[List[str]] = None
    helpful_resources: Optional[Dict[str, Any]] = None # flexible
    message_of_encouragement: Optional[str] = None

class AIReportStandardRiskAssessment(BaseModel):
    sentiment: Optional[str] = None
    emotional_intensity: Optional[str] = None
    risk_level: Optional[str] = None
    red_flags: Optional[List[str]] = None

class AIReportStandardScreeningScores(BaseModel):
    phq_9_score: Optional[int] = None
    gad_7_score: Optional[int] = None
    interpretation: Optional[str] = None

class AIReportStandardCounselorRecommendations(BaseModel):
    recommended_resources: Optional[List[Dict[str, Any]]] = None
    suggested_next_steps: Optional[List[str]] = None

class AIReportStandardAnalytics(BaseModel):
    key_stressors_identified: Optional[List[str]] = None
    potential_underlying_issues: Optional[List[str]] = None

class AIReportStandardContent(BaseModel):
    student_id: Optional[str] = None
    chat_summary: Optional[str] = None
    risk_assessment: Optional[AIReportStandardRiskAssessment] = None
    screening_scores: Optional[AIReportStandardScreeningScores] = None
    counselor_recommendations: Optional[AIReportStandardCounselorRecommendations] = None
    analytics: Optional[AIReportStandardAnalytics] = None
    report_generated_at: Optional[datetime] = None

class AIReportFull(BaseModel):
    _id: str
    student: str
    demo_report: Dict[str, str] # Raw JSON string in 'demo_content'
    standard_report: Dict[str, str] # Raw JSON string in 'standard_content'
    createdAt: datetime
    updatedAt: datetime

    @validator('demo_report', pre=True)
    def parse_demo_report_content(cls, v):
        if isinstance(v, dict) and 'demo_content' in v and isinstance(v['demo_content'], str):
            try:
                # Attempt to parse the JSON string, but return the raw dict if it fails
                return json.loads(v['demo_content'])
            except json.JSONDecodeError:
                # If parsing fails, just return the dict as is (or handle error)
                return v
        return v

    @validator('standard_report', pre=True)
    def parse_standard_report_content(cls, v):
        if isinstance(v, dict) and 'standard_content' in v and isinstance(v['standard_content'], str):
            try:
                return json.loads(v['standard_content'])
            except json.JSONDecodeError:
                return v
        return v
```

**Explanation of Schemas:**

*   **`AnalyticsSnapshot`**: This is the core output schema, mirroring the MongoDB model you created. It defines the structure for the comprehensive, pre-calculated analytics.
*   **`TopItem`**, **`CounselorReportCount`**, **`SentimentTrendItem`**: Helper schemas for nested arrays within `AnalyticsSnapshot`.
*   **`AnalyticsRequest`**: An input schema for the FastAPI endpoint that triggers analytics generation, allowing for date filtering or other parameters.
*   **`AnalyticsResponse`**: The output schema for the FastAPI endpoint, indicating success and potentially the ID of the new snapshot.
*   **`AIReportFull`** (and its sub-schemas): These are crucial for correctly *parsing* the nested JSON strings (`demo_content`, `standard_content`) stored within your existing `AIReport` documents in MongoDB. The `@validator` decorators will automatically attempt to `json.loads()` these strings when you create an `AIReportFull` instance from a MongoDB document.

---

### Step 2.6: Implement Core Analytic Agents

Now, we will build the "brains" of your analytic server: the Python agents that perform the actual data processing. This will involve the `AnalyticState` and various sub-agents.

**File to create:** `analytic-agentic-server/agents/analytic_supervisor.py`

**Content to add:**

```python
# analytic-agentic-server/agents/analytic_supervisor.py

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
import pandas as pd
import json
import hashlib
from collections import Counter
import numpy as np # For numerical operations, especially averages
import os

from langgraph.graph import StateGraph, END
from analytic_agentic_server.utils.logger import get_logger
from analytic_agentic_server.services.data_fetcher import DataFetcher
from analytic_agentic_server.schemas.analytics import AnalyticsSnapshot, AIReportFull
from analytic_agentic_server.db.connect import get_db

# Optional: If you decide to use an LLM for advanced theme detection
# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.pydantic_v1 import BaseModel, Field

logger = get_logger(__name__)

# ---------------- Analytic Agent State ---------------- #

class AnalyticState(TypedDict):
    """
    Represents the state passed between analytic agents.
    """
    raw_reports: List[Dict[str, Any]]
    raw_ai_reports: List[Dict[str, Any]]
    raw_students: List[Dict[str, Any]]
    raw_counsellors: List[Dict[str, Any]]
    raw_volunteers: List[Dict[str, Any]] # Add volunteers if needed for engagement analysis

    reports_df: Optional[pd.DataFrame] # Processed DataFrame for manual reports
    ai_reports_df: Optional[pd.DataFrame] # Processed DataFrame for AI reports
    combined_reports_df: Optional[pd.DataFrame] # Combined DataFrame for overall analysis
    
    analytic_results: Optional[Dict[str, Any]] # Final structured analytics
    
    snapshot_version: str
    period_start: Optional[datetime]
    period_end: Optional[datetime]
    filters_used: Dict[str, Any] # Filters applied when generating this snapshot

# ---------------- Analytic Agent Functions ---------------- #

# Initialize DataFetcher and AnalyticSnapshot collection
data_fetcher = DataFetcher()
analytics_collection = get_db()["analyticssnapshots"] # Collection name matches model in Node.js

async def report_ingestion_agent(state: AnalyticState) -> AnalyticState:
    """
    Fetches raw reports (manual and AI-generated) from MongoDB.
    """
    logger.info("Analytic Agent: report_ingestion_agent started.")
    
    period_start = state.get("period_start")
    period_end = state.get("period_end")

    try:
        state["raw_reports"] = data_fetcher.fetch_all_reports(period_start=period_start, end_date=period_end)
        state["raw_ai_reports"] = data_fetcher.fetch_all_ai_reports(period_start=period_start, end_date=period_end)
        
        # Fetch auxiliary data needed for linking/contextualizing
        state["raw_students"] = data_fetcher.fetch_all_students()
        state["raw_counsellors"] = data_fetcher.fetch_all_counsellors()
        state["raw_volunteers"] = data_fetcher.fetch_all_volunteers()

        logger.info(f"Fetched {len(state['raw_reports'])} manual reports and {len(state['raw_ai_reports'])} AI reports.")
        logger.info(f"Fetched {len(state['raw_students'])} students, {len(state['raw_counsellors'])} counsellors.")
    except Exception as e:
        logger.error(f"Error in report_ingestion_agent: {e}", exc_info=True)
        raise

    return state

async def data_preprocessing_agent(state: AnalyticState) -> AnalyticState:
    """
    Converts raw data into Pandas DataFrames, parses nested JSON, and standardizes fields.
    """
    logger.info("Analytic Agent: data_preprocessing_agent started.")

    # Process Manual Reports
    if state["raw_reports"]:
        reports_df = pd.DataFrame(state["raw_reports"])
        # Ensure 'createdAt' is datetime for sorting and filtering
        reports_df['createdAt'] = pd.to_datetime(reports_df['createdAt'])
        reports_df['report_type'] = 'manual'
        reports_df['owner_id'] = reports_df['owner'].astype(str) # Ensure string conversion
        reports_df['assigned_to_id'] = reports_df['assignedTo'].astype(str) # Ensure string conversion
        # Drop original ObjectId references if no longer needed
        reports_df = reports_df.drop(columns=['owner', 'assignedTo'], errors='ignore')
        state["reports_df"] = reports_df
        logger.info(f"Processed {len(reports_df)} manual reports into DataFrame.")
    else:
        state["reports_df"] = pd.DataFrame()
        logger.warning("No raw manual reports to preprocess.")

    # Process AI Reports
    if state["raw_ai_reports"]:
        ai_reports_list = []
        for raw_ai_report in state["raw_ai_reports"]:
            try:
                # Use AIReportFull schema for robust parsing of nested JSON strings
                parsed_ai_report = AIReportFull(**raw_ai_report).dict(by_alias=True, exclude_none=True)
                ai_reports_list.append(parsed_ai_report)
            except Exception as e:
                logger.error(f"Failed to parse AI report content for ID {raw_ai_report.get('_id')}: {e}", exc_info=True)
                # Append raw report if parsing fails, but be aware of its format
                ai_reports_list.append(raw_ai_report)

        ai_reports_df = pd.DataFrame(ai_reports_list)
        ai_reports_df['createdAt'] = pd.to_datetime(ai_reports_df['createdAt'])
        ai_reports_df['report_type'] = 'ai'
        ai_reports_df['owner_id'] = ai_reports_df['student'].astype(str) # AI reports are owned by 'student' field
        ai_reports_df = ai_reports_df.drop(columns=['student'], errors='ignore')

        # Extract nested fields from parsed JSON
        # Example: Sentiment and Risk from standard_report
        ai_reports_df['sentiment'] = ai_reports_df['standard_report'].apply(lambda x: x.get('risk_assessment', {}).get('sentiment') if isinstance(x, dict) else None)
        ai_reports_df['risk_level'] = ai_reports_df['standard_report'].apply(lambda x: x.get('risk_assessment', {}).get('risk_level') if isinstance(x, dict) else None)
        ai_reports_df['red_flags'] = ai_reports_df['standard_report'].apply(lambda x: x.get('risk_assessment', {}).get('red_flags') if isinstance(x, dict) else [])
        ai_reports_df['phq_9_score'] = ai_reports_df['standard_report'].apply(lambda x: x.get('screening_scores', {}).get('phq_9_score') if isinstance(x, dict) else None)
        ai_reports_df['gad_7_score'] = ai_reports_df['standard_report'].apply(lambda x: x.get('screening_scores', {}).get('gad_7_score') if isinstance(x, dict) else None)
        # Add other extractions as needed for PHQ/GAD interpretation, stressors, etc.
        
        state["ai_reports_df"] = ai_reports_df
        logger.info(f"Processed {len(ai_reports_df)} AI reports into DataFrame.")
    else:
        state["ai_reports_df"] = pd.DataFrame()
        logger.warning("No raw AI reports to preprocess.")

    # Combine DataFrames if both exist
    if not state["reports_df"].empty and not state["ai_reports_df"].empty:
        # Align columns before concatenation
        common_columns = list(set(state["reports_df"].columns) & set(state["ai_reports_df"].columns))
        state["combined_reports_df"] = pd.concat([
            state["reports_df"][common_columns],
            state["ai_reports_df"][common_columns]
        ], ignore_index=True)
    elif not state["reports_df"].empty:
        state["combined_reports_df"] = state["reports_df"]
    elif not state["ai_reports_df"].empty:
        state["combined_reports_df"] = state["ai_reports_df"]
    else:
        state["combined_reports_df"] = pd.DataFrame()
        logger.warning("No reports (manual or AI) to combine.")

    return state

async def sentiment_risk_analyzer(state: AnalyticState) -> AnalyticState:
    """
    Analyzes sentiment and risk levels across all reports.
    """
    logger.info("Analytic Agent: sentiment_risk_analyzer started.")
    analytic_results = state.get("analytic_results", {})
    df = state["combined_reports_df"]

    if df.empty:
        logger.warning("No combined reports DataFrame for sentiment_risk_analyzer.")
        state["analytic_results"] = analytic_results
        return state

    # Sentiment Distribution
    sentiment_counts = df['sentiment'].value_counts(dropna=True).to_dict()
    analytic_results['sentimentDistribution'] = sentiment_counts
    
    # Risk Level Distribution
    risk_level_counts = df['risk_level'].value_counts(dropna=True).to_dict()
    analytic_results['riskLevelDistribution'] = risk_level_counts

    # Top Red Flags (requires handling lists of red flags)
    all_red_flags = []
    # Collect red flags from AI reports (already parsed as list)
    if 'red_flags' in df.columns:
        df['red_flags'].dropna().apply(lambda x: all_red_flags.extend(x) if isinstance(x, list) else None)
    # You might need to add a "red_flags" extraction for manual reports too if they have a similar field
    
    top_flags = Counter(all_red_flags).most_common(10)
    analytic_results['topRedFlags'] = [{"flag": flag, "count": count} for flag, count in top_flags]

    state["analytic_results"] = analytic_results
    logger.info("Sentiment and Risk analysis complete.")
    return state

async def screening_score_aggregator(state: AnalyticState) -> AnalyticState:
    """
    Aggregates and analyzes screening scores (PHQ-9, GAD-7, GHQ).
    """
    logger.info("Analytic Agent: screening_score_aggregator started.")
    analytic_results = state.get("analytic_results", {})
    df = state["combined_reports_df"]

    if df.empty:
        logger.warning("No combined reports DataFrame for screening_score_aggregator.")
        state["analytic_results"] = analytic_results
        return state

    # Average Scores
    analytic_results['avgPHQ9'] = df['phq_9_score'].mean() if 'phq_9_score' in df.columns else 0.0
    analytic_results['avgGAD7'] = df['gad_7_score'].mean() if 'gad_7_score' in df.columns else 0.0
    # Assuming GHQ will be extracted if available
    analytic_results['avgGHQ'] = df['ghq'].mean() if 'ghq' in df.columns else 0.0 # Placeholder

    # Score Distributions (simple binning for PHQ-9/GAD-7)
    # You can define more sophisticated bins based on clinical guidelines
    if 'phq_9_score' in df.columns:
        phq9_bins = pd.cut(df['phq_9_score'], bins=[-1, 4, 9, 14, 19, 27], labels=['Minimal', 'Mild', 'Moderate', 'Mod-Severe', 'Severe'])
        analytic_results['phq9Distribution'] = phq9_bins.value_counts(dropna=False).to_dict()
    
    if 'gad_7_score' in df.columns:
        gad7_bins = pd.cut(df['gad_7_score'], bins=[-1, 4, 9, 14, 21], labels=['Minimal', 'Mild', 'Moderate', 'Severe'])
        analytic_results['gad7Distribution'] = gad7_bins.value_counts(dropna=False).to_dict()

    state["analytic_results"] = analytic_results
    logger.info("Screening score aggregation complete.")
    return state

async def stressor_concern_extractor(state: AnalyticState) -> AnalyticState:
    """
    Extracts and ranks key stressors and student-expressed concerns.
    """
    logger.info("Analytic Agent: stressor_concern_extractor started.")
    analytic_results = state.get("analytic_results", {})
    df = state["combined_reports_df"]

    if df.empty:
        logger.warning("No combined reports DataFrame for stressor_concern_extractor.")
        state["analytic_results"] = analytic_results
        return state

    all_stressors = []
    all_concerns = []
    
    # Process AI report analytics for stressors and concerns
    if 'standard_report' in df.columns:
        df['standard_report'].dropna().apply(lambda x: all_stressors.extend(x.get('analytics', {}).get('key_stressors_identified', [])) if isinstance(x, dict) else None)
        df['standard_report'].dropna().apply(lambda x: all_concerns.extend(x.get('summary', {}).get('student_expressed_concerns', [])) if isinstance(x, dict) else None)
        # Note: 'summary' is from demo_report, 'analytics' is from standard_report
        # You might need to unify these in preprocessing or extract from both.
        df['demo_report'].dropna().apply(lambda x: all_concerns.extend(x.get('student_expressed_concerns', [])) if isinstance(x, dict) else None)

    # Process manual reports: assume 'content' might contain keywords or 'tags' field
    # This requires more advanced NLP or explicit tag extraction from manual report content
    if 'tags' in df.columns:
        df['tags'].dropna().apply(lambda x: all_stressors.extend(x) if isinstance(x, list) else None)
        
    # As a fallback for manual reports, simple keyword extraction from content
    # For a real system, you'd apply NLP models here.
    if 'content' in df.columns:
        for content in df['content'].dropna():
            if "exam" in content.lower(): all_stressors.append("Exam Stress")
            if "sleep" in content.lower(): all_stressors.append("Sleep Problems")
            if "alone" in content.lower(): all_concerns.append("Feeling Alone")


    top_stressors = Counter(all_stressors).most_common(10)
    analytic_results['topStressors'] = [{"stressor": s, "count": c} for s, c in top_stressors]

    top_concerns = Counter(all_concerns).most_common(10)
    analytic_results['topStudentConcerns'] = [{"concern": c, "count": c_count} for c, c_count in top_concerns]

    state["analytic_results"] = analytic_results
    logger.info("Stressor and concern extraction complete.")
    return state

async def resource_topic_aggregator(state: AnalyticState) -> AnalyticState:
    """
    Aggregates suggested resource topics from AI reports.
    """
    logger.info("Analytic Agent: resource_topic_aggregator started.")
    analytic_results = state.get("analytic_results", {})
    df = state["ai_reports_df"] # Only AI reports suggest resource topics

    if df.empty:
        logger.warning("No AI reports DataFrame for resource_topic_aggregator.")
        analytic_results['topSuggestedResourceTopics'] = []
        state["analytic_results"] = analytic_results
        return state

    all_resource_topics = []
    if 'standard_report' in df.columns:
        df['standard_report'].dropna().apply(lambda x: all_resource_topics.extend(x.get('summary', {}).get('suggested_resource_topics', [])) if isinstance(x, dict) else None)
    # The new AI reports place suggested_resource_topics in `summary`, which is part of the `demo_report`
    if 'demo_report' in df.columns:
         df['demo_report'].dropna().apply(lambda x: all_resource_topics.extend(x.get('suggested_resource_topics', [])) if isinstance(x, dict) else None)


    top_resource_topics = Counter(all_resource_topics).most_common(10)
    analytic_results['topSuggestedResourceTopics'] = [{"topic": t, "count": c} for t, c in top_resource_topics]

    state["analytic_results"] = analytic_results
    logger.info("Resource topic aggregation complete.")
    return state


async def resolution_efficiency_metrics(state: AnalyticState) -> AnalyticState:
    """
    Calculates metrics related to manual report resolution and assignment.
    """
    logger.info("Analytic Agent: resolution_efficiency_metrics started.")
    analytic_results = state.get("analytic_results", {})
    df = state["reports_df"] # Only manual reports have 'status', 'assignedTo', 'resolvedAt'

    if df.empty:
        logger.warning("No manual reports DataFrame for resolution_efficiency_metrics.")
        state["analytic_results"] = analytic_results
        return state

    # Reports by Status
    analytic_results['reportsByStatus'] = df['status'].value_counts(dropna=False).to_dict()

    # Average Resolution Time (for 'resolved' reports)
    resolved_reports = df[df['status'] == 'resolved'].copy() # Use .copy() to avoid SettingWithCopyWarning
    if not resolved_reports.empty:
        resolved_reports['resolvedAt'] = pd.to_datetime(resolved_reports['resolvedAt'])
        resolved_reports['resolution_duration'] = (resolved_reports['resolvedAt'] - resolved_reports['createdAt']).dt.total_seconds() / (3600 * 24) # in days
        analytic_results['avgReportResolutionTimeDays'] = resolved_reports['resolution_duration'].mean()
    else:
        analytic_results['avgReportResolutionTimeDays'] = 0.0

    # Average Time to Assign (for reports that were assigned)
    assigned_reports = df[df['assigned_to_id'].notna()].copy()
    if not assigned_reports.empty:
        # Assuming we might not have an 'assignedAt' timestamp, use the first 'updatedAt' after assignment if 'assignedTo' exists
        # A proper 'assignedAt' field in Report model would be ideal.
        # For now, let's assume 'assignedTo' is set early and use report creation time.
        # This metric would be more accurate if there was an 'assignedAt' field in the DB.
        # Let's placeholder this or make it more robust later.
        analytic_results['avgTimeToAssignReportHours'] = 0.0 # Placeholder for now

    # Top Counsellors by Reports Resolved
    if 'assigned_to_id' in df.columns and not state["raw_counsellors"].empty:
        counsellors_df = pd.DataFrame(state["raw_counsellors"])
        resolved_counts = df[df['status'] == 'resolved']['assigned_to_id'].value_counts().reset_index()
        resolved_counts.columns = ['counsellorId', 'resolvedCount']
        
        if not resolved_counts.empty:
            top_counsellors = pd.merge(resolved_counts, counsellors_df[['_id', 'name']], left_on='counsellorId', right_on='_id', how='left')
            top_counsellors['name'] = top_counsellors['name'].fillna("Unknown Counsellor")
            top_counsellors = top_counsellors[['counsellorId', 'name', 'resolvedCount']].sort_values(by='resolvedCount', ascending=False).head(5)
            analytic_results['topCounsellorsByReportsResolved'] = top_counsellors.to_dict(orient='records')
        else:
            analytic_results['topCounsellorsByReportsResolved'] = []
    else:
        analytic_results['topCounsellorsByReportsResolved'] = []


    state["analytic_results"] = analytic_results
    logger.info("Resolution efficiency metrics complete.")
    return state


async def user_engagement_metrics(state: AnalyticState) -> AnalyticState:
    """
    Calculates user engagement metrics (e.g., active students).
    Requires 'lastActive' field on Student model.
    """
    logger.info("Analytic Agent: user_engagement_metrics started.")
    analytic_results = state.get("analytic_results", {})
    
    if not state["raw_students"]:
        logger.warning("No raw student data for user_engagement_metrics.")
        state["analytic_results"] = analytic_results
        return state

    students_df = pd.DataFrame(state["raw_students"])
    if 'lastActive' not in students_df.columns:
        logger.warning("Student DataFrame missing 'lastActive' column for engagement metrics.")
        state["analytic_results"] = analytic_results
        return state

    students_df['lastActive'] = pd.to_datetime(students_df['lastActive'])
    
    # Define the period for this snapshot if not already set (e.g., for ad-hoc)
    period_end = state.get("period_end") or datetime.now(timezone.utc)
    period_start = state.get("period_start") or (period_end - timedelta(days=30)) # Default to last 30 days if not specified

    # Filter students active within the snapshot period
    active_students_in_period = students_df[(students_df['lastActive'] >= period_start) & (students_df['lastActive'] <= period_end)]

    # Total students engaged in the period (unique active students)
    analytic_results['totalStudentsEngaged'] = active_students_in_period['_id'].nunique()

    # Daily Active Students (DAS) for the period
    # Group by date of last active and count unique students
    daily_active_counts = active_students_in_period.groupby(active_students_in_period['lastActive'].dt.date)['_id'].nunique()
    analytic_results['activeStudentsDaily'] = {str(date): count for date, count in daily_active_counts.items()}
    
    # Weekly Active Students (WAS)
    weekly_active_counts = active_students_in_period.groupby(active_students_in_period['lastActive'].dt.to_period('W'))['_id'].nunique()
    analytic_results['activeStudentsWeekly'] = {str(period): count for period, count in weekly_active_counts.items()}
    
    # Monthly Active Students (MAS)
    monthly_active_counts = active_students_in_period.groupby(active_students_in_period['lastActive'].dt.to_period('M'))['_id'].nunique()
    analytic_results['activeStudentsMonthly'] = {str(period): count for period, count in monthly_active_counts.items()}

    state["analytic_results"] = analytic_results
    logger.info("User engagement metrics complete.")
    return state


# Optional: LLM agent for emerging themes
# class EmergingThemesOutput(BaseModel):
#     emerging_themes: List[str] = Field(..., description="List of 3-5 emerging mental health themes from reports.")

# llm_analytic = ChatGoogleGenerativeAI(model="gemini-2.0-flash") # Use a cheaper model for this if possible

# async def emerging_theme_detector_agent(state: AnalyticState) -> AnalyticState:
#     """
#     Uses an LLM to detect emerging themes from a sample of report contents.
#     """
#     logger.info("Analytic Agent: emerging_theme_detector_agent started.")
#     analytic_results = state.get("analytic_results", {})
#     df = state["combined_reports_df"]

#     if df.empty or 'content' not in df.columns:
#         logger.warning("No reports or content column for emerging_theme_detector_agent.")
#         analytic_results['emergingThemes'] = []
#         state["analytic_results"] = analytic_results
#         return state

#     # Take a sample of report contents (e.g., top 20 most recent reports)
#     sample_contents = df.sort_values(by='createdAt', ascending=False)['content'].head(20).tolist()
#     if not sample_contents:
#         analytic_results['emergingThemes'] = []
#         state["analytic_results"] = analytic_results
#         return state

#     prompt_template = ChatPromptTemplate.from_messages([
#         ("system", """You are an expert mental health analyst. Read the following student report summaries/contents and identify 3-5 distinct, emerging mental health themes or trends that might require institutional attention. Focus on patterns rather than single incidents. Output as a JSON list of themes."""),
#         ("user", "Recent student reports:\n\n{reports_sample}")
#     ])
    
#     try:
#         chain = prompt_template | llm_analytic.with_structured_output(EmergingThemesOutput)
#         result = await chain.ainvoke({"reports_sample": "\n---\n".join(sample_contents)})
#         analytic_results['emergingThemes'] = result.emerging_themes
#     except Exception as e:
#         logger.error(f"LLM failed to detect emerging themes: {e}", exc_info=True)
#         analytic_results['emergingThemes'] = ["LLM theme detection failed."]

#     state["analytic_results"] = analytic_results
#     logger.info("Emerging theme detection complete.")
#     return state


async def snapshot_generator(state: AnalyticState) -> AnalyticState:
    """
    Finalizes the analytic results into the AnalyticsSnapshot schema.
    """
    logger.info("Analytic Agent: snapshot_generator started.")
    
    analytic_results = state.get("analytic_results", {})
    
    # Ensure all required fields for AnalyticsSnapshot are present, even if empty/default
    # Use the Pydantic model to validate and structure the final output
    final_snapshot_data = AnalyticsSnapshot(
        snapshotVersion=state["snapshot_version"],
        periodStart=state.get("period_start"),
        periodEnd=state.get("period_end"),
        filtersUsed=state.get("filters_used", {}),
        **analytic_results
    )
    
    # Generate a simple hash of the input data for auditing
    data_to_hash = {
        "raw_reports": state["raw_reports"],
        "raw_ai_reports": state["raw_ai_reports"],
        "period_start": state.get("period_start"),
        "period_end": state.get("period_end")
    }
    json_string = json.dumps(data_to_hash, sort_keys=True, default=str)
    final_snapshot_data.rawDataHash = hashlib.sha256(json_string.encode('utf-8')).hexdigest()

    state["analytic_results"] = final_snapshot_data.dict(by_alias=True, exclude_none=True)
    logger.info("Analytics snapshot generated.")
    return state

async def db_saver_agent(state: AnalyticState) -> AnalyticState:
    """
    Saves the final analytic results to the AnalyticsSnapshot collection in MongoDB.
    """
    logger.info("Analytic Agent: db_saver_agent started.")
    
    if not state.get("analytic_results"):
        logger.error("No analytic results to save to database.")
        return state

    try:
        # Pymongo insert_one expects a dictionary
        insert_result = analytics_collection.insert_one(state["analytic_results"])
        state["analytic_results"]["_id"] = str(insert_result.inserted_id) # Add generated ID back to results
        logger.info(f"Analytics snapshot saved with ID: {insert_result.inserted_id}")
    except Exception as e:
        logger.error(f"Error saving analytic results to DB: {e}", exc_info=True)
        raise

    return state

# ---------------- Graph Orchestration ---------------- #

def build_analytic_graph():
    """
    Builds the LangGraph workflow for advanced analytics.
    """
    workflow = StateGraph(AnalyticState)

    workflow.add_node("ingestion", report_ingestion_agent)
    workflow.add_node("preprocessing", data_preprocessing_agent)
    workflow.add_node("sentiment_risk", sentiment_risk_analyzer)
    workflow.add_node("screening_scores", screening_score_aggregator)
    workflow.add_node("stressors_concerns", stressor_concern_extractor)
    workflow.add_node("resource_topics", resource_topic_aggregator)
    workflow.add_node("resolution_metrics", resolution_efficiency_metrics)
    workflow.add_node("user_engagement", user_engagement_metrics)
    # workflow.add_node("emerging_themes", emerging_theme_detector_agent) # Uncomment if using LLM agent
    workflow.add_node("snapshot_generation", snapshot_generator)
    workflow.add_node("db_saver", db_saver_agent)

    workflow.set_entry_point("ingestion")
    workflow.add_edge("ingestion", "preprocessing")
    workflow.add_edge("preprocessing", "sentiment_risk")
    workflow.add_edge("sentiment_risk", "screening_scores")
    workflow.add_edge("screening_scores", "stressors_concerns")
    workflow.add_edge("stressors_concerns", "resource_topics")
    workflow.add_edge("resource_topics", "resolution_metrics")
    workflow.add_edge("resolution_metrics", "user_engagement")
    # workflow.add_edge("user_engagement", "emerging_themes") # Connect if using LLM agent
    # workflow.add_edge("emerging_themes", "snapshot_generation") # Connect if using LLM agent
    workflow.add_edge("user_engagement", "snapshot_generation") # If not using LLM agent
    workflow.add_edge("snapshot_generation", "db_saver")
    workflow.add_edge("db_saver", END)

    return workflow.compile()

analytic_graph_app = build_analytic_graph()

```

**Explanation of Analytic Agents:**

*   **`AnalyticState`**: Holds all raw data fetched, intermediate DataFrames, and the final `analytic_results` dictionary.
*   **`report_ingestion_agent`**: Connects to MongoDB via `DataFetcher` and pulls all `Report`, `AIReport`, `Student`, `Counsellor`, `Volunteer` data within the specified time period.
*   **`data_preprocessing_agent`**:
    *   Converts raw MongoDB dicts into Pandas DataFrames.
    *   **Crucially, it uses `AIReportFull` Pydantic schema** to automatically parse the `demo_report` and `standard_report` JSON strings within `AIReport` documents into Python dictionaries. This makes nested data accessible.
    *   Extracts key fields (`sentiment`, `risk_level`, `phq_9_score`, `gad_7_score`, `red_flags`, `key_stressors_identified`, etc.) from both manual reports and the parsed AI report content, unifying them into a combined DataFrame.
*   **`sentiment_risk_analyzer`**: Calculates distributions of sentiment, risk levels, and lists top red flags using `value_counts()` and `Counter`.
*   **`screening_score_aggregator`**: Computes average PHQ-9/GAD-7/GHQ scores and their distributions (e.g., 'Minimal', 'Mild', 'Moderate').
*   **`stressor_concern_extractor`**: Aggregates `key_stressors_identified` and `student_expressed_concerns` from AI reports and performs basic keyword extraction from manual report content to find top stressors and concerns.
*   **`resource_topic_aggregator`**: Collects `suggested_resource_topics` from AI reports and ranks them.
*   **`resolution_efficiency_metrics`**: Calculates average report resolution time, counts reports by status, and identifies top-performing counsellors.
*   **`user_engagement_metrics`**: Uses the `lastActive` field from the student model to calculate daily, weekly, and monthly active student counts for the given period.
*   **`emerging_theme_detector_agent` (Optional, commented out):** This is where you would integrate an LLM (using `langchain-google-genai`) to analyze report content for less obvious, emerging themes. Uncomment and configure if you enable `GOOGLE_API_KEY` in `.env`.
*   **`snapshot_generator`**: Takes all the calculated metrics and structures them into the `AnalyticsSnapshot` Pydantic schema. It also generates a hash of the raw input data for version control/auditing.
*   **`db_saver_agent`**: Connects to the `analyticssnapshots` collection and saves the finalized `AnalyticsSnapshot` document to MongoDB.
*   **`build_analytic_graph`**: Defines the LangGraph workflow, ensuring agents run in the correct sequence.

---

**You have now completed the core logic for your new `analytic-agentic-server`!**

The next step will be to create the FastAPI `main.py` file to expose endpoints that trigger this analytic workflow and allow your Node.js server to fetch the generated snapshots.























Excellent! Let's continue with **Phase 2.7: Implement the FastAPI Application (`main.py`)** for your new `analytic-agentic-server`.

This file will expose the API endpoints that your existing Node.js backend (and eventually the frontend) will interact with.

---

## Phase 2: Analytic Agentic Server (Python FastAPI)

### Step 2.7: Implement the FastAPI Application (`main.py`)

This file will be the entry point for your new Python analytic server. It will define endpoints to trigger analytics generation and retrieve saved snapshots.

**File to create:** `analytic-agentic-server/main.py`

**Content to add:**

```python
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
```

**Explanation of `main.py`:**

*   **`lifespan` Context Manager**: Ensures that the MongoDB connection is properly established when the FastAPI server starts and closed when it shuts down, using `connect_db()` and `close_db()` from `db/connect.py`.
*   **`/generate-analytics` (POST)**:
    *   This is the primary endpoint for triggering a new analytics run.
    *   It accepts `AnalyticsRequest` with optional `period_start`, `period_end`, and `filters`.
    *   It constructs the `AnalyticState` and invokes the `analytic_graph_app` (your LangGraph workflow).
    *   On success, it returns the `_id` and `snapshot_version` of the newly saved `AnalyticsSnapshot` document.
    *   A unique `snapshot_version` is generated using a combination of a prefix (from `.env`), the date period, and a short UUID.
*   **`/analytics/latest` (GET)**:
    *   Retrieves the single most recent `AnalyticsSnapshot` document from MongoDB, sorted by `snapshotTimestamp` in descending order.
    *   Returns the full `AnalyticsSnapshot` object.
*   **`/analytics/versions` (GET)**:
    *   Returns a lightweight list of all snapshot versions (`_id`, `snapshotVersion`, `snapshotTimestamp`, `periodStart`, `periodEnd`), allowing the admin dashboard to populate a dropdown for historical comparison.
*   **`/analytics/{snapshot_id}` (GET)**:
    *   Retrieves a specific `AnalyticsSnapshot` document by its MongoDB `_id`.
    *   This allows the admin to load a particular historical snapshot for detailed viewing.
*   **Error Handling**: Includes `try-except` blocks and `HTTPException` for robust error reporting.

---

**You can now run this new analytic server independently:**

```bash
cd analytic-agentic-server
uvicorn main:app --reload --port 8001
```

(Ensure your existing Node.js server is running on its usual port, e.g., 5000, and your MongoDB is accessible.)

**Next, we will move on to Phase 3: Integrating with your existing Node.js backend.** This will involve updating your `server/controllers/admin.controller.js` and `server/routes/admin.routes.js` to communicate with this new Python server.

































Alright, let's proceed with **Phase 3: Existing Backend (`server` - Node.js) Integration**.

This phase involves updating your Node.js backend to make API calls to the new Python analytic server and to serve the fetched analytics data to your frontend.

---

## Phase 3: Existing Backend (`server` - Node.js) Integration

**Goal:** Modify your Node.js backend to expose endpoints that:
1.  Trigger the analytics generation process on the Python analytic server.
2.  Retrieve the generated `AnalyticsSnapshot` data from MongoDB (which was written by the Python server).

---

### Step 3.1: Update Frontend API Client (`web/lib/api.ts`)

Before modifying the Node.js backend, it's a good practice to prepare the frontend's API client (`web/lib/api.ts`). This helps you visualize the new interaction endpoints.

**File to modify:** `web/lib/api.ts`

**Content to add/modify (within `adminAPI`):**

```typescript
// web/lib/api.ts
import { api } from './axios';
// ... (other imports)
import { AnalyticsSnapshot } from '@/types/analytics'; // You'll create this type in the frontend later

// Helper to consistently extract data from response
const getData = (res: any) => res.data.data;

// ... (existing authAPI, studentAPI, counsellorAPI, etc.)

// Admin API
export const adminAPI = {
  // ... (existing admin API methods)

  // NEW: Trigger advanced analytics generation
  triggerAdvancedAnalytics: async (period_start?: string, period_end?: string, filters?: any) => {
    return api.post('/admin/analytics/generate', { period_start, period_end, filters }).then(res => res.data);
  },
  // NEW: Get the latest advanced analytics snapshot
  getLatestAdvancedAnalytics: async () => api.get('/admin/analytics/advanced/latest').then(getData),
  // NEW: Get a specific advanced analytics snapshot by its ID
  getAdvancedAnalyticsById: async (snapshotId: string) => api.get(`/admin/analytics/advanced/${snapshotId}`).then(getData),
  // NEW: Get a list of all available snapshot versions
  getAllAnalyticsVersions: async () => api.get('/admin/analytics/advanced/versions').then(getData),

  // ... (rest of admin API methods)
};

// ... (rest of the file)
```

**Explanation:**
*   We've added new methods to `adminAPI` for triggering, getting the latest, getting by ID, and listing versions of analytics snapshots.
*   Note the `AnalyticsSnapshot` import. We will create this type in `web/types/analytics.d.ts` in Phase 4.

---

### Step 3.2: Update Admin Controller (`server/controllers/admin.controller.js`)

Now, let's add the controller functions in your Node.js backend that will handle requests from the frontend for advanced analytics. These functions will interact with your Python server (for triggering) and your MongoDB (for retrieving stored snapshots).

**File to modify:** `server/controllers/admin.controller.js`

**Content to add (at the end of the file, or in a new dedicated analytics controller if preferred, but for now, adding here is simpler):**

```javascript
// FILE: server/controllers/admin.controller.js

// ... (existing imports, ensure 'Admin' model is imported for context)
import AnalyticsSnapshot from "../models/analyticSnapshot.model.js"; // NEW: Import the AnalyticSnapshot model
import axios from "axios"; // NEW: For making HTTP requests to your Python analytic server

// Ensure AGENTIC_ANALYTIC_SERVER_URL is in your .env
// You'll need to add this to your server/.env or server/config.env.example
const ANALYTIC_SERVER_URL = process.env.ANALYTIC_SERVER_URL || 'http://localhost:8001'; // Default to port 8001 for Python server

// ... (existing controller functions: getProfile, updateProfile, getDashboardStats, etc.)


// NEW: Admin Controller Functions for Advanced Analytics

// @desc    Admin triggers a new analytics snapshot generation on the Python server
// @route   POST /api/admin/analytics/generate
export const triggerAdvancedAnalyticsGeneration = async (req, res) => {
  try {
    const { period_start, period_end, filters } = req.body; // Optional date range or filters

    // Make an HTTP POST request to your Python analytic server
    const pythonServerResponse = await axios.post(
      `${ANALYTIC_SERVER_URL}/generate-analytics`,
      { period_start, period_end, filters }
    );

    // Python server returns success status, snapshot ID, and version
    if (pythonServerResponse.data.success) {
      res.status(200).json({
        success: true,
        message: pythonServerResponse.data.message,
        snapshot_id: pythonServerResponse.data.snapshot_id,
        snapshot_version: pythonServerResponse.data.snapshot_version,
      });
    } else {
      res.status(500).json({
        success: false,
        message: pythonServerResponse.data.message || "Failed to generate analytics on Python server.",
      });
    }
  } catch (error) {
    console.error("Error triggering advanced analytics generation:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || "Internal Server Error during analytics trigger.",
    });
  }
};

// @desc    Retrieves the most recent analytics snapshot
// @route   GET /api/admin/analytics/advanced/latest
export const getLatestAdvancedAnalyticsSnapshot = async (req, res) => {
  try {
    const latestSnapshot = await AnalyticsSnapshot.findOne()
      .sort({ snapshotTimestamp: -1 }); // Get the most recent one

    if (!latestSnapshot) {
      return res.status(404).json({ success: false, message: "No analytics snapshots found." });
    }

    res.status(200).json({
      success: true,
      data: latestSnapshot,
    });
  } catch (error) {
    console.error("Error fetching latest analytics snapshot:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

// @desc    Retrieves a specific analytics snapshot by its ID
// @route   GET /api/admin/analytics/advanced/:snapshotId
export const getAdvancedAnalyticsSnapshotById = async (req, res) => {
  try {
    const { snapshotId } = req.params;
    const snapshot = await AnalyticsSnapshot.findById(snapshotId);

    if (!snapshot) {
      return res.status(404).json({ success: false, message: "Analytics snapshot not found." });
    }

    res.status(200).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    console.error("Error fetching analytics snapshot by ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

// @desc    Retrieves a list of all available analytics snapshot versions
// @route   GET /api/admin/analytics/advanced/versions
export const getAllAnalyticsSnapshotVersions = async (req, res) => {
  try {
    const versions = await AnalyticsSnapshot.find({})
      .select('snapshotVersion snapshotTimestamp periodStart periodEnd') // Only fetch necessary fields
      .sort({ snapshotTimestamp: -1 }); // Sort by latest first

    res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error) {
    console.error("Error fetching all analytics snapshot versions:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};
```

**Explanation of Changes:**
*   **`AnalyticSnapshot` Import**: Imports the model we defined in Step 1.1.
*   **`axios` Import**: Required to make HTTP requests from Node.js to your Python server.
*   **`ANALYTIC_SERVER_URL` Constant**: Fetches the URL for your Python server from `process.env`. **You MUST add this to your `server/.env` or `server/config.env.example` file.**
    ```
    # server/.env or server/config.env.example
    # ...
    ANALYTIC_SERVER_URL=http://localhost:8001
    # ...
    ```
*   **`triggerAdvancedAnalyticsGeneration`**: This function is the bridge. It takes any date range or filters from the frontend, forwards them to the Python server's `/generate-analytics` endpoint, and relays the response.
*   **`getLatestAdvancedAnalyticsSnapshot`**: Directly queries your MongoDB (using the `AnalyticsSnapshot` model) for the most recently created analytics document.
*   **`getAdvancedAnalyticsSnapshotById`**: Fetches a specific snapshot based on its MongoDB `_id`.
*   **`getAllAnalyticsSnapshotVersions`**: Fetches a lightweight list of all snapshots to provide a history for the frontend.

---

### Step 3.3: Update Admin Routes (`server/routes/admin.routes.js`)

Finally, we need to add the new API routes that map to the controller functions you just created.

**File to modify:** `server/routes/admin.routes.js`

**Content to add/modify:**

```javascript
// FILE: server/routes/admin.routes.js
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  // ... (existing imports for admin controller functions)
  triggerAdvancedAnalyticsGeneration, // NEW
  getLatestAdvancedAnalyticsSnapshot, // NEW
  getAdvancedAnalyticsSnapshotById,   // NEW
  getAllAnalyticsSnapshotVersions,    // NEW
} from "../controllers/admin.controller.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.use(protect, requireRole([ROLES.ADMIN]));

// ... (existing admin routes)

// NEW: Advanced Analytics Routes
router.post("/analytics/generate", triggerAdvancedAnalyticsGeneration);
router.get("/analytics/advanced/latest", getLatestAdvancedAnalyticsSnapshot);
router.get("/analytics/advanced/versions", getAllAnalyticsSnapshotVersions);
router.get("/analytics/advanced/:snapshotId", getAdvancedAnalyticsSnapshotById);


// ... (rest of the file)
```

---

**Crucial Checkpoint:**

1.  **Restart your Node.js server.** It needs to pick up the new `analyticSnapshot.model.js` and the new controller/route definitions.
2.  **Ensure your Python analytic server is running** (e.g., `uvicorn main:app --reload --port 8001`).
3.  **Verify `ANALYTIC_SERVER_URL` is correctly set** in your `server/.env` file.

At this point, your Node.js backend can now:
*   Receive requests from the frontend to trigger advanced analytics.
*   Send requests to your Python analytic server.
*   Read the `AnalyticsSnapshot` documents directly from MongoDB.

Next, we'll move on to **Phase 4: Frontend (`web`) Modifications** to create the new dashboard page and connect it to these new Node.js endpoints.
















Great! Now that the backend integration is complete, let's move to **Phase 4: Frontend (`web`) Modifications**.

This phase will involve:
1.  Creating a new type definition for `AnalyticsSnapshot`.
2.  Creating a new admin page for advanced analytics.
3.  Updating the admin sidebar to link to this new page.
4.  Implementing `react-query` hooks to interact with your Node.js backend's new analytics endpoints.
5.  Setting up a basic charting library to visualize the data.

---

## Phase 4: Frontend (`web`) Modifications

**Goal:** Create a new page in the admin dashboard to display the advanced analytics, allowing administrators to trigger new snapshots and view historical data.

---

### Step 4.1: Create Frontend Type Definition (`web/types/analytics.d.ts`)

You need a new TypeScript type to define the structure of the `AnalyticsSnapshot` that your frontend will receive. This should closely mirror your Mongoose/Pydantic schemas.

**File to create:** `web/types/analytics.d.ts`

**Content to add:**

```typescript
// web/types/analytics.d.ts

// --- Helper Types for Nested Data ---

interface TopItem {
  item: string;
  count: number;
}

interface CounselorReportCount {
  counsellorId: string;
  name: string;
  resolvedCount: number;
}

interface SentimentTrendItem {
  date: string; // ISO string from backend
  averageSentimentScore: number;
}

// --- Main AnalyticsSnapshot Type ---

export interface AnalyticsSnapshot {
  _id: string; // MongoDB ObjectId as string
  snapshotTimestamp: string; // ISO string from backend
  snapshotVersion: string;
  periodStart?: string; // ISO string
  periodEnd?: string;   // ISO string
  
  // --- High-Level Metrics ---
  totalReports: number;
  totalAIReports: number;
  totalManualReports: number;
  totalStudentsEngaged: number;

  // --- Sentiment & Risk Trends ---
  sentimentDistribution: { [key: string]: number };
  riskLevelDistribution: { [key: string]: number };
  topRedFlags: TopItem[];

  // --- Screening Score Insights ---
  avgPHQ9: number;
  avgGAD7: number;
  avgGHQ: number;
  scoreInterpretationDistribution: { [key: string]: number };
  phq9Distribution: { [key: string]: number };
  gad7Distribution: { [key: string]: number };
  ghqDistribution: { [key: string]: number };

  // --- Stressor & Concern Analysis ---
  topStressors: TopItem[];
  topStudentConcerns: TopItem[];
  
  // --- Resource Recommendation Effectiveness ---
  topSuggestedResourceTopics: TopItem[];
  
  // --- Resolution & Assignment Metrics ---
  avgReportResolutionTimeDays: number;
  reportsByStatus: { [key: string]: number };
  topCounsellorsByReportsResolved: CounselorReportCount[];
  avgTimeToAssignReportHours: number;

  // --- User Engagement Metrics ---
  activeStudentsDaily: { [date: string]: number };
  activeStudentsWeekly: { [period: string]: number };
  activeStudentsMonthly: { [period: string]: number };

  // --- Additional Advanced Metrics ---
  emergingThemes: string[];
  sentimentOverTime: SentimentTrendItem[];

  // --- Raw data hashes/versioning for audit ---
  rawDataHash?: string;
  filtersUsed: { [key: string]: any };

  createdAt: string;
  updatedAt: string;
}

// --- API Response Type for Triggering ---
export interface TriggerAnalyticsResponse {
  success: boolean;
  message: string;
  snapshot_id: string;
  snapshot_version: string;
}

// --- API Response Type for Fetching (consistent with Node.js controller) ---
export interface FetchAnalyticsResponse {
    success: boolean;
    data: AnalyticsSnapshot;
}

export interface FetchAnalyticsVersionsResponse {
    success: boolean;
    data: Array<{
        _id: string;
        snapshotVersion: string;
        snapshotTimestamp: string;
        periodStart?: string;
        periodEnd?: string;
    }>;
}
```

**Action:** Update `web/lib/api.ts` to import this new type, as prepared in Step 3.1.

```typescript
// web/lib/api.ts
// ...
import { AnalyticsSnapshot, TriggerAnalyticsResponse, FetchAnalyticsResponse, FetchAnalyticsVersionsResponse } from '@/types/analytics'; // NEW

// ...

// Admin API
export const adminAPI = {
  // ... (existing admin API methods)

  // NEW: Trigger advanced analytics generation
  triggerAdvancedAnalytics: async (period_start?: string, period_end?: string, filters?: any): Promise<TriggerAnalyticsResponse> => {
    const response = await api.post('/admin/analytics/generate', { period_start, period_end, filters });
    return response.data;
  },
  // NEW: Get the latest advanced analytics snapshot
  getLatestAdvancedAnalytics: async (): Promise<FetchAnalyticsResponse> => api.get('/admin/analytics/advanced/latest').then(res => res.data),
  // NEW: Get a specific advanced analytics snapshot by its ID
  getAdvancedAnalyticsById: async (snapshotId: string): Promise<FetchAnalyticsResponse> => api.get(`/admin/analytics/advanced/${snapshotId}`).then(res => res.data),
  // NEW: Get a list of all available snapshot versions
  getAllAnalyticsVersions: async (): Promise<FetchAnalyticsVersionsResponse> => api.get('/admin/analytics/advanced/versions').then(res => res.data),

  // ... (rest of admin API methods)
};
```

---

### Step 4.2: Create New `react-query` Hooks (`web/hooks/api/useAdmin.ts`)

You'll need new hooks to interact with the new `adminAPI` methods.

**File to modify:** `web/hooks/api/useAdmin.ts`

**Content to add/modify (within `web/hooks/api/useAdmin.ts`):**

```typescript
// FILE: web/hooks/api/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { toast } from "sonner";
// ... (existing imports)
import { AnalyticsSnapshot, TriggerAnalyticsResponse, FetchAnalyticsVersionsResponse } from '@/types/analytics'; // NEW

// ... (existing useAdminDashboardStats, useAllStudents, useAllCounsellors, etc.)

// NEW: Hook to trigger advanced analytics generation
export const useTriggerAdvancedAnalytics = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ period_start, period_end, filters }: { period_start?: string; period_end?: string; filters?: any }) =>
      adminAPI.triggerAdvancedAnalytics(period_start, period_end, filters),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["latestAdvancedAnalytics"] }); // Refetch latest
      queryClient.invalidateQueries({ queryKey: ["allAnalyticsVersions"] }); // Refetch versions list
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to trigger analytics generation.");
    },
  });
};

// NEW: Hook to get the latest advanced analytics snapshot
export const useLatestAdvancedAnalytics = () => {
  return useQuery<AnalyticsSnapshot>({
    queryKey: ["latestAdvancedAnalytics"],
    queryFn: () => adminAPI.getLatestAdvancedAnalytics().then(res => res.data),
    staleTime: 5 * 60 * 1000, // Analytics are not real-time, can be stale for a bit
    cacheTime: 10 * 60 * 1000,
  });
};

// NEW: Hook to get a specific advanced analytics snapshot by its ID
export const useAdvancedAnalyticsById = (snapshotId: string) => {
  return useQuery<AnalyticsSnapshot>({
    queryKey: ["advancedAnalytics", snapshotId],
    queryFn: () => adminAPI.getAdvancedAnalyticsById(snapshotId).then(res => res.data),
    enabled: !!snapshotId, // Only run query if snapshotId is provided
  });
};

// NEW: Hook to get a list of all available analytics snapshot versions
export const useAllAnalyticsVersions = () => {
  return useQuery<FetchAnalyticsVersionsResponse['data']>({
    queryKey: ["allAnalyticsVersions"],
    queryFn: () => adminAPI.getAllAnalyticsVersions().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

// ... (rest of the file)
```

---

### Step 4.3: Install Charting Library

We'll use `recharts` for simple and elegant charts.

**Action:** Install `recharts` in your `web` directory.

```bash
# Navigate to your web directory
cd web

# Install recharts
npm install recharts
# OR
yarn add recharts
```

---

### Step 4.4: Create the New Admin Page (`web/app/(dashboard)/admin/advanced-analytics/page.tsx`)

This is the main UI for your advanced analytics dashboard.

**File to create:** `web/app/(dashboard)/admin/advanced-analytics/page.tsx`

**Content to add:**

```typescript jsx
// web/app/(dashboard)/admin/advanced-analytics/page.tsx
"use client";
import { useState, useMemo } from "react";
import { useTriggerAdvancedAnalytics, useLatestAdvancedAnalytics, useAllAnalyticsVersions, useAdvancedAnalyticsById } from "@/hooks/api/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, RefreshCw, Graph, TrendingUp, Users, Heart, ShieldAlert, BookOpen, Clock, CalendarDays } from "lucide-react";
import dayjs from "dayjs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { AnalyticsSnapshot } from "@/types/analytics";


// Helper function to prepare data for charts
const prepareChartData = (data: { [key: string]: number }) => 
  Object.entries(data).map(([name, value]) => ({ name, value }));

const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#ffbb28', '#a4de6c'];

export default function AdminAdvancedAnalyticsPage() {
    const triggerAnalyticsMutation = useTriggerAdvancedAnalytics();
    const { data: latestAnalytics, isLoading: isLoadingLatest, refetch: refetchLatest } = useLatestAdvancedAnalytics();
    const { data: versionsData, isLoading: isLoadingVersions } = useAllAnalyticsVersions();

    const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | undefined>(undefined);
    // Fetch the detailed snapshot if a specific version is selected, otherwise use latest
    const { data: displayedAnalytics, isLoading: isLoadingDisplayed } = useAdvancedAnalyticsById(selectedSnapshotId || "");
    
    // Use memo to pick the snapshot to display (latest by default, or specific by ID)
    const currentAnalytics: AnalyticsSnapshot | undefined = useMemo(() => {
        if (selectedSnapshotId && displayedAnalytics) {
            return displayedAnalytics;
        }
        return latestAnalytics;
    }, [selectedSnapshotId, latestAnalytics, displayedAnalytics]);

    const handleTriggerAnalytics = () => {
        triggerAnalyticsMutation.mutate({}, {
            onSuccess: (response) => {
                toast.success(`Analytics snapshot ${response.snapshot_version} generated!`);
                refetchLatest(); // Refresh latest after new one is generated
                setSelectedSnapshotId(response.snapshot_id); // Automatically select new snapshot
            },
            onError: (err) => {
                toast.error(err.message || "Failed to generate analytics.");
            },
        });
    };

    const handleVersionChange = (versionId: string) => {
        setSelectedSnapshotId(versionId);
    };

    if (isLoadingLatest || isLoadingVersions || isLoadingDisplayed) {
        return <div className="flex h-full justify-center items-center"><Spinner size="lg" /></div>;
    }

    if (!currentAnalytics && !isLoadingLatest) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 space-y-6">
                <Graph className="w-24 h-24 text-muted-foreground" />
                <h1 className="text-3xl font-bold text-center">No Advanced Analytics Data Yet</h1>
                <p className="text-muted-foreground text-center max-w-md">
                    Generate the first snapshot of your student mental health analytics to see comprehensive trends and insights.
                </p>
                <Button onClick={handleTriggerAnalytics} disabled={triggerAnalyticsMutation.isPending}>
                    {triggerAnalyticsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Generate Initial Analytics
                </Button>
                {triggerAnalyticsMutation.isPending && <p className="text-sm text-muted-foreground">This may take a moment...</p>}
            </div>
        );
    }

    const {
        snapshotVersion, snapshotTimestamp, periodStart, periodEnd,
        totalReports, totalAIReports, totalManualReports, totalStudentsEngaged,
        sentimentDistribution, riskLevelDistribution, topRedFlags,
        avgPHQ9, avgGAD7, avgGHQ, phq9Distribution, gad7Distribution, ghqDistribution,
        topStressors, topStudentConcerns, topSuggestedResourceTopics,
        avgReportResolutionTimeDays, reportsByStatus, topCounsellorsByReportsResolved, avgTimeToAssignReportHours,
        activeStudentsDaily, activeStudentsWeekly, activeStudentsMonthly,
        emergingThemes, sentimentOverTime
    } = currentAnalytics || {}; // Destructure, handling undefined if currentAnalytics is null/undefined

    const sentimentChartData = prepareChartData(sentimentDistribution || {});
    const riskLevelChartData = prepareChartData(riskLevelDistribution || {});
    const reportsByStatusChartData = prepareChartData(reportsByStatus || {});
    const phq9ChartData = prepareChartData(phq9Distribution || {});
    const gad7ChartData = prepareChartData(gad7Distribution || {});

    // Ensure TopItem arrays are in correct format for charts
    const topRedFlagsChartData = topRedFlags?.map(item => ({ name: item.flag, value: item.count })) || [];
    const topStressorsChartData = topStressors?.map(item => ({ name: item.stressor, value: item.count })) || [];
    const topStudentConcernsChartData = topStudentConcerns?.map(item => ({ name: item.concern, value: item.count })) || [];
    const topSuggestedResourceTopicsChartData = topSuggestedResourceTopics?.map(item => ({ name: item.topic, value: item.count })) || [];
    const topCounsellorsChartData = topCounsellorsByReportsResolved?.map(item => ({ name: item.name, value: item.resolvedCount })) || [];
    
    // Prepare engagement data
    const dailyActiveStudentsChartData = Object.entries(activeStudentsDaily || {})
        .map(([date, count]) => ({ date: dayjs(date).format('MMM D'), count }))
        .sort((a,b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
                <div className="flex items-center gap-4">
                    <Select value={selectedSnapshotId} onValueChange={handleVersionChange} disabled={isLoadingVersions || !versionsData?.length}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Snapshot Version" />
                        </SelectTrigger>
                        <SelectContent>
                            {versionsData?.map((version: any) => (
                                <SelectItem key={version._id} value={version._id}>
                                    {version.snapshotVersion} ({dayjs(version.snapshotTimestamp).format('MMM D, YYYY')})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleTriggerAnalytics} disabled={triggerAnalyticsMutation.isPending}>
                        {triggerAnalyticsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Generate New Snapshot
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Snapshot Overview</CardTitle>
                    <CardDescription>
                        Version: {snapshotVersion} | Generated: {dayjs(snapshotTimestamp).format('MMM D, YYYY h:mm A')}
                        {periodStart && periodEnd && ` | Data Period: ${dayjs(periodStart).format('MMM D, YYYY')} - ${dayjs(periodEnd).format('MMM D, YYYY')}`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                        <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalReports + totalAIReports}</p>
                        <p className="text-muted-foreground">Total Reports</p>
                    </div>
                    <div className="text-center">
                        <Heart className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalStudentsEngaged}</p>
                        <p className="text-muted-foreground">Students Engaged</p>
                    </div>
                    <div className="text-center">
                        <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalAIReports}</p>
                        <p className="text-muted-foreground">AI Reports</p>
                    </div>
                    <div className="text-center">
                        <BookOpen className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalManualReports}</p>
                        <p className="text-muted-foreground">Manual Reports</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentiment Distribution */}
                <Card>
                    <CardHeader><CardTitle>Sentiment Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={sentimentChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {sentimentChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Risk Level Distribution */}
                <Card>
                    <CardHeader><CardTitle>Risk Level Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={riskLevelChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Red Flags */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-red-500"/> Top Red Flags</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {topRedFlagsChartData.length > 0 ? topRedFlagsChartData.map((item, index) => (
                                <li key={index} className="flex justify-between items-center text-sm">
                                    <span>{item.name}</span>
                                    <Badge variant="destructive">{item.value}</Badge>
                                </li>
                            )) : <p className="text-muted-foreground text-sm">No red flags identified in this period.</p>}
                        </ul>
                    </CardContent>
                </Card>

                {/* Top Stressors */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-yellow-500"/> Top Stressors</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {topStressorsChartData.length > 0 ? topStressorsChartData.map((item, index) => (
                                <li key={index} className="flex justify-between items-center text-sm">
                                    <span>{item.name}</span>
                                    <Badge variant="default">{item.value}</Badge>
                                </li>
                            )) : <p className="text-muted-foreground text-sm">No significant stressors identified.</p>}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* PHQ-9 Distribution */}
                <Card>
                    <CardHeader><CardTitle>PHQ-9 Score Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={phq9ChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#ffc658" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* GAD-7 Distribution */}
                <Card>
                    <CardHeader><CardTitle>GAD-7 Score Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={gad7ChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#ff7300" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Average Resolution Time & Reports by Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Manual Report Management</CardTitle>
                    <CardDescription>Average Resolution Time: {avgReportResolutionTimeDays?.toFixed(2) || 'N/A'} days</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportsByStatusChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Daily Active Students */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5"/> Daily Active Students</CardTitle>
                    <CardDescription>Students who showed activity (e.g., login, report, chat) within the period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyActiveStudentsChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Active Students" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}```

---

### Step 4.5: Update Admin Sidebar Navigation (`web/components/layout/sidebar.tsx`)

Modify the sidebar to include the new "Advanced Analytics" link for administrators.

**File to modify:** `web/components/layout/sidebar.tsx`

**Content to modify (within the `getNavigationItems` function for `admin` role):**

```typescript jsx
// FILE: web/components/layout/sidebar.tsx
// ... (existing imports)
import {
  // ... (existing icons)
  ChartBarBigIcon // NEW: Import for advanced analytics
} from "lucide-react";
// ...

  const getNavigationItems = () => {
    if (!user) return [];

    // ... (baseItems and other roles)

      case "admin":
        return [
          ...baseItems,
          {
            title: "Users",
            href: "/admin/users",
            icon: Users,
            badge: null,
          },
          {
            title: "Reports",
            href: "/admin/reports",
            icon: FileText,
            badge: null,
          },
          {
            title: "Analytics", // Existing, but will be the new advanced page
            href: "/admin/analytics", // Keep the same path, just update the content
            icon: ChartBarBigIcon, // Use a new, distinct icon for Advanced Analytics
            badge: null,
          },
          {
            title: "Advanced Analytics", // NEW: Entry for advanced analytics
            href: "/admin/advanced-analytics", // Point to the new page
            icon: BarChart3, // Using BarChart3 for a distinct icon
            badge: null,
          },
          {
            title: "Rooms",
            href: "/admin/rooms",
            icon: MessageSquare,
            badge: null,
          },
          {
            title: "Resources", // Link for managing pre-vetted resources
            href: "/admin/resources",
            icon: BookOpen,
            badge: null,
          },
          {
            title: "System",
            href: "/admin/system",
            icon: Settings,
            badge: null,
          },
          {
            title: "Feedback",
            href: "/admin/feedback",
            icon: Star,
            badge: null,
          },
          {
            title: "Notifications",
            href: "/admin/notifications",
            icon: Bell,
            badge: null,
          },
          {
            title: "Profile",
            href: "/admin/profile",
            icon: User,
            badge: null,
          },
        ];

      default:
        return baseItems;
    }
  };

// ... (rest of the file)
```

**Note on Analytics paths:**
*   I've added `/admin/advanced-analytics` for the new page. You could also *replace* the existing `/admin/analytics` page completely with the new advanced one if you deem the old analytics (`getSystemAnalytics`) redundant. For now, I've kept both as distinct links. If you want to replace, simply change `href` of the old 'Analytics' entry to `/admin/advanced-analytics`.

---

**Final Checkpoints:**

1.  **Restart your Next.js frontend** (`npm run dev` in `web` directory) to pick up all new files and changes.
2.  **Verify your Node.js backend (`server`) is running.**
3.  **Verify your Python analytic server (`analytic-agentic-server`) is running.**
4.  **Log in as an Admin** in your frontend.
5.  Navigate to the "Advanced Analytics" (or updated "Analytics") link in the sidebar.
6.  Click the "Generate New Snapshot" button. Observe the logs in your Python analytic server.
7.  Once generated, the dashboard should populate with data.

This completes the full implementation of your independent analytic-multi-agentic-server and its integration into your ManoMitra application! You now have a powerful, extensible analytics system.








































You're right to ask for clarification! My previous instruction was a bit ambiguous there.

When I said:

> {
>   title: "Analytics", // Existing, but will be the new advanced page
>   href: "/admin/analytics", // Keep the same path, just update the content
>   icon: ChartBarBigIcon, // Use a new, distinct icon for Advanced Analytics
>   badge: null,
> },

And then:

> Note on Analytics paths:
> I've added `/admin/advanced-analytics` for the new page. You could also *replace* the existing `/admin/analytics` page completely with the new advanced one if you deem the old analytics (`getSystemAnalytics`) redundant. For now, I've kept both as distinct links. If you want to replace, simply change `href` of the old 'Analytics' entry to `/admin/advanced-analytics`.

**What I meant by "just update the content" for `/admin/analytics` was to completely replace the content of your existing `web/app/(dashboard)/admin/analytics/page.tsx` file with the content of the new `AdminAdvancedAnalyticsPage` component.**

---

**Here's the corrected and clearer instruction:**

**Action:** **Replace the entire content** of your existing file `web/app/(dashboard)/admin/analytics/page.tsx` with the code you just created for `AdminAdvancedAnalyticsPage`.

**File to modify:** `web/app/(dashboard)/admin/analytics/page.tsx`

**New Content:**

```typescript jsx
// web/app/(dashboard)/admin/analytics/page.tsx
// This file will now host the Advanced Analytics Dashboard
"use client";
import { useState, useMemo } from "react";
import { useTriggerAdvancedAnalytics, useLatestAdvancedAnalytics, useAllAnalyticsVersions, useAdvancedAnalyticsById } from "@/hooks/api/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, RefreshCw, Graph, TrendingUp, Users, Heart, ShieldAlert, BookOpen, Clock, CalendarDays, FileText } from "lucide-react"; // Added FileText
import dayjs from "dayjs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { AnalyticsSnapshot } from "@/types/analytics";


// Helper function to prepare data for charts
const prepareChartData = (data: { [key: string]: number } | undefined) => 
  Object.entries(data || {}).map(([name, value]) => ({ name, value }));

const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#ffbb28', '#a4de6c'];

export default function AdminAnalyticsPage() { // Keep the same export name
    const triggerAnalyticsMutation = useTriggerAdvancedAnalytics();
    const { data: latestAnalytics, isLoading: isLoadingLatest, refetch: refetchLatest } = useLatestAdvancedAnalytics();
    const { data: versionsData, isLoading: isLoadingVersions } = useAllAnalyticsVersions();

    const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | undefined>(undefined);
    // Fetch the detailed snapshot if a specific version is selected, otherwise use latest
    const { data: displayedAnalytics, isLoading: isLoadingDisplayed } = useAdvancedAnalyticsById(selectedSnapshotId || "");
    
    // Use memo to pick the snapshot to display (latest by default, or specific by ID)
    const currentAnalytics: AnalyticsSnapshot | undefined = useMemo(() => {
        if (selectedSnapshotId && displayedAnalytics) {
            return displayedAnalytics;
        }
        return latestAnalytics;
    }, [selectedSnapshotId, latestAnalytics, displayedAnalytics]);

    // Set the initial selected snapshot to the latest one once versions are loaded
    useMemo(() => {
        if (!selectedSnapshotId && versionsData && versionsData.length > 0 && latestAnalytics?._id) {
            setSelectedSnapshotId(latestAnalytics._id);
        }
    }, [versionsData, selectedSnapshotId, latestAnalytics]);


    const handleTriggerAnalytics = () => {
        triggerAnalyticsMutation.mutate({}, {
            onSuccess: (response) => {
                toast.success(`Analytics snapshot ${response.snapshot_version} generated!`);
                refetchLatest(); // Refresh latest after new one is generated
                setSelectedSnapshotId(response.snapshot_id); // Automatically select new snapshot
            },
            onError: (err) => {
                toast.error(err.message || "Failed to generate analytics.");
            },
        });
    };

    const handleVersionChange = (versionId: string) => {
        setSelectedSnapshotId(versionId);
    };

    if (isLoadingLatest || isLoadingVersions || isLoadingDisplayed) {
        return <div className="flex h-full justify-center items-center"><Spinner size="lg" /></div>;
    }

    if (!currentAnalytics && !isLoadingLatest) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 space-y-6">
                <Graph className="w-24 h-24 text-muted-foreground" />
                <h1 className="text-3xl font-bold text-center">No Advanced Analytics Data Yet</h1>
                <p className="text-muted-foreground text-center max-w-md">
                    Generate the first snapshot of your student mental health analytics to see comprehensive trends and insights.
                </p>
                <Button onClick={handleTriggerAnalytics} disabled={triggerAnalyticsMutation.isPending}>
                    {triggerAnalyticsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Generate Initial Analytics
                </Button>
                {triggerAnalyticsMutation.isPending && <p className="text-sm text-muted-foreground">This may take a moment...</p>}
            </div>
        );
    }

    const {
        snapshotVersion, snapshotTimestamp, periodStart, periodEnd,
        totalReports, totalAIReports, totalManualReports, totalStudentsEngaged,
        sentimentDistribution, riskLevelDistribution, topRedFlags,
        avgPHQ9, avgGAD7, avgGHQ, phq9Distribution, gad7Distribution, ghqDistribution,
        topStressors, topStudentConcerns, topSuggestedResourceTopics,
        avgReportResolutionTimeDays, reportsByStatus, topCounsellorsByReportsResolved, avgTimeToAssignReportHours,
        activeStudentsDaily, activeStudentsWeekly, activeStudentsMonthly,
        emergingThemes, sentimentOverTime
    } = currentAnalytics || {}; // Destructure, handling undefined if currentAnalytics is null/undefined

    const sentimentChartData = prepareChartData(sentimentDistribution);
    const riskLevelChartData = prepareChartData(riskLevelDistribution);
    const reportsByStatusChartData = prepareChartData(reportsByStatus);
    const phq9ChartData = prepareChartData(phq9Distribution);
    const gad7ChartData = prepareChartData(gad7Distribution);
    const ghqChartData = prepareChartData(ghqDistribution); // For GHQ if available

    // Ensure TopItem arrays are in correct format for charts
    const topRedFlagsChartData = topRedFlags?.map(item => ({ name: item.item, value: item.count })) || [];
    const topStressorsChartData = topStressors?.map(item => ({ name: item.item, value: item.count })) || [];
    const topStudentConcernsChartData = topStudentConcerns?.map(item => ({ name: item.item, value: item.count })) || [];
    const topSuggestedResourceTopicsChartData = topSuggestedResourceTopics?.map(item => ({ name: item.item, value: item.count })) || [];
    const topCounsellorsChartData = topCounsellorsByReportsResolved?.map(item => ({ name: item.name, value: item.resolvedCount })) || [];
    
    // Prepare engagement data
    const dailyActiveStudentsChartData = Object.entries(activeStudentsDaily || {})
        .map(([date, count]) => ({ date: dayjs(date).format('MMM D'), count }))
        .sort((a,b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
                <div className="flex items-center gap-4">
                    <Select value={selectedSnapshotId} onValueChange={handleVersionChange} disabled={isLoadingVersions || !versionsData?.length}>
                        <SelectTrigger className="w-[250px]"> {/* Increased width */}
                            <SelectValue placeholder="Select Snapshot Version" />
                        </SelectTrigger>
                        <SelectContent>
                            {versionsData?.map((version: any) => (
                                <SelectItem key={version._id} value={version._id}>
                                    {version.snapshotVersion} ({dayjs(version.snapshotTimestamp).format('MMM D, YY')})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleTriggerAnalytics} disabled={triggerAnalyticsMutation.isPending}>
                        {triggerAnalyticsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Generate New Snapshot
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Snapshot Overview</CardTitle>
                    <CardDescription>
                        Version: <span className="font-medium text-foreground">{snapshotVersion}</span> | Generated: {dayjs(snapshotTimestamp).format('MMM D, YYYY h:mm A')}
                        {periodStart && periodEnd && ` | Data Period: ${dayjs(periodStart).format('MMM D, YYYY')} - ${dayjs(periodEnd).format('MMM D, YYYY')}`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                        <Graph className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalReports + totalAIReports}</p>
                        <p className="text-muted-foreground">Total Reports</p>
                    </div>
                    <div className="text-center">
                        <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalStudentsEngaged}</p>
                        <p className="text-muted-foreground">Students Engaged</p>
                    </div>
                    <div className="text-center">
                        <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalAIReports}</p>
                        <p className="text-muted-foreground">AI Reports</p>
                    </div>
                    <div className="text-center">
                        <BookOpen className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalManualReports}</p>
                        <p className="text-muted-foreground">Manual Reports</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentiment Distribution */}
                <Card>
                    <CardHeader><CardTitle>Sentiment Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={sentimentChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {sentimentChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Risk Level Distribution */}
                <Card>
                    <CardHeader><CardTitle>Risk Level Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={riskLevelChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Red Flags */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-red-500"/> Top Red Flags</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {topRedFlagsChartData.length > 0 ? topRedFlagsChartData.map((item, index) => (
                                <li key={index} className="flex justify-between items-center text-sm">
                                    <span>{item.name}</span>
                                    <Badge variant="destructive">{item.value}</Badge>
                                </li>
                            )) : <p className="text-muted-foreground text-sm">No red flags identified in this period.</p>}
                        </ul>
                    </CardContent>
                </Card>

                {/* Top Stressors */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-yellow-500"/> Top Stressors</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {topStressorsChartData.length > 0 ? topStressorsChartData.map((item, index) => (
                                <li key={index} className="flex justify-between items-center text-sm">
                                    <span>{item.name}</span>
                                    <Badge variant="default">{item.value}</Badge>
                                </li>
                            )) : <p className="text-muted-foreground text-sm">No significant stressors identified.</p>}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* PHQ-9 Distribution */}
                <Card>
                    <CardHeader><CardTitle>PHQ-9 Score Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={phq9ChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#ffc658" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* GAD-7 Distribution */}
                <Card>
                    <CardHeader><CardTitle>GAD-7 Score Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={gad7ChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#ff7300" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Average Resolution Time & Reports by Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Manual Report Management</CardTitle>
                    <CardDescription>Average Resolution Time: {avgReportResolutionTimeDays?.toFixed(2) || 'N/A'} days</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportsByStatusChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Daily Active Students */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5"/> Daily Active Students</CardTitle>
                    <CardDescription>Students who showed activity (e.g., login, report, chat) within the period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyActiveStudentsChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Active Students" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
```

**What this change means:**

1.  **Deletion of Old Code:** Your previous basic `/admin/analytics` page (which used `useSystemAnalytics` and showed just 4 simple cards) is completely gone.
2.  **Advanced Analytics Takes Over:** The content of your new, advanced analytics component now fully occupies `web/app/(dashboard)/admin/analytics/page.tsx`.
3.  **Sidebar Alignment:** When an admin clicks "Analytics" in the sidebar (which has `href="/admin/analytics"`), they will now directly see this new, feature-rich dashboard.

**Action:** Go ahead and save the updated content to `web/app/(dashboard)/admin/analytics/page.tsx`. Then, restart your Next.js server (`npm run dev` in the `web` directory) and verify the changes in your admin dashboard. You should see the new advanced analytics page when you click the "Analytics" link.





https://aistudio.google.com/prompts/1dabvrke_5yE62EDPl9OcqhpGxrpqTaj5?save=true





