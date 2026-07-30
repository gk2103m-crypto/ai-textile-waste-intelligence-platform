# ♻️ AI Textile Waste Intelligence Platform

### Infosys Springboard Virtual Internship — Milestone 2 (Week 4) Submission

An enterprise-grade full-stack AI platform designed to automate textile waste sorting, material classification, defect detection, and recyclability assessment using Computer Vision and Deep Learning.

---

## 🎯 Milestone 2 Objectives & Achievements (Week 3 & Week 4)

In **Milestone 2**, we implemented the core **AI / Machine Learning Engines** and integrated them with our full-stack architecture:

- [x] **Material Classification Engine:** Operational 25-class CNN model (MobileNetV2 / TensorFlow) to identify fabric types (_Cotton, Denim, Silk, Wool, Velvet, Polyester, etc._) — validated with 76%+ confidence on test samples.
- [⚠️] **Defect & Condition Detection:** 9-class CNN model trained and integrated into the pipeline; currently under calibration to improve prediction accuracy across all condition categories. Material classification is fully validated; condition model refinement is in progress for Milestone 3.
- [x] **Recyclability Assessment Workflow:** Automated business logic mapping that calculates a **Circularity Score (/100)** and recommends recycling strategies based on detected material and condition:
  - _Good / Defect-Free (Score: 95+)_ ➔ **Direct Reuse / Resale**
  - _Torn / Damaged (Score: 70+)_ ➔ **Mechanical Recycling / Repair**
  - _Stained / Flawed (Score: 55+)_ ➔ **Chemical Recycling / Industrial Wash**
- [x] **Full-Stack AI Scanner Integration:** Integrated the Dual-AI Python pipeline with FastAPI backend endpoints (`POST /api/inventory/upload`) and React.js Frontend Interactive Scanner Modal.

---

## 🛠️ Tech Stack & Libraries Used

| Component                | Technology / Tools                                     |
| :----------------------- | :----------------------------------------------------- |
| **Backend Framework**    | Python 3.10+, FastAPI, Uvicorn                         |
| **AI / Computer Vision** | TensorFlow / Keras, MobileNetV2, OpenCV, Pillow, NumPy |
| **Frontend Framework**   | React.js, Tailwind CSS, Axios                          |
| **Database & ORM**       | PostgreSQL, SQLAlchemy                                 |
| **Version Control**      | Git & GitHub                                           |

---

## 🧠 AI Pipeline Architecture

1. **Image Preprocessing:** Input textile images are resized to `224x224` and normalized to `[0, 1]` tensor arrays.
2. **Dual-Model Inference (`ml_service.py`):**
   - **Model 1 (`material_classifier.h5`):** Predicts textile composition.
   - **Model 2 (`condition_classifier.h5`):** Identifies defect severity.
3. **Database Logging:** Scan results are automatically persisted to the PostgreSQL `WasteInventory` table with timestamp and circularity metrics.

---

## 🚀 How to Run the Project Locally

### 1. Start the FastAPI Backend

\`\`\`bash
cd backend

# Activate virtual environment

venv\Scripts\activate # Windows

# source venv/bin/activate # Linux/Mac

# Run Server

uvicorn main:app --reload
\`\`\`

### 2. Start the React Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Visit `http://localhost:5173` to access the platform.
