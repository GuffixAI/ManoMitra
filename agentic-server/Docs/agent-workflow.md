# 🕸️ LangGraph Workflow (Mermaid Diagram)

```mermaid
flowchart TD

    A[Conversation History] --> B[Sentiment & Risk Analyzer Agent]
    B --> C[Screening Agent]
    C --> D[Conversation Summarizer Agent]
    D --> E[Recommendation Agent]
    E --> F[Resource Retrieval Agent]
    F --> G[Resource Matcher Agent]
    G --> H[Report Generator Agent]
    H --> I[Supervisor Agent]

    I --> J["Demo Report (Student-facing)"]
    I --> K["Standard Report (Admin-facing)"]

    %% Tools for Resource Retrieval
    F -.-> T1[Tavily Search]
    F -.-> T2[Brave Search]
    F -.-> T3[Jina Search]
    F -.-> T4[ArXiv]
    F -.-> T5[PubMed]
    F -.-> T6[Wikipedia]
    F -.-> T7[YouTube]
```

---

# 📌 Explanation of Flow

1. **Conversation History** → passed in when the student clicks the button.
2. **Sentiment & Risk Analyzer** → detects emotions, red flags.
3. **Screening Agent** → estimates PHQ-9, GAD-7, GHQ scores.
4. **Summarizer Agent** → extracts key points & student concerns.
5. **Recommendation Agent** → decides what categories of resources are needed.
6. **Resource Retrieval Agent** → queries tools (Tavily, Brave, Jina, ArXiv, PubMed, Wikipedia, YouTube).
7. **Resource Matcher Agent** → filters best matches for student context.
8. **Report Generator Agent** → builds **Demo & Standard reports**.
9. **Supervisor Agent** → orchestrates everything & ensures consistent JSON.

---