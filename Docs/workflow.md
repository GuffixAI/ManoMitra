Here’s a **detailed flowchart in Mermaid syntax** that illustrates the **complete workflow of MindMitra** — covering students, AI chatbot, screening tools, multi-agent recommendation system, counsellors, peer support, and admin dashboard.

```mermaid
flowchart TD

%% ==============================
%% MAIN ENTRY: STUDENT LOGIN
%% ==============================
A[Student Login & Authentication] -->|College Email / SSO / OTP| B{Role Assigned?}

B -->|Student| C1[Student Dashboard]
B -->|Peer Volunteer| C2[Peer Volunteer Dashboard]
B -->|Counsellor| C3[Counsellor Dashboard]
B -->|Admin| C4[Admin Dashboard]

%% ==============================
%% STUDENT WORKFLOW
%% ==============================
C1 --> D[Screening Tools: PHQ-9 / GAD-7 / GHQ-12]
D -->|Mild Stress| E1[AI Chatbot Support]
D -->|Moderate Stress| E2[Peer Support Platform]
D -->|Severe Stress| E3[Confidential Counselling Booking]

%% ==============================
%% AI CHATBOT FLOW
%% ==============================
E1 --> F[AI-Guided First-Aid Support]
F -->|Provides Coping Strategies| G1[Relaxation Exercises, Breathing Techniques, Stress Tips]
F -->|Detects Suicidal Thoughts| G2[Trigger Crisis Escalation]

G2 --> H1[Emergency Helpline]
G2 --> H2[On-campus Counsellor Alert]

%% Transcript Storage
F --> I1[Conversation Transcription Storage]
I1 --> I2["(Encrypted Database)"]
I2 -->|Used for| I3[Personalized AI Advice + Progress Tracking]

%% ==============================
%% MULTI-AGENT RESOURCE ENGINE
%% ==============================
F --> J[Multi-Agent Recommendation Engine]
J -->|Fetch Resources| J1[Web Search Toolkit + Gemini]
J -->|Filter by Language| J2[Regional Content Selection]
J --> J3[Personalized Resource Hub]

J3 --> K1[Videos: Meditation, Stress Relief]
J3 --> K2[Relaxation Audios, Podcasts]
J3 --> K3[Guides, PDFs, Wellness Articles]

%% ==============================
%% CONFIDENTIAL BOOKING SYSTEM
%% ==============================
E3 --> L[Confidential Booking System]
L --> L1[On-Campus Counsellor Session]
L --> L2[Virtual Video Counselling]
L --> L3[Mental Health Helpline]

%% ==============================
%% PEER SUPPORT PLATFORM
%% ==============================
E2 --> M[Peer Support Platform]
M --> M1[Anonymous Chat Forums]
M --> M2[Peer Volunteer Listeners]
M --> M3[AI Moderation for Safe Discussions]
M --> M4[Gamification: Points & Badges]

%% ==============================
%% COUNSELLOR WORKFLOW
%% ==============================
C3 --> N[Counsellor Portal]
N --> N1[View Appointment Requests]
N --> N2["Access Transcripts (Consent Based)"]
N --> N3[Upload Wellness Resources]
N --> N4[Track Student Progress]

%% ==============================
%% ADMIN WORKFLOW
%% ==============================
C4 --> O[Admin Dashboard]
O --> O1[Anonymous Data Analytics]
O --> O2[Stress & Anxiety Trend Graphs]
O --> O3[Department-wise Insights]
O --> O4[Policy Recommendations for IQAC]
O --> O5[Resource Usage Statistics]

%% ==============================
%% CONTINUOUS FEEDBACK LOOP
%% ==============================
I3 --> J
J3 --> E1
M4 --> E1
N4 --> O
O --> J
```

---

# **📌 Explanation of Flow**

### **1. Student Login & Role Assignment**

* Student logs in → system assigns role (Student, Peer, Counsellor, Admin).
* Depending on the role, each user sees a **different dashboard**.

---

### **2. Screening Tools**

* Students complete **PHQ-9, GAD-7, GHQ-12**.
* System decides the **severity**:

  * Mild → AI Chatbot.
  * Moderate → Peer Support.
  * Severe → Counsellor Booking.

---

### **3. AI Chatbot**

* Provides **coping strategies** (meditation, relaxation).
* Detects **crisis cases** (suicidal thoughts) → triggers emergency alerts.
* Stores **conversation transcripts** in an **encrypted database**.
* Transcripts later help in **personalized advice** & **trend analytics**.

---

### **4. Multi-Agent Recommendation Engine**

* Works alongside chatbot.
* Uses **Gemini + Web Search Toolkit** to fetch **real-time resources**.
* Filters resources by **regional languages**.
* Fills the **Resource Hub** with:

  * Videos (guided meditation, relaxation).
  * Relaxation audios, podcasts.
  * Wellness guides & PDFs.

---

### **5. Confidential Booking System**

* Students can schedule **sessions with counsellors**:

  * On-campus.
  * Virtual video counselling.
  * Or access **helplines** for emergencies.

---

### **6. Peer Support Platform**

* Anonymous forums.
* Trained **peer volunteers** available.
* AI moderates content for **toxicity prevention**.
* Students earn **gamification points** for positive engagement.

---

### **7. Counsellor Portal**

* Counsellors view **bookings & appointments**.
* Access student transcripts (if consent given).
* Upload resources for the **Resource Hub**.
* Track progress and provide follow-up.

---

### **8. Admin Dashboard**

* Admins see **anonymous data only** (no names, no IDs).
* Insights include:

  * Stress/Anxiety levels by department.
  * Usage statistics of chatbot, peer support, counselling.
  * Trends over time to guide **policy decisions**.

---

### **9. Continuous Feedback Loop**

* Data from transcripts, peer forums, counsellors, and admin insights feed back into:

  * Improving **AI chatbot responses**.
  * Enhancing the **resource hub**.
  * Shaping **institutional wellness programs**.

---