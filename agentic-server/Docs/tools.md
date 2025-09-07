
# 🛠️ Tools & Agent Mapping

## 1. **Sentiment & Risk Analyzer Agent**

* **Tools:** ❌ None (LLM-only → does emotional analysis & red flag detection).

---

## 2. **Screening Agent**

* **Tools:** ❌ None (uses internal scoring logic for PHQ-9, GAD-7, GHQ).

---

## 3. **Conversation Summarizer Agent**

* **Tools:** ❌ None (LLM-only → summarization of conversation).

---

## 4. **Recommendation Agent**

* **Tools:** ❌ None directly (decides categories → delegates to Resource Retrieval Agent).

---

## 5. **Resource Retrieval Agent**

* **Tools:** ✅ Uses multiple external APIs:

  * **Tavily Search** → Rich answers & links.
  * **Brave Search** → Reliable general wellness resources.
  * **Jina Search** → Semantic retrieval from webpages.
  * **ArXiv Tool** → Academic mental health research papers.
  * **PubMed Tool** → Clinical & psychological studies.
  * **Wikipedia Tool** → General/simple explanations.
  * **YouTube Tool** → Meditation & relaxation videos.

---

## 6. **Resource Matcher Agent**

* **Tools:** ❌ None (LLM-only → filters & personalizes resources fetched by Retrieval Agent).

---

## 7. **Report Generator Agent**

* **Tools:** ❌ None (LLM-only → compiles structured JSON report).

---

## 8. **Supervisor Agent (LangGraph)**

* **Tools:** ✅ LangGraph orchestration (to call agents in sequence/parallel).

---

# 📌 Final Overview Table

| **Agent**                    | **Uses Tools?** | **Tools**                                              |
| ---------------------------- | --------------- | ------------------------------------------------------ |
| Sentiment & Risk Analyzer    | No              | –                                                      |
| Screening Agent              | No              | –                                                      |
| Summarizer Agent             | No              | –                                                      |
| Recommendation Agent         | No              | – (delegates to Retrieval Agent)                       |
| Resource Retrieval Agent     | Yes             | Tavily, Brave, Jina, ArXiv, PubMed, Wikipedia, YouTube |
| Resource Matcher Agent       | No              | –                                                      |
| Report Generator Agent       | No              | –                                                      |
| Supervisor Agent (LangGraph) | Yes             | LangGraph orchestration                                |

---

✅ So only **2 agents actually use tools**:

* **Resource Retrieval Agent** (external APIs)
* **Supervisor Agent** (LangGraph itself for orchestration)

All the others are **LLM-only** agents.