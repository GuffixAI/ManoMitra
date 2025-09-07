# 📝 1. Demo Report (Student-Facing)

👉 Goal: Make the student feel **understood + supported**, without overwhelming them.
👉 Style: Conversational, friendly, clear recommendations.

---

### Example (JSON → Rendered as Card UI in App)

```json
{
  "student_summary": "Based on your recent chat, it looks like you’ve been feeling stressed due to upcoming exams and experiencing some trouble sleeping.",
  "stress_level": "Moderate",
  "key_findings": [
    "Anxiety about academic performance",
    "Mild sleep issues",
    "No self-harm or severe risk detected"
  ],
  "suggested_actions": [
    "Try a 5-min breathing exercise daily",
    "Follow our relaxation audio before bedtime",
    "Read: 'Managing Exam Stress – A Student’s Guide'",
    "Join the peer support forum if you feel isolated"
  ],
  "helpful_resources": {
    "simple_guides": [
      {"title": "Mindfulness for Students", "url": "https://tavily.ai/..."}
    ],
    "videos": [
      {"title": "10-Min Guided Meditation", "url": "https://youtube.com/..."}
    ]
  },
  "encouragement": "You’re not alone. Many students feel this way during exams. Small daily steps can make a big difference 💙"
}
```

---

# 📝 2. Standard Report (Admin/Clinical-Facing)

👉 Goal: Give **counsellors & admin** a structured, evidence-based summary.
👉 Style: Formal, standardized metrics, anonymized.

---

### Example (JSON → Stored in DB / PDF)

```json
{
  "student_id": "anon_2025_083",
  "chat_summary": "Student expressed academic stress, mild anxiety, and sleep disturbances. No self-harm ideation. Expressed willingness to try relaxation techniques.",
  "risk_assessment": {
    "sentiment": "Anxious, Overwhelmed",
    "risk_level": "Moderate",
    "flags": []
  },
  "screening_scores": {
    "PHQ-9": 8,
    "GAD-7": 11,
    "GHQ": 4
  },
  "recommendations": {
    "resources": [
      {"category": "Wellness Guide", "title": "Managing Exam Stress", "source": "Brave", "url": "..."},
      {"category": "Research", "title": "Digital CBT for Students", "source": "PubMed", "url": "..."},
      {"category": "Meditation", "title": "Sleep Relaxation Exercise", "source": "YouTube", "url": "..."}
    ],
    "next_steps": [
      "Monitor academic stress in the next 2 weeks",
      "Encourage peer-support forum participation",
      "Schedule optional counselling if symptoms persist"
    ]
  },
  "analytics": {
    "top_stressors": ["Exams", "Sleep disruption"],
    "trend": "Moderate academic stress increasing near exams"
  },
  "report_generated_at": "2025-09-07T17:40:00Z"
}
```

---

# 🔑 Key Differences

| Feature       | Demo Report (Student)          | Standard Report (Admin)        |
| ------------- | ------------------------------ | ------------------------------ |
| **Tone**      | Friendly, encouraging          | Formal, clinical-style         |
| **Risk**      | Simplified (Low/Moderate/High) | Detailed with flags            |
| **Resources** | Few, easy-to-follow            | Comprehensive, research-backed |
| **Metrics**   | Hidden (or minimal)            | Full PHQ-9, GAD-7, GHQ scores  |
| **Audience**  | Student                        | Counsellors/Admin/Researchers  |

---

⚡So your **Supervisor Agent** will generate **both versions simultaneously**:

* **Demo Report** → returned to frontend → shown in UI
* **Standard Report** → stored in DB / sent to Admin Dashboard
