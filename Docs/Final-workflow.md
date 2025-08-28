# **📌 MindMitra System Workflow**

*(Digital Mental Health & Psychological Support System)*

We’ll have **4 main user types**:

* 🧑‍🎓 **Student** → Uses chatbot, books counselling, accesses resources.
* 🧑‍🤝‍🧑 **Peer Volunteer** → Moderates forums, supports students.
* 🧑‍⚕️ **Counsellor** → Provides therapy, uploads resources.
* 🏢 **Admin (IQAC / Student Welfare)** → Gets anonymized insights.

---

## **1. High-Level Workflow Overview**

```
 Student ↔ AI Chatbot ↔ Multi-Agent Engine ↔ Resource Hub
        ↘ Peer Support Platform ↘ Counsellor Booking
         ↘ Screening Tools ↘ Analytics & Dashboards
```

---

## **2. Step-by-Step Workflow**

### **Step 1: Student Onboarding & Authentication** 🔐

* Student logs in via:

  * College Email / SSO / OTP.
* Roles assigned:

  * Student, Peer Volunteer, Counsellor, or Admin.
* Preferences collected:

  * Preferred **language**.
  * **Consent** for anonymous or identifiable usage.

---

### **Step 2: Mental Health Screening & Initial Assessment** 🧠

* Student fills out **PHQ-9 / GAD-7 / GHQ-12** questionnaires.
* System calculates a **well-being score**.
* Based on score:

  * **Mild stress** → Recommend AI chatbot + resource hub.
  * **Moderate stress** → Suggest peer support groups.
  * **Severe stress** → Suggest immediate counsellor booking or helpline.

---

### **Step 3: AI-Guided Mental Health Support** 🤖

* Student interacts with **Gemini-powered chatbot** (multimodal: text + voice + video).
* Chatbot:

  * Detects emotional tone + stress levels.
  * Suggests **coping strategies** (breathing, meditation, relaxation).
  * Summarizes conversations into **transcripts** → stored securely.
* If conversation suggests **suicidal ideation**:

  * System triggers **crisis escalation** → helpline + counsellor alert.

---

### **Step 4: Multi-Agent Recommendation Engine** 🌐

* After analyzing:

  * Chat history.
  * Screening scores.
  * Stress patterns.
* The **multi-agent system** fetches **personalized resources**:

  * Relaxation audios.
  * Guided meditation videos.
  * Mental wellness PDFs & guides.
* Uses **web search APIs + Gemini** to:

  * Pull latest **regional content**.
  * Filter based on **language preference**.
* Shows recommendations in **Resource Hub**.

---

### **Step 5: Confidential Booking System** 📅

* If the chatbot or screening tool detects need:

  * Student books a counselling session.
* Options:

  * **On-campus counsellor** → Integrated calendar.
  * **Virtual session** → Video link generated.
  * **Helpline numbers** displayed for emergencies.
* Appointments are **encrypted and confidential**.

---

### **Step 6: Peer Support Platform** 🧑‍🤝‍🧑

* Students join **anonymous forums** moderated by:

  * AI for toxicity detection.
  * **Trained peer volunteers**.
* Features:

  * Share experiences safely.
  * Discuss coping strategies.
  * One-on-one support from peer listeners.
* Points / badges for **active contributors**.

---

### **Step 7: Transcript Storage & Knowledge Base** 📝

* Every **chat, counselling session, and transcript** is:

  * Stored **securely** in database.
  * Encrypted at rest + in transit.
* Transcripts used for:

  * **Personalized AI advice**.
  * **Trend analytics** for admins.
  * **Counsellor reference** (if consented).

---

### **Step 8: Admin Dashboard & Analytics** 📊

* IQAC / Student Welfare Admins get:

  * Anonymous mental health statistics:

    * Stress & anxiety trends.
    * Resource usage patterns.
    * Most common issues.
  * AI-predicted **future risks**.
* No student names, IDs, or chat content → **strict anonymization**.

---

### **Step 9: Regional Language & Accessibility Layer** 🌐

* Entire system supports:

  * Hindi, English, Odia, Tamil, Telugu, Bengali, etc.
* AI responses localized via **Gemini + Translation API**.
* Resource Hub automatically fetches **regional videos, audios, and guides**.

---

### **Step 10: Continuous Personalization** 🎯

* System continuously learns from:

  * Chat transcripts.
  * Screening results.
  * Resource engagement.
* AI recommendations improve over time for:

  * Videos.
  * Meditation exercises.
  * Sleep guides.
  * Peer group matching.

---

## **3. End-to-End Data Flow**

### **Input Sources**

* Chat conversations.
* Screening results.
* Student preferences.
* Peer forum interactions.

### **Processing**

* **Gemini AI** → Emotional analysis + coping strategies.
* **Multi-agent system** → Web search + regional content fetch.
* **Screening scores** → Determine severity & personalization.
* **Transcript storage** → Builds personal + institutional insights.

### **Output Destinations**

* **For Student** → Personalized chat, videos, audios, PDFs, booking system.
* **For Counsellors** → Booking details, transcripts (if consented).
* **For Admins** → Anonymous analytics & policy insights.

---

## **4. Workflow Summary Table**

| **Module**             | **Input**                         | **Process**                    | **Output**                         |
| ---------------------- | --------------------------------- | ------------------------------ | ---------------------------------- |
| **Login & Auth**       | Student credentials               | Verify identity + assign role  | Secure session                     |
| **Screening Tools**    | PHQ-9, GAD-7, GHQ answers         | Score calculation              | Severity level                     |
| **AI Chatbot**         | Student messages + emotional tone | Gemini AI → coping strategies  | AI advice + transcripts            |
| **Multi-Agent Engine** | Screening + chat history          | Fetch content via web search   | Personalized videos, audios, PDFs  |
| **Resource Hub**       | Curated content + fetched results | Organize by type & language    | Wellness library                   |
| **Booking System**     | Student request + severity level  | Calendar + counsellor matching | Appointment confirmation           |
| **Peer Support**       | Forum posts, volunteer responses  | AI moderation + peer matching  | Anonymous student interaction      |
| **Transcript Storage** | Chat + booking session data       | Encryption + secure DB storage | Past conversations + insights      |
| **Admin Dashboard**    | Anonymous student data            | Trend analysis + AI prediction | Reports for IQAC & Student Welfare |