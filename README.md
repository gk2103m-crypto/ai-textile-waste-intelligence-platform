# ♻️ AI Textile Waste Intelligence Platform

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688.svg?logo=fastapi)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00.svg?logo=tensorflow)

An enterprise-grade, AI-powered platform designed to revolutionize textile waste management. By leveraging computer vision, material classification, and sustainability intelligence, the platform identifies fabric types, estimates recyclability, recommends optimal recycling/reuse strategies, and tracks environmental impacts (CO₂, water, and energy savings).

---

## 📖 Project Overview

The **Textile Waste Intelligence Platform** is built for recycling facility operators, fashion brands, sustainability managers, and textile manufacturers. It addresses the critical global challenge of textile waste by providing intelligent sorting, lifecycle tracking, and circular economy analytics.

By combining Deep Learning (CNNs) with robust Computer Vision guardrails, the platform delivers highly accurate defect detection and material classification, preventing "domain shift" hallucinations and ensuring flawless reporting for physical damage (e.g., holes, stains) versus normal wear.

---

## ✨ Core Features (The 13 Modules)

The platform is architected into 13 comprehensive modules to manage the end-to-end lifecycle of textile waste:

1. **User Authentication & Role-Based Access** — Secure JWT authentication for Admins, Facility Operators, Sustainability Managers, and Manufacturers.
2. **Textile Inventory & Waste Management** — Complete batch tracking, source management, and inventory monitoring.
3. **Textile Image Analysis Engine** — Real-time fabric, pattern, and texture detection.
4. **Material Classification Engine** — AI-driven fiber composition and blend identification (Cotton, Polyester, Wool, Silk, Denim, etc.).
5. **Textile Waste Classification Engine** — Recyclability and reuse potential assessment.
6. **Recycling Recommendation Engine** — Intelligent routing for mechanical/chemical recycling, direct reuse, or upcycling.
7. **Sustainability Intelligence Engine** — Circular economy and resource recovery analytics.
8. **Environmental Impact Assessment Engine** — Granular CO₂ savings, water conservation, and landfill diversion estimation.
9. **Waste Scoring Engine** — 5-factor weighted model generating a unified **Circularity Score** (0-100).
10. **Dashboard & Analytics** — Role-specific, data-rich dashboards with live KPI charts.
11. **Notification & Alert System** — Global, real-time toast notifications for operational events.
12. **Reports & Export System** — High-fidelity PDF and multi-sheet Excel exports for ESG compliance.
13. **Integration & Deployment** — Docker containerization, REST API validation, and production-ready CI/CD readiness.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React.js, Vite
* **Styling:** Tailwind CSS (Dark Mode supported)
* **Icons:** Lucide React
* **Charts:** Chart.js / Recharts

### Backend
* **Framework:** FastAPI (Python)
* **Database:** PostgreSQL (Primary), SQLite (Development Fallback)
* **Authentication:** JWT (JSON Web Tokens)

### AI & Machine Learning
* **Models:** TensorFlow, Keras (.h5 CNN models)
* **Computer Vision:** OpenCV (Hybrid ensemble verification)
* **Data Processing:** NumPy, Pandas

---

## 🚀 Installation & Setup

### Prerequisites
* **Node.js** (v16+)
* **Python** (3.9+)
* **PostgreSQL** (Optional for local dev, uses SQLite fallback)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/ai-textile-waste-intelligence-platform.git
cd ai-textile-waste-intelligence-platform
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
*The backend will be available at http://localhost:8000*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be available at http://localhost:5173*

---

## 🔐 Default Login Credentials

Upon fresh installation or database reset, use the following credentials to access the platform:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@textilewaste.ai` | `admin123` |
| **Facility Operator** | `operator@textilewaste.ai` | `operator123` |
| **Sustainability Manager**| `esg@textilewaste.ai` | `esg123` |
| **Textile Manufacturer** | `manufacturer@textilewaste.ai` | `manufacturer123` |

---

## 📊 Evaluation & Circularity Scoring

The core of our intelligence platform relies on a sophisticated 5-factor weighted algorithm:
* **Material Recyclability:** 35%
* **Material Condition:** 20%
* **Reuse Potential:** 20%
* **Environmental Benefit:** 15%
* **Processing Feasibility:** 10%

**Recovery Categories:**
🟢 85-100: Excellent | 🔵 70-84: High | 🟡 55-69: Moderate | 🟠 40-54: Limited | 🔴 0-39: Disposal

---

## 📄 License
This project is proprietary and confidential. © 2026 TextileWaste.AI
